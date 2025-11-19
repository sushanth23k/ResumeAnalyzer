from django.contrib import admin
from .models import (
    ApplicantBasicInfo,
    Academics,
    Achievements,
    Skills,
    UserSkills,
    Projects,
    ProjectSkills,
    Experiences,
    Applications
)


@admin.register(ApplicantBasicInfo)
class ApplicantBasicInfoAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'phone_number', 'created_at')
    search_fields = ('full_name', 'email', 'phone_number')
    list_filter = ('created_at',)


@admin.register(Academics)
class AcademicsAdmin(admin.ModelAdmin):
    list_display = ('college_name', 'course', 'graduation_date', 'display_order')
    search_fields = ('college_name', 'course')
    list_filter = ('display_order',)
    ordering = ('display_order',)


@admin.register(Achievements)
class AchievementsAdmin(admin.ModelAdmin):
    list_display = ('achievement_point', 'display_order', 'created_at')
    search_fields = ('achievement_point',)
    list_filter = ('display_order', 'created_at')
    ordering = ('display_order',)


@admin.register(Skills)
class SkillsAdmin(admin.ModelAdmin):
    list_display = ('skill_name', 'category', 'created_at')
    search_fields = ('skill_name', 'category')
    list_filter = ('category', 'created_at')


@admin.register(UserSkills)
class UserSkillsAdmin(admin.ModelAdmin):
    list_display = ('skill', 'created_at')
    search_fields = ('skill__skill_name',)
    list_filter = ('created_at',)


@admin.register(Projects)
class ProjectsAdmin(admin.ModelAdmin):
    list_display = ('project_name', 'display_order', 'created_at')
    search_fields = ('project_name', 'project_info')
    list_filter = ('display_order', 'created_at')
    ordering = ('display_order',)


@admin.register(ProjectSkills)
class ProjectSkillsAdmin(admin.ModelAdmin):
    list_display = ('project', 'skill', 'created_at')
    search_fields = ('project__project_name', 'skill__skill_name')
    list_filter = ('created_at',)


@admin.register(Experiences)
class ExperiencesAdmin(admin.ModelAdmin):
    list_display = ('experience_name', 'role', 'start_date', 'end_date', 'display_order')
    search_fields = ('experience_name', 'role', 'experience_explanation')
    list_filter = ('display_order', 'created_at')
    ordering = ('display_order',)


@admin.register(Applications)
class ApplicationsAdmin(admin.ModelAdmin):
    list_display = ('job_name', 'company_name', 'status', 'created_at')
    search_fields = ('job_name', 'company_name', 'notes')
    list_filter = ('status', 'created_at', 'company_name')
    ordering = ('-created_at',)
