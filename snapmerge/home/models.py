from django.db import models
from django.forms import ModelForm
from django.utils.translation import ugettext_lazy as _
from django.conf import settings
from django.core.validators import FileExtensionValidator
from .xmltools import analyze_file, include_sync_button
import uuid



class Project(models.Model):
    name = models.CharField(_("Name"), max_length=100)
    picture = models.FileField(_("Picture"), null=True, blank=True)
    description = models.CharField(_("Description"), max_length=200,
                                   null=True, blank=True)
    password = models.CharField(_("Password"), max_length=50, null=True, blank=True)
    pin = models.CharField(_("PIN"), max_length=6, unique=True)
    id = models.UUIDField(_("Id"), primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_("Email"), null=True, blank=True)


    @classmethod
    def create_and_save(cls, name, picture, description):
        proj = cls.objects.create(name=name, picture=picture, description=description, password=password)
        proj.save()
        return proj

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _("Project")
        verbose_name_plural = _("Projects")




class File(models.Model):
    # Format: YYYY-MM-DD HH:MM[:ss[.uuuuuu]][TZ]
    timestamp = models.DateTimeField(_("Timestamp"), auto_now_add=True, auto_now=False)
    project = models.ForeignKey(Project, on_delete =models.CASCADE)
    # https://docs.djangoproject.com/en/dev/ref/models/fields/#django.db.models.ManyToManyField.symmetrical
    ancestors = models.ManyToManyField("self", symmetrical=False)
    description = models.CharField(_("Description"), max_length=200,
                                   null=True, blank=True)
    number_scripts = models.IntegerField(_("number_scripts"), default=0)
    number_sprites = models.IntegerField(_("number_sprites"), default=0)

    class Meta:
        abstract = True


class SnapFile(File):
    # validates only naming of file
    file = models.FileField(_("File"), blank=True, validators=[FileExtensionValidator(['xml', 'XML'])])
    # thumbnail = models.ImageField(_("Thumbnail"), null=True, blank=True)
    user = models.CharField(_("user"), max_length=30, null=True)

    @classmethod
    def create_and_save(cls, project, file, ancestors=None, user=None, description=''):
        snap = cls.objects.create(project=project, file=file, user=user, description=description)
        if (ancestors):
            snap.ancestors.set(ancestors)

        snap.save()
        return snap

    def xml_job(self):
        include_sync_button(self.get_media_path(), proj_id=self.project.id, me=self.id)

        stats = analyze_file(self.get_media_path())
        self.number_scripts = stats[0]
        self.number_sprites = stats[1]

        self.save()

    def as_dict(self):
        ancestor_ids = [x.id for x in self.ancestors.all()]
        file_url = settings.MEDIA_URL + str(self.file)

        return {
            'id': self.id,
            'description': self.description,
            'ancestors': ancestor_ids,
            'file_url': file_url,
            'timestamp': str(self.timestamp),
            'number_scripts' : self.number_scripts,
            'number_sprites': self.number_sprites
        }

    def get_media_path(self):
        return settings.MEDIA_URL + str(self.file)

    class Meta:
        verbose_name = _("SnapFile")
        verbose_name_plural = _("SnapFiles")



class ProjectForm(ModelForm):
    class Meta:
        model = Project
        fields = ['name', 'description', 'password', 'email']
        labels = {
            'description': _('Description (optional)'),
            'password': _('Password (optional)'),
            'email': _('email (optional), for restoring password and pin'),
        }


class SnapFileForm(ModelForm):
    class Meta:
        model = SnapFile
        fields = ['file', 'description']
        labels = {
            'file': _('File (optional)'),
            'description': _('Description (optional)'),
        }