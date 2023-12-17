from django.conf.urls import url, include
from django.urls import path
from . import views
from .api import views as api_views
from rest_framework import routers, serializers, viewsets

router = routers.DefaultRouter()

urlpatterns = [
    path('api/project/<str:id>/files', api_views.ListSnapFilesView.as_view()),
    path('api/project/<str:id>', api_views.ProjectDetailView.as_view()),
    path('api/file/<int:id>', api_views.SnapFileDetailView.as_view()),
    url(r'^$', views.HomeView.as_view(), name='home'),
    url(r'^nav/$', views.NavView.as_view(), name='nav'),
    url(r'^impressum/$', views.ImpressumView.as_view(), name='impressum'),
    url(r'^open_project/$', views.OpenProjectView.as_view(), name='open_proj'),
    url(r'^restore_info/$', views.RestoreInfoView.as_view(), name='restore_info'),
    url(r'^howto/$', views.HowToView.as_view(), name='howto'),
    url(r'^create_project/$', views.CreateProjectView.as_view(), name='create_proj'),
    url(r'^(?P<proj_id>[-\w]+)$', views.ProjectView.as_view(), name='proj'),
    url(r'^info/(?P<proj_id>[-\w]+)$', views.InfoView.as_view(), name='info'),
    url(r'^merge/(?P<proj_id>[-\w]+)$', views.MergeView.as_view(), name='merge'),
    url(r'^sync/(?P<proj_id>[-\w]+)$', views.SyncView.as_view(), name='sync'),
    url(r'add/(?P<proj_id>[-\w]+)$',views.AddFileToProjectView.as_view(), name='add'),
    url(r'change_password/(?P<proj_id>[-\w]+)$', views.ChangePasswordView.as_view(), name='change_passwd'),
    url(r'change_name/(?P<proj_id>[-\w]+)$', views.ChangeNameView.as_view(), name='change_name'),
    url(r'change_description/(?P<proj_id>[-\w]+)$', views.ChangeDescriptionView.as_view(), name='change_description'),
    url(r'delete_proj/(?P<proj_id>[-\w]+)$', views.DeleteProjectView.as_view(), name='delete_proj'),
    url(r'^toggle_color/(?P<proj_id>[-\w]+)/(?P<file_id>[-\w]+)$', views.ToggleColorView.as_view(), name='toggle_color'),
    url(r'^merge_conf/*', views.ReactMergeView.as_view(), name='react_merge_conf'),
    url(r'^tmp/(?P<proj_id>[-\w]+)$', views.TmpView.as_view(), name='tmp'),
    url(r'^new_merge/(?P<proj_id>[-\w]+)$', views.NewMergeView.as_view(), name='new_merge'),
    url(r'^res_hunk/(?P<proj_id>[-\w]+)$', views.ResolveHunkView.as_view(), name='res_hunk'),
    url(r'^tmptmp/(?P<proj_id>[-\w]+)$', views.TmpTmpView.as_view(), name='tmptmp'),
    url(r'^jsredirect/(?P<file_id>[-\w]+)$', views.JsRedirectView.as_view(), name='jsredirect'),
    url(r'blockerXML/(?P<file_name>[-./\w]+)$',views.GetBlockerXMLView.as_view(), name='getBlockXML'),
]

# concat urlpatterns and router.urls
urlpatterns += router.urls
