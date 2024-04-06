from django.db import models
from django.forms import ModelForm
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.core.validators import FileExtensionValidator
from .xmltools import analyze_file, include_sync_button
from enum import Enum
import uuid
from django.db.models.signals import post_migrate
from django.dispatch import receiver


def default_color():
    return "#076AAB"


def default_favor_color():
    return "#417505"


def default_conflict_color():
    return "#d0021b"


class NodeTypes(Enum):
    DEFAULT = "default"
    MERGING = "merging"


class Project(models.Model):
    name = models.CharField(_("Name"), max_length=100)
    picture = models.FileField(_("Picture"), null=True, blank=True)
    description = models.CharField(
        _("Description"), max_length=200, null=True, blank=True
    )
    password = models.CharField(
        _("Password"), max_length=50, null=False, blank=True, default=""
    )
    pin = models.CharField(_("PIN"), max_length=6, unique=True)
    id = models.UUIDField(_("Id"), primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_("Email"), null=True, blank=True)
    default_color = models.CharField(
        _("node_color"), max_length=7, default=default_color()
    )
    favor_color = models.CharField(
        _("favor_color"), max_length=7, default=default_favor_color()
    )
    conflict_color = models.CharField(
        _("conflict_color"), max_length=7, default=default_conflict_color()
    )

    @classmethod
    def create_and_save(cls, name, picture, description, password=""):
        proj = cls.objects.create(
            name=name, picture=picture, description=description, password=password
        )
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
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    # https://docs.djangoproject.com/en/dev/ref/models/fields/#django.db.models.ManyToManyField.symmetrical
    ancestors = models.ManyToManyField(
        "self", symmetrical=False, related_name="children"
    )
    description = models.CharField(
        _("Description"), max_length=200, null=True, blank=True
    )
    number_scripts = models.IntegerField(_("number_scripts"), default=0)
    number_sprites = models.IntegerField(_("number_sprites"), default=0)
    color = models.CharField(_("color"), max_length=7, default=default_color())

    class Meta:
        abstract = True


def checkForCollisions(currentNode, ancestor):
    # check for near child collision from parent
    for child in ancestor.children.all():
        if (
            abs(child.xPosition - currentNode.xPosition)
            + abs(child.yPosition - currentNode.yPosition)
        ) < 20:
            currentNode.xPosition += 80


class SnapFile(File):
    # validates only naming of file
    file = models.FileField(
        _("File"),
        blank=True,
        validators=[FileExtensionValidator(["xml", "XML", "conflict"])],
    )
    # thumbnail = models.ImageField(_("Thumbnail"), null=True, blank=True)
    user = models.CharField(_("user"), max_length=30, null=True)
    xPosition = models.FloatField(_("xPosition"), default=0)
    yPosition = models.FloatField(_("yPosition"), default=0)
    collapsed = models.BooleanField(_("collapsed"), default=False)
    hidden = models.BooleanField(_("hidden"), default=False)
    collapsed_under = models.ForeignKey(
        "self",
        on_delete=models.DO_NOTHING,
        null=True,
        default=None,
        related_name="collapsed_above",
    )
    type = models.CharField(
        _("type"), max_length=30, null=True, default=NodeTypes.DEFAULT.value
    )

    @classmethod
    def create_and_save(cls, project, file, ancestors=None, user=None, description=""):
        snap = cls.objects.create(
            project=project, file=file, user=user, description=description
        )
        if ancestors:
            snap.ancestors.set(ancestors)
            if type(ancestors[0]) == str:
                ancestors_as_files = SnapFile.objects.filter(id__in=ancestors).all()
                newX = sum([a.xPosition for a in ancestors_as_files]) / len(
                    ancestors_as_files
                )
                newY = sum([a.yPosition for a in ancestors_as_files]) / len(
                    ancestors_as_files
                )
                snap.xPosition = newX
                snap.yPosition = newY + 100

                # check for near child collision from parent
                checkForCollisions(snap, ancestors_as_files[0])
            else:
                snap.xPosition = sum([a.xPosition for a in ancestors]) / len(ancestors)
                snap.yPosition = ancestors[0].yPosition + 100

                # check for near child collision from parent
                checkForCollisions(snap, ancestors[0])
        else:
            snap.xPosition = 1
            snap.yPosition = 1

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
        children_ids = [x.id for x in self.children.all()]

        return {
            "id": self.id,
            "description": self.description,
            "ancestors": ancestor_ids,
            "children": children_ids,
            "file_url": self.get_media_path(),
            "timestamp": str(self.timestamp),
            "number_scripts": self.number_scripts,
            "number_sprites": self.number_sprites,
            "color": self.color,
            "xPosition": self.xPosition,
            "yPosition": self.yPosition,
            "collapsed": self.collapsed,
            "hidden": self.hidden,
            "type": self.type,
        }

    def get_media_path(self):
        return settings.MEDIA_URL + str(self.file)

    class Meta:
        verbose_name = _("SnapFile")
        verbose_name_plural = _("SnapFiles")


class ProjectForm(ModelForm):
    class Meta:
        model = Project
        fields = ["name", "description", "password", "email"]
        labels = {
            "description": _("Description (optional)"),
            "password": _("Password (optional)"),
            "email": _("email (optional), for restoring password and pin"),
        }


