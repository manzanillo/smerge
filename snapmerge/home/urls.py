from django.urls import path, re_path
from . import views
from .api import views as api_views
from rest_framework import routers
from rest_framework.authtoken import views as authviews


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

def setup_tutorial_cleanup_job():
    scheduler = BackgroundScheduler()
    # Execute the job immediately
    scheduler.add_job(run_tutorial_cleanup)
    # Execute the job every 24 hours
    scheduler.add_job(run_tutorial_cleanup, "interval", hours=24)
    scheduler.start()

def run_tutorial_cleanup():
    # Delete tutorial projects older than 24 hours
    management.call_command("tutorialcleanup")

router = routers.DefaultRouter()

urlpatterns = [
    # Tutorial
    path("api/tutorial/create", api_views.CreateTutorialProjectView.as_view()),
    path("api/tutorial/project/<str:project_id>/add_merge_node", api_views.AddTutorialMergeNodeView.as_view()),
    path("api/tutorial/project/<str:project_id>/cleanup", api_views.CleanupTutorialProjectView.as_view()),

    path("api/public/settings", api_views.SettingsView.as_view()),
    path("api/auth/csrf", api_views.CsrfCookieView.as_view()),
    path("api/teacher_login_token", api_views.CustomAuthToken.as_view()),
    path("api/teacher_registration_token", api_views.RegisterTeacherView.as_view()),
    path("api/teacher/tutorial-status", api_views.TeacherTutorialStatusView.as_view()),
    path("api/public/open_project", api_views.PublicProjectOpenView.as_view()),
    path("api/public/create_project", api_views.PublicProjectCreateView.as_view()),
    path("api/public/restore_info", api_views.PublicRestoreInfoView.as_view()),
    path("api/public/reset_password/<str:token>", api_views.PublicResetPasswordView.as_view(), name="reset_passwd"),
    path("api/schoolclasses", api_views.SchoolClassesView.as_view()),
    path("api/schoolclasses/<str:id>", api_views.SchoolClassUpdateView.as_view()),
    path("api/teachers/<str:id>/schoolclasses", api_views.SchoolClassesForTeacherView.as_view()),
    path("api/schoolclasses/<str:id>/projects", api_views.ProjectsForSchoolClassesView.as_view()),
    path("api/projects", api_views.ProjectCreationFromTeacherView.as_view()),
    path("api/projects/with_pin/<str:id>", api_views.ProjectRetrieverWithPin.as_view()),
    path("api/project/<str:id>/files", api_views.ListSnapFilesView.as_view()),
    path("api/project/<str:id>/duplicate", api_views.DuplicateProject.as_view()),
    path("api/project/<str:id>", api_views.ProjectDetailView.as_view()),
    path("api/project/<str:id>/unhide_all", api_views.UnhideAllView.as_view()),
    path("api/update/project/<str:id>", api_views.ProjectDetailUpdateView.as_view()),
    path("api/update/project/<str:id>/import", api_views.ProjectImportUpdateView.as_view()),
    path("api/update/kanban/<str:id>", api_views.ProjectUpdateKanbanView.as_view()),
    path("api/update/password/<str:id>", api_views.ProjectChangePasswordView.as_view()),
    path("api/delete/project/<str:id>", api_views.ProjectDeleteView.as_view()),
    path("api/delete/conflict/<str:id>", api_views.MergeConflictDeleteView.as_view()),
    path("api/update/project_colors/<str:id>", api_views.ProjectColorUpdateView.as_view()),
    path("api/update/node_desc/<str:id>", api_views.NodeLabelUpdateView.as_view()),
    path("api/file/<int:id>", api_views.SnapFileDetailView.as_view()),
    path("api/file/<int:id>/position", api_views.SnapFilePositionView.as_view()),
    path("api/file/<int:id>/positions", api_views.SnapFilePositionsView.as_view()),
    path("file/<int:id>/positions", api_views.SnapFilePositionsView.as_view()),
    re_path(r"^admin/test/event/", views.index, name="index"),
    re_path(r"^action/merge/(?P<proj_id>[-\w]+)$", views.MergeView.as_view(), name="merge"),
    re_path(r"^action/sync/(?P<proj_id>[-\w]+)$", views.SyncView.as_view(), name="sync"),
    re_path(
        r"^action/add/(?P<proj_id>[-\w]+)$", views.AddFileToProjectView.as_view(), name="add"
    ),
    re_path(
        r"^action/change_name/(?P<proj_id>[-\w]+)$",
        views.ChangeNameView.as_view(),
        name="change_name",
    ),
    re_path(
        r"^action/change_description/(?P<proj_id>[-\w]+)$",
        views.ChangeDescriptionView.as_view(),
        name="change_description",
    ),
    re_path(
        r"^action/delete_proj/(?P<proj_id>[-\w]+)$",
        views.DeleteProjectView.as_view(),
        name="delete_proj",
    ),
    re_path(
        r"^action/toggle_color/(?P<proj_id>[-\w]+)/(?P<file_id>[-\w]+)$",
        views.ToggleColorView.as_view(),
        name="toggle_color",
    ),
    re_path(
        r"^action/getConflict/(?P<proj_id>[-\w]+)$",
        views.GetConflictsView.as_view(),
        name="get_confs",
    ),
    re_path(
        r"^action/new_merge/(?P<proj_id>[-\w]+)$",
        views.NewMergeView.as_view(),
        name="new_merge",
    ),
    re_path(
        r"^action/res_hunk/(?P<proj_id>[-\w]+)$",
        views.ResolveHunkView.as_view(),
        name="res_hunk",
    ),
    re_path(
        r"^action/collapse_node/(?P<node_id>[-\w]+)$",
        views.ToggleCollapseView.as_view(),
        name="collapse_node",
    ),
    re_path(
        r"^action/blockerXML/(?P<file_name>[-./\w]+)$",
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

# schedule a job that deletes tutorial projects older than 24 hours
if (
    not hasattr(settings, "DISABLE_TUTORIAL_CLEANUP")
    or not settings.DISABLE_TUTORIAL_CLEANUP
):
    setup_tutorial_cleanup_job()
