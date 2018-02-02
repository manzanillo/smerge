from django.db import models
from django.utils.translation import ugettext_lazy as _

# Create your models here.

class Project(models.Model):
    name = models.CharField(_("Name"), max_length=100)
    picture = models.FileField(_("Picture"), null=True, blank=True)
    description = models.CharField(_("Description"), max_length=200,
                                   null=True, blank=True)

    @classmethod
    def create_and_save(cls, name, picture, description):
        proj = cls.objects.create(name=name, picture=picture, description=description)
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
    project = models.ForeignKey(Project, on_delete ="cascade")
    # https://docs.djangoproject.com/en/dev/ref/models/fields/#django.db.models.ManyToManyField.symmetrical
    ancestors = models.ManyToManyField("self", symmetrical=False)


    class Meta:
        abstract = True


class SnapFile(File):
    file = models.FileField(_("File"))
    # thumbnail = models.ImageField(_("Thumbnail"), null=True, blank=True)
    user = models.CharField(_("user"), max_length=30, null=True)


    @classmethod
    def create_and_save(cls, project, file, ancestors=None, user=None):
        snap = cls.objects.create(project=project, file=file, user=user)
        if (ancestors):
            snap.ancestors.set(ancestors)
        snap.save()
        return snap

    class Meta:
        verbose_name = _("SnapFile")
        verbose_name_plural = _("SnapFiles")