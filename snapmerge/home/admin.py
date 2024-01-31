from django.contrib import admin
from .models import Project, SnapFile, ConflictFile, MergeConflict, Hunk

admin.site.register(Project)
admin.site.register(SnapFile)
admin.site.register(ConflictFile)
admin.site.register(MergeConflict)
admin.site.register(Hunk)