class SnapFileForm(ModelForm):
    class Meta:
        model = SnapFile
        fields = ["file", "description"]
        labels = {
            "file": _("File (optional)"),
            "description": _("Description (optional)"),
        }


class ConflictFile(File):
    # validates only naming of file
    file = models.FileField(
        _("File"),
        blank=True,
        validators=[
            FileExtensionValidator(
                ["xml", "XML", "txt", "TXT", "base64", "BASE64", "atxt", "ATXT"]
            )
        ],
    )
    cx = models.FloatField("cx", null=True)
    cy = models.FloatField("cy", null=True)
    name = models.CharField("name", max_length=200, null=True, blank=True)

    @classmethod
    def create_and_save(
        cls, project, file, cx, cy, ancestors=None, description="", name=""
    ):
        confl = cls.objects.create(project=project, file=file, description=description)
        confl.cx = cx
        confl.cy = cy
        confl.name = name
        if ancestors:
            confl.ancestors.set(ancestors)

        confl.save()
        return confl

    def as_dict(self):
        ancestor_ids = [x.id for x in self.ancestors.all()]
        file_url = settings.MEDIA_URL + str(self.file)

        return {
            "id": self.id,
            "description": self.description,
            "ancestors": ancestor_ids,
            "file_url": file_url,
            "timestamp": str(self.timestamp),
            "number_scripts": self.number_scripts,
            "number_sprites": self.number_sprites,
            "color": self.color,
            "cx": self.cx if self.cx else "",
            "cy": self.cy if self.cy else "",
            "name": self.name if self.name else "",
        }

    def get_media_path(self):
        return settings.MEDIA_URL + str(self.file)

    class Meta:
        verbose_name = _("ConflictFile")
        verbose_name_plural = _("ConflictFiles")


class MergeConflict(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.DO_NOTHING, default="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    )
    left = models.ForeignKey(
        SnapFile, on_delete=models.DO_NOTHING, related_name="leftFile"
    )
    right = models.ForeignKey(
        SnapFile, on_delete=models.DO_NOTHING, related_name="rightFile"
    )
    connected_file = models.ForeignKey(
        SnapFile, on_delete=models.DO_NOTHING, related_name="connected_file", null=True
    )
    # hunks = models.fields


class Hunk(models.Model):
    mergeConflict = models.ForeignKey(MergeConflict, on_delete=models.DO_NOTHING)
    left = models.ForeignKey(
        ConflictFile, on_delete=models.CASCADE, related_name="leftHunk"
    )
    right = models.ForeignKey(
        ConflictFile, on_delete=models.CASCADE, related_name="rightHunk"
    )
    choice = models.CharField(_("choice"), max_length=30, null=True)
    parentPath = models.CharField("parentPath", max_length=255, null=True)
    parentImage = models.FileField(
        "parentImageFile",
        blank=True,
        validators=[FileExtensionValidator(["base64", "BASE64"])],
    )

    @classmethod
    def create_and_save(cls, left, right, mergeConflict, parentPath, parentImage):
        hunk = cls.objects.create(
            left=left,
            right=right,
            mergeConflict=mergeConflict,
            parentPath=parentPath,
            parentImage=parentImage,
        )

        hunk.save()
        return hunk

    def as_dict(self):
        return {
            "id": self.id,
            "left": self.left.as_dict(),
            "right": self.right.as_dict(),
            "choice": self.choice if self.choice != None else "",
            "parentPath": self.parentPath,
            "parentImage": self.get_media_path(),
        }

    def get_media_path(self):
        return settings.MEDIA_URL + str(self.parentImage)


class PasswordResetToken(models.Model):
    token = models.CharField(max_length=255, null=False, unique=True)
    timestamp = models.DateTimeField(_("Timestamp"), auto_now_add=True, auto_now=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True)

    @classmethod
    def create_and_save(cls, token, project):
        token = cls.objects.create(token=token, project=project)

        token.save()
        return token


class SettingsObjectTypes(Enum):
    """
    Enum Description:
    Specify the settings object type (for display purposes...)
    [int, string, bool]
    """

    typeInt = "int"
    typeString = "string"
    typeBoolean = "boolean"


class Settings(models.Model):
    name = models.CharField(max_length=255, null=False, unique=True)
    value = models.CharField(max_length=64, null=False)
    desc = models.CharField(max_length=255)
    type = models.CharField(
        max_length=30, null=True, default=SettingsObjectTypes.typeString.value
    )


# auto add default rows after migration if not found in db
@receiver(post_migrate)
def add_default_rows(sender, **kwargs):
    if not Settings.objects.filter(name="info_header_visible").exists():
        Settings.objects.create(
            name="info_header_visible",
            value="false",
            desc="Set the notification banner on the main page visible.",
            type=SettingsObjectTypes.typeBoolean.value,
        )
    if not Settings.objects.filter(name="info_header_text").exists():
        Settings.objects.create(
            name="info_header_text",
            value="",
            desc="The text visible in the notification banner of the main page.",
            type=SettingsObjectTypes.typeString.value,
        )
