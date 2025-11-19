from django.db import models
from django.core.validators import RegexValidator, URLValidator
from django.core.exceptions import ValidationError
import uuid


# Email validator
email_validator = RegexValidator(
    regex=r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$',
    message='Enter a valid email address.'
)

# LinkedIn URL validator
linkedin_validator = RegexValidator(
    regex=r'^https?://(www\.)?linkedin\.com/',
    message='Enter a valid LinkedIn URL.'
)

# GitHub URL validator
github_validator = RegexValidator(
    regex=r'^https?://(www\.)?github\.com/',
    message='Enter a valid GitHub URL.'
)

# HTTP/HTTPS URL validator
url_validator = URLValidator(schemes=['http', 'https'])


def validate_status(value):
    """Validate application status"""
    valid_statuses = ['Applied', 'Rejected', 'Timed out', 'Processed', 'Accepted', 'Interview']
    if value not in valid_statuses:
        raise ValidationError(f'Status must be one of: {", ".join(valid_statuses)}')


class ApplicantBasicInfo(models.Model):
    """
    Applicant Basic Information Table
    Stores personal information of the applicant
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(unique=True, validators=[email_validator])
    linkedin_url = models.URLField(max_length=500, blank=True, null=True, validators=[linkedin_validator])
    github_url = models.URLField(max_length=500, blank=True, null=True, validators=[github_validator])
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'applicant_basic_info'
        verbose_name = 'Applicant Basic Information'
        verbose_name_plural = 'Applicant Basic Information'
        indexes = [
            models.Index(fields=['email'], name='idx_applicant_basic_info_email'),
        ]

    def __str__(self):
        return self.full_name


class Academics(models.Model):
    """
    Academics Table
    Stores educational background information
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    college_name = models.CharField(max_length=255)
    graduation_date = models.CharField(max_length=50)  # Stored as string for flexibility
    course = models.CharField(max_length=255)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'academics'
        verbose_name = 'Academic'
        verbose_name_plural = 'Academics'
        ordering = ['display_order']
        indexes = [
            models.Index(fields=['display_order'], name='idx_academics_display_order'),
        ]

    def __str__(self):
        return f"{self.college_name} - {self.course}"


class Achievements(models.Model):
    """
    Achievements Table
    Stores achievement points
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    achievement_point = models.TextField()
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'achievements'
        verbose_name = 'Achievement'
        verbose_name_plural = 'Achievements'
        ordering = ['display_order']
        indexes = [
            models.Index(fields=['display_order'], name='idx_achievements_display_order'),
        ]

    def __str__(self):
        return self.achievement_point[:50] + '...' if len(self.achievement_point) > 50 else self.achievement_point


class Skills(models.Model):
    """
    Skills Table (Master Skills List)
    Stores all available skills
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    skill_name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'skills'
        verbose_name = 'Skill'
        verbose_name_plural = 'Skills'
        indexes = [
            models.Index(fields=['skill_name'], name='idx_skills_name'),
            models.Index(fields=['category'], name='idx_skills_category'),
        ]

    def __str__(self):
        return self.skill_name


class UserSkills(models.Model):
    """
    User Skills Table (Junction Table)
    Links skills to the single user's skill list
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    skill = models.OneToOneField(Skills, on_delete=models.CASCADE, related_name='user_skill')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_skills'
        verbose_name = 'User Skill'
        verbose_name_plural = 'User Skills'
        indexes = [
            models.Index(fields=['skill'], name='idx_user_skills_skill_id'),
        ]

    def __str__(self):
        return f"User Skill: {self.skill.skill_name}"


class Projects(models.Model):
    """
    Projects Table
    Stores project information
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project_name = models.CharField(max_length=255)
    project_info = models.TextField()
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'projects'
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'
        ordering = ['display_order']
        indexes = [
            models.Index(fields=['display_order'], name='idx_projects_display_order'),
        ]

    def __str__(self):
        return self.project_name


class ProjectSkills(models.Model):
    """
    Project Skills Table (Junction Table)
    Links skills to specific projects
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Projects, on_delete=models.CASCADE, related_name='project_skills')
    skill = models.ForeignKey(Skills, on_delete=models.CASCADE, related_name='project_skills')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'project_skills'
        verbose_name = 'Project Skill'
        verbose_name_plural = 'Project Skills'
        unique_together = [['project', 'skill']]
        indexes = [
            models.Index(fields=['project'], name='idx_project_skills_project_id'),
            models.Index(fields=['skill'], name='idx_project_skills_skill_id'),
        ]

    def __str__(self):
        return f"{self.project.project_name} - {self.skill.skill_name}"


class Experiences(models.Model):
    """
    Experiences Table
    Stores work experience information
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    experience_name = models.CharField(max_length=255)
    start_date = models.CharField(max_length=50)  # Stored as string for flexibility
    end_date = models.CharField(max_length=50)  # Stored as string for flexibility
    role = models.CharField(max_length=255, blank=True, null=True)
    location = models.CharField(max_length=50, blank=True, null=True)
    experience_explanation = models.TextField()
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'experiences'
        verbose_name = 'Experience'
        verbose_name_plural = 'Experiences'
        ordering = ['display_order']
        indexes = [
            models.Index(fields=['display_order'], name='idx_experiences_display_order'),
        ]

    def __str__(self):
        return f"{self.experience_name} - {self.role}"


class Applications(models.Model):
    """
    Applications Table
    Stores job application information including resume file path
    """
    STATUS_CHOICES = [
        ('Applied', 'Applied'),
        ('Rejected', 'Rejected'),
        ('Timed out', 'Timed out'),
        ('Processed', 'Processed'),
        ('Accepted', 'Accepted'),
        ('Interview', 'Interview'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    job_link = models.URLField(max_length=500, validators=[url_validator])
    resume_file_path = models.CharField(max_length=500)  # Path to resume file in ResumeBlobs folder
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Applied', validators=[validate_status])
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'applications'
        verbose_name = 'Application'
        verbose_name_plural = 'Applications'
        indexes = [
            models.Index(fields=['status'], name='idx_applications_status'),
            models.Index(fields=['company_name'], name='idx_applications_company_name'),
        ]

    def __str__(self):
        return f"{self.job_name} at {self.company_name} - {self.status}"
