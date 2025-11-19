from django.urls import path
from . import views

urlpatterns = [
    # ============================================
    # APPLICANT INFORMATION APIs
    # ============================================
    
    # Basic Information
    path('applicant-info/basic', views.basic_info, name='basic_info'),
    
    # Academics
    path('applicant-info/academics', views.academics, name='academics'),
    
    # Achievements
    path('applicant-info/achievements', views.achievements, name='achievements'),
    
    # Skills (Master List)
    path('skills', views.skills, name='skills'),
    
    # User Skills
    path('applicant-info/skills', views.user_skills, name='user_skills'),
    
    # Projects
    path('applicant-info/projects', views.projects, name='projects'),
    
    # Experiences
    path('applicant-info/experiences', views.experiences, name='experiences'),
    
    # Complete Applicant Info
    path('applicant-info/complete', views.complete_applicant_info, name='complete_applicant_info'),
    
    # ============================================
    # APPLICATIONS APIs
    # ============================================
    
    # Applications
    path('applications', views.applications, name='applications'),
    
    # Application Statistics
    path('applications/stats', views.application_stats, name='application_stats'),
    
    # ============================================
    # RESUME FILE MANAGEMENT API
    # ============================================
    
    # Resume File Operations
    path('resume', views.resume_file, name='resume_file'),
]
