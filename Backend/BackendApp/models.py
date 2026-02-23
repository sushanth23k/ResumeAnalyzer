from django.conf import settings
from django.db import models
from django.core.validators import RegexValidator, URLValidator
from django.core.exceptions import ValidationError
import uuid


# ─── Field Validators ─────────────────────────────────────────────────────────

email_validator = RegexValidator(
    regex=r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$',
    message='Enter a valid email address.',
)

linkedin_validator = RegexValidator(
    regex=r'^https?://(www\.)?linkedin\.com/',
    message='Enter a valid LinkedIn URL.',
)

github_validator = RegexValidator(
    regex=r'^https?://(www\.)?github\.com/',
    message='Enter a valid GitHub URL.',
)

url_validator = URLValidator(schemes=['http', 'https'])


def validate_status(value):
    valid_statuses = ['Applied', 'Rejected', 'Timed out', 'Processed', 'Accepted', 'Interview']
    if value not in valid_statuses:
        raise ValidationError(f'Status must be one of: {", ".join(valid_statuses)}')


# ─── Models ───────────────────────────────────────────────────────────────────

class ApplicantBasicInfo(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='basic_info',
    )
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(validators=[email_validator])
    linkedin_url = models.URLField(max_length=500, blank=True, null=True, validators=[linkedin_validator])
    github_url = models.URLField(max_length=500, blank=True, null=True, validators=[github_validator])
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = '"resumeanalyzer"."applicant_basic_info"'
        verbose_name = 'Applicant Basic Information'
        verbose_name_plural = 'Applicant Basic Information'

    def __str__(self):
        return self.full_name


class Academics(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='academics',
    )
    college_name = models.CharField(max_length=255)
    graduation_date = models.CharField(max_length=50)
    course = models.CharField(max_length=255)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = '"resumeanalyzer"."academics"'
        verbose_name = 'Academic'
        verbose_name_plural = 'Academics'
        ordering = ['display_order']
        indexes = [
            models.Index(fields=['user', 'display_order'], name='idx_academics_user_order'),
        ]

    def __str__(self):
        return f"{self.college_name} - {self.course}"


class Achievements(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='achievements',
    )
    achievement_point = models.TextField()
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = '"resumeanalyzer"."achievements"'
        verbose_name = 'Achievement'
        verbose_name_plural = 'Achievements'
        ordering = ['display_order']
        indexes = [
            models.Index(fields=['user', 'display_order'], name='idx_achievements_user_order'),
        ]

    def __str__(self):
        return self.achievement_point[:50] + '...' if len(self.achievement_point) > 50 else self.achievement_point


class Skills(models.Model):
    """Global master skills catalog shared across all users."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    skill_name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = '"resumeanalyzer"."skills"'
        verbose_name = 'Skill'
        verbose_name_plural = 'Skills'
        indexes = [
            models.Index(fields=['skill_name'], name='idx_skills_name'),
            models.Index(fields=['category'], name='idx_skills_category'),
        ]

    def __str__(self):
        return self.skill_name


class UserSkills(models.Model):
    """Per-user skill selections from the global skills catalog."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_skills',
    )
    skill = models.ForeignKey(Skills, on_delete=models.CASCADE, related_name='user_skills')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = '"resumeanalyzer"."user_skills"'
        verbose_name = 'User Skill'
        verbose_name_plural = 'User Skills'
        unique_together = [['user', 'skill']]
        indexes = [
            models.Index(fields=['user', 'skill'], name='idx_user_skills_user_skill'),
        ]

    def __str__(self):
        return f"{self.user_id} — {self.skill.skill_name}"


class Projects(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='projects',
    )
    project_name = models.CharField(max_length=255)
    project_info = models.TextField()
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = '"resumeanalyzer"."projects"'
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'
        ordering = ['display_order']
        indexes = [
            models.Index(fields=['user', 'display_order'], name='idx_projects_user_order'),
        ]

    def __str__(self):
        return self.project_name


class ProjectSkills(models.Model):
    """Junction table linking skills to a specific project."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Projects, on_delete=models.CASCADE, related_name='project_skills')
    skill = models.ForeignKey(Skills, on_delete=models.CASCADE, related_name='project_skills')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = '"resumeanalyzer"."project_skills"'
        verbose_name = 'Project Skill'
        verbose_name_plural = 'Project Skills'
        unique_together = [['project', 'skill']]
        indexes = [
            models.Index(fields=['project'], name='idx_project_skills_project_id'),
            models.Index(fields=['skill'], name='idx_project_skills_skill_id'),
        ]

    def __str__(self):
        return f"{self.project.project_name} — {self.skill.skill_name}"


class Experiences(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='experiences',
    )
    experience_name = models.CharField(max_length=255)
    start_date = models.CharField(max_length=50)
    end_date = models.CharField(max_length=50)
    role = models.CharField(max_length=255, blank=True, null=True)
    location = models.CharField(max_length=50, blank=True, null=True)
    experience_explanation = models.TextField()
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = '"resumeanalyzer"."experiences"'
        verbose_name = 'Experience'
        verbose_name_plural = 'Experiences'
        ordering = ['display_order']
        indexes = [
            models.Index(fields=['user', 'display_order'], name='idx_experiences_user_order'),
        ]

    def __str__(self):
        return f"{self.experience_name} — {self.role}"


class Applications(models.Model):
    STATUS_CHOICES = [
        ('Applied', 'Applied'),
        ('Rejected', 'Rejected'),
        ('Timed out', 'Timed out'),
        ('Processed', 'Processed'),
        ('Accepted', 'Accepted'),
        ('Interview', 'Interview'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='applications',
    )
    job_name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    job_link = models.URLField(max_length=500, validators=[url_validator])
    resume_file_path = models.CharField(max_length=500)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Applied', validators=[validate_status])
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = '"resumeanalyzer"."applications"'
        verbose_name = 'Application'
        verbose_name_plural = 'Applications'
        indexes = [
            models.Index(fields=['user', 'status'], name='idx_applications_user_status'),
            models.Index(fields=['user', 'company_name'], name='idx_applications_user_company'),
        ]

    def __str__(self):
        return f"{self.job_name} at {self.company_name} — {self.status}"
