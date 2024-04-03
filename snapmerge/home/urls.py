from django.conf.urls import include
from django.urls import path, re_path
from . import views
from .api import views as api_views
from rest_framework import routers, serializers, viewsets

import django_eventstream
from . import consumers

from apscheduler.schedulers.background import BackgroundScheduler
from django.core import management
from django.conf import settings


def setup_token_invalidator_job():
    scheduler = BackgroundScheduler()
    # Execute the job immediately
    scheduler.add_job(run_token_invalidator)
    # Execute the job every 30 seconds
    scheduler.add_job(run_token_invalidator, "interval", days=1)
    scheduler.start()


def run_token_invalidator():
    management.call_command("resettokencleanup", W=1)


router = routers.DefaultRouter()

urlpatterns = [
    path("api/project/<str:id>/files", api_views.ListSnapFilesView.as_view()),
    path("api/project/<str:id>", api_views.ProjectDetailView.as_view()),
    path("api/project/<str:id>/unhide_all", api_views.UnhideAllView.as_view()),
    path("api/update/project/<str:id>", api_views.ProjectDetailUpdateView.as_view()),
    path("api/update/password/<str:id>", api_views.ProjectChangePasswordView.as_view()),
    path("api/delete/project/<str:id>", api_views.ProjectDeleteView.as_view()),
    path("api/delete/conflict/<str:id>", api_views.MergeConflictDeleteView.as_view()),
    path(
        "api/update/project_colors/<str:id>", api_views.ProjectColorUpdateView.as_view()
    ),
    path("api/update/node_desc/<str:id>", api_views.NodeLabelUpdateView.as_view()),
    path("api/file/<int:id>", api_views.SnapFileDetailView.as_view()),
    path("api/file/<int:id>/position", api_views.SnapFilePositionView.as_view()),
    path("api/file/<int:id>/positions", api_views.SnapFilePositionsView.as_view()),
    # path('api/project/')
    re_path("api/sendEventPing", views.SendEventPing.as_view(), name="sendEventPing"),
    # re_path(r'^ws/([-\w]+)', consumers.ChatConsumer.as_asgi()),
    # path('events/', include(django_eventstream.urls), {'channels': ['test']}),
    re_path(r"^test/event/", views.index, name="index"),
    re_path(r"^$", views.HomeView.as_view(), name="home"),
    re_path(r"^nav/$", views.NavView.as_view(), name="nav"),
    re_path(r"^impressum/$", views.ImpressumView.as_view(), name="impressum"),
    re_path(r"^open_project/$", views.OpenProjectView.as_view(), name="open_proj"),
    re_path(r"^restore_info/$", views.RestoreInfoView.as_view(), name="restore_info"),
    path(
        "reset_password/<str:token>",
        views.ResetPasswordView.as_view(),
        name="reset_passwd",
    ),
    re_path(r"^howto/$", views.HowToView.as_view(), name="howto"),
    re_path(
        r"^create_project/$", views.CreateProjectView.as_view(), name="create_proj"
    ),
    re_path(r"^(?P<proj_id>[-\w]+)$", views.ProjectView.as_view(), name="proj"),
    re_path(r"^merge/(?P<proj_id>[-\w]+)$", views.MergeView.as_view(), name="merge"),
    re_path(r"^sync/(?P<proj_id>[-\w]+)$", views.SyncView.as_view(), name="sync"),
    re_path(
        r"add/(?P<proj_id>[-\w]+)$", views.AddFileToProjectView.as_view(), name="add"
    ),
    re_path(
        r"change_name/(?P<proj_id>[-\w]+)$",
        views.ChangeNameView.as_view(),
        name="change_name",
    ),
    re_path(
        r"change_description/(?P<proj_id>[-\w]+)$",
        views.ChangeDescriptionView.as_view(),
        name="change_description",
    ),
    re_path(
        r"delete_proj/(?P<proj_id>[-\w]+)$",
        views.DeleteProjectView.as_view(),
        name="delete_proj",
    ),
    re_path(
        r"^toggle_color/(?P<proj_id>[-\w]+)/(?P<file_id>[-\w]+)$",
        views.ToggleColorView.as_view(),
        name="toggle_color",
    ),
    re_path(r"^merge_conf/*", views.ReactMergeView.as_view(), name="react_merge_conf"),
    re_path(r"^tmp/(?P<proj_id>[-\w]+)$", views.TmpView.as_view(), name="tmp"),
    re_path(
        r"^new_merge/(?P<proj_id>[-\w]+)$",
        views.NewMergeView.as_view(),
        name="new_merge",
    ),
    re_path(
        r"^res_hunk/(?P<proj_id>[-\w]+)$",
        views.ResolveHunkView.as_view(),
        name="res_hunk",
    ),
    re_path(
        r"^collapse_node/(?P<node_id>[-\w]+)$",
        views.ToggleCollapseView.as_view(),
        name="collapse_node",
    ),
    re_path(r"^tmptmp/(?P<proj_id>[-\w]+)$", views.TmpTmpView.as_view(), name="tmptmp"),
    re_path(
        r"^jsredirect/(?P<file_id>[-\w]+)$",
        views.JsRedirectView.as_view(),
        name="jsredirect",
    ),
    re_path(
        r"blockerXML/(?P<file_name>[-./\w]+)$",
        views.GetBlockerXMLView.as_view(),
        name="getBlockXML",
    ),
]

# concat urlpatterns and router.urls
urlpatterns += router.urls

# schedule each day a job that deletes password reset tokens that are older than one week
if (
    not hasattr(settings, "DISABLE_TOKEN_INVALIDATION")
    or not settings.DISABLE_TOKEN_INVALIDATION
):
    setup_token_invalidator_job()
