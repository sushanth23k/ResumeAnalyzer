from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication endpoints
    path('auth/', include('AuthApp.urls')),

    # Core resume-builder API
    path('api/', include('BackendApp.urls')),

    # AI generation endpoints
    path('analyzer/', include('AnalyzerApp.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
