from django.contrib import admin
from .models import Project, SnapFile, ConflictFile, MergeConflict, Hunk, Settings
from django.urls import reverse
from django.utils.http import urlencode
from django.utils.html import format_html

admin.site.register(Project)
@admin.register(SnapFile)
class SnapFileAdmin(admin.ModelAdmin):
    list_display = ("file", "view_project_link", "description", "color", "xPosition", "yPosition", "collapsed", "hidden", "type")
    
    def view_project_link(self, obj):
        project_name = obj.project.name
        url = f"/admin/home/project/{obj.project_id}"
        return format_html('<a href="{}">{}</a>', url, project_name)

    view_project_link.short_description = "Project"
admin.site.register(ConflictFile)
admin.site.register(MergeConflict)
admin.site.register(Hunk)
# admin.site.register(Settings)
@admin.register(Settings)
class SettingsAdmin(admin.ModelAdmin):
    list_display = ("name", "value", "desc", "type")
