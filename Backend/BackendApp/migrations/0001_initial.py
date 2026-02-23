# Generated migration — targets the `resumeanalyzer` schema in the `general` database.
# The first RunSQL operation creates the schema before any tables are created.

import BackendApp.models
import django.core.validators
import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # ── Schema creation (idempotent) ─────────────────────────────────────
        migrations.RunSQL(
            sql="CREATE SCHEMA IF NOT EXISTS resumeanalyzer;",
            reverse_sql=migrations.RunSQL.noop,
        ),

        # ── ApplicantBasicInfo ───────────────────────────────────────────────
        migrations.CreateModel(
            name="ApplicantBasicInfo",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("full_name", models.CharField(max_length=255)),
                ("phone_number", models.CharField(max_length=20)),
                (
                    "email",
                    models.EmailField(
                        max_length=254,
                        validators=[
                            django.core.validators.RegexValidator(
                                message="Enter a valid email address.",
                                regex="^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
                            )
                        ],
                    ),
                ),
                (
                    "linkedin_url",
                    models.URLField(
                        blank=True,
                        max_length=500,
                        null=True,
                        validators=[
                            django.core.validators.RegexValidator(
                                message="Enter a valid LinkedIn URL.",
                                regex="^https?://(www\\.)?linkedin\\.com/",
                            )
                        ],
                    ),
                ),
                (
                    "github_url",
                    models.URLField(
                        blank=True,
                        max_length=500,
                        null=True,
                        validators=[
                            django.core.validators.RegexValidator(
                                message="Enter a valid GitHub URL.",
                                regex="^https?://(www\\.)?github\\.com/",
                            )
                        ],
                    ),
                ),
                ("address", models.TextField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="basic_info",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Applicant Basic Information",
                "verbose_name_plural": "Applicant Basic Information",
                "db_table": '"resumeanalyzer"."applicant_basic_info"',
            },
        ),

        # ── Skills (master catalogue) ────────────────────────────────────────
        migrations.CreateModel(
            name="Skills",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("skill_name", models.CharField(max_length=100, unique=True)),
                ("category", models.CharField(blank=True, max_length=50, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Skill",
                "verbose_name_plural": "Skills",
                "db_table": '"resumeanalyzer"."skills"',
                "indexes": [
                    models.Index(fields=["skill_name"], name="idx_skills_name"),
                    models.Index(fields=["category"], name="idx_skills_category"),
                ],
            },
        ),

        # ── Projects ─────────────────────────────────────────────────────────
        migrations.CreateModel(
            name="Projects",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("project_name", models.CharField(max_length=255)),
                ("project_info", models.TextField()),
                ("display_order", models.IntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="projects",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Project",
                "verbose_name_plural": "Projects",
                "db_table": '"resumeanalyzer"."projects"',
                "ordering": ["display_order"],
            },
        ),

        # ── ProjectSkills (junction) ─────────────────────────────────────────
        migrations.CreateModel(
            name="ProjectSkills",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "project",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="project_skills",
                        to="BackendApp.projects",
                    ),
                ),
                (
                    "skill",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="project_skills",
                        to="BackendApp.skills",
                    ),
                ),
            ],
            options={
                "verbose_name": "Project Skill",
                "verbose_name_plural": "Project Skills",
                "db_table": '"resumeanalyzer"."project_skills"',
            },
        ),

        # ── UserSkills (junction) ────────────────────────────────────────────
        migrations.CreateModel(
            name="UserSkills",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "skill",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="user_skills",
                        to="BackendApp.skills",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="user_skills",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "User Skill",
                "verbose_name_plural": "User Skills",
                "db_table": '"resumeanalyzer"."user_skills"',
            },
        ),

        # ── Academics ────────────────────────────────────────────────────────
        migrations.CreateModel(
            name="Academics",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("college_name", models.CharField(max_length=255)),
                ("graduation_date", models.CharField(max_length=50)),
                ("course", models.CharField(max_length=255)),
                ("display_order", models.IntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="academics",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Academic",
                "verbose_name_plural": "Academics",
                "db_table": '"resumeanalyzer"."academics"',
                "ordering": ["display_order"],
                "indexes": [
                    models.Index(
                        fields=["user", "display_order"],
                        name="idx_academics_user_order",
                    )
                ],
            },
        ),

        # ── Achievements ─────────────────────────────────────────────────────
        migrations.CreateModel(
            name="Achievements",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("achievement_point", models.TextField()),
                ("display_order", models.IntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="achievements",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Achievement",
                "verbose_name_plural": "Achievements",
                "db_table": '"resumeanalyzer"."achievements"',
                "ordering": ["display_order"],
                "indexes": [
                    models.Index(
                        fields=["user", "display_order"],
                        name="idx_achievements_user_order",
                    )
                ],
            },
        ),

        # ── Applications ─────────────────────────────────────────────────────
        migrations.CreateModel(
            name="Applications",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("job_name", models.CharField(max_length=255)),
                ("company_name", models.CharField(max_length=255)),
                (
                    "job_link",
                    models.URLField(
                        max_length=500,
                        validators=[
                            django.core.validators.URLValidator(
                                schemes=["http", "https"]
                            )
                        ],
                    ),
                ),
                ("resume_file_path", models.CharField(max_length=500)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("Applied", "Applied"),
                            ("Rejected", "Rejected"),
                            ("Timed out", "Timed out"),
                            ("Processed", "Processed"),
                            ("Accepted", "Accepted"),
                            ("Interview", "Interview"),
                        ],
                        default="Applied",
                        max_length=50,
                        validators=[BackendApp.models.validate_status],
                    ),
                ),
                ("notes", models.TextField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="applications",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Application",
                "verbose_name_plural": "Applications",
                "db_table": '"resumeanalyzer"."applications"',
                "indexes": [
                    models.Index(
                        fields=["user", "status"], name="idx_applications_user_status"
                    ),
                    models.Index(
                        fields=["user", "company_name"],
                        name="idx_applications_user_company",
                    ),
                ],
            },
        ),

        # ── Experiences ──────────────────────────────────────────────────────
        migrations.CreateModel(
            name="Experiences",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("experience_name", models.CharField(max_length=255)),
                ("start_date", models.CharField(max_length=50)),
                ("end_date", models.CharField(max_length=50)),
                ("role", models.CharField(blank=True, max_length=255, null=True)),
                ("location", models.CharField(blank=True, max_length=50, null=True)),
                ("experience_explanation", models.TextField()),
                ("display_order", models.IntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="experiences",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Experience",
                "verbose_name_plural": "Experiences",
                "db_table": '"resumeanalyzer"."experiences"',
                "ordering": ["display_order"],
                "indexes": [
                    models.Index(
                        fields=["user", "display_order"],
                        name="idx_experiences_user_order",
                    )
                ],
            },
        ),

        # ── Indexes and constraints ──────────────────────────────────────────
        migrations.AddIndex(
            model_name="projects",
            index=models.Index(
                fields=["user", "display_order"], name="idx_projects_user_order"
            ),
        ),
        migrations.AddIndex(
            model_name="projectskills",
            index=models.Index(
                fields=["project"], name="idx_project_skills_project_id"
            ),
        ),
        migrations.AddIndex(
            model_name="projectskills",
            index=models.Index(fields=["skill"], name="idx_project_skills_skill_id"),
        ),
        migrations.AlterUniqueTogether(
            name="projectskills",
            unique_together={("project", "skill")},
        ),
        migrations.AddIndex(
            model_name="userskills",
            index=models.Index(
                fields=["user", "skill"], name="idx_user_skills_user_skill"
            ),
        ),
        migrations.AlterUniqueTogether(
            name="userskills",
            unique_together={("user", "skill")},
        ),
    ]
