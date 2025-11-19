from django.urls import path
from . import views

urlpatterns = [
    # ============================================
    # RESUME ANALYZER APIs
    # ============================================
    
    # Resume Analyzer
    # Experience Generation
    path('experience-gen', views.experience_generation, name='experience_generation'),

    # Project Generation
    path('project-gen', views.project_generation, name='project_generation'),

    # Skill Generation
    path('skill-gen', views.skill_generation, name='skill_generation'),
]
