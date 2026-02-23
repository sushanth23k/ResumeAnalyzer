from django.http import FileResponse
from django.core.exceptions import ValidationError
from django.db import transaction, IntegrityError
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
import uuid
from pathlib import Path

from .models import (
    ApplicantBasicInfo, Academics, Achievements, Skills,
    UserSkills, Projects, ProjectSkills, Experiences, Applications,
)


# ─── Utilities ────────────────────────────────────────────────────────────────

def ok(data=None, message=None, status=200):
    body = {"success": True}
    if data is not None:
        body["data"] = data
    if message:
        body["message"] = message
    return Response(body, status=status)


def err(code, message, details=None, status=400):
    error = {"code": code, "message": message}
    if details is not None:
        error["details"] = details
    return Response({"success": False, "error": error}, status=status)


def validation_err(e):
    if hasattr(e, 'message_dict'):
        details = e.message_dict
    elif hasattr(e, 'messages'):
        details = list(e.messages)
    else:
        details = str(e)
    return err("VALIDATION_ERROR", "Input validation failed", details, 400)


def serialize_skill(skill):
    return {
        "id": str(skill.id),
        "skillName": skill.skill_name,
        "category": skill.category,
    }


def serialize_project_with_skills(project):
    skills = [
        serialize_skill(ps.skill)
        for ps in ProjectSkills.objects.filter(project=project).select_related('skill')
    ]
    return {
        "id": str(project.id),
        "projectName": project.project_name,
        "projectInfo": project.project_info,
        "displayOrder": project.display_order,
        "skills": skills,
    }


# ─── 1. Basic Information ─────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def basic_info(request):
    if request.method == 'GET':
        try:
            info = ApplicantBasicInfo.objects.filter(user=request.user).first()
            if not info:
                return ok(data=None, message="No basic information found")
            data = {
                "id": str(info.id),
                "fullName": info.full_name,
                "phoneNumber": info.phone_number,
                "email": info.email,
                "linkedinUrl": info.linkedin_url,
                "githubUrl": info.github_url,
                "address": info.address,
            }
            return ok(data)
        except Exception as e:
            return err("DATABASE_ERROR", "Failed to retrieve basic information", str(e), 500)

    # POST
    try:
        body = request.data
        info = ApplicantBasicInfo.objects.filter(user=request.user).first()

        if info:
            info.full_name = body.get('fullName', info.full_name)
            info.phone_number = body.get('phoneNumber', info.phone_number)
            info.email = body.get('email', info.email)
            info.linkedin_url = body.get('linkedinUrl', info.linkedin_url)
            info.github_url = body.get('githubUrl', info.github_url)
            info.address = body.get('address', info.address)
            info.full_clean()
            info.save()
            message = "Basic information updated successfully"
        else:
            info = ApplicantBasicInfo(
                user=request.user,
                full_name=body.get('fullName'),
                phone_number=body.get('phoneNumber'),
                email=body.get('email'),
                linkedin_url=body.get('linkedinUrl'),
                github_url=body.get('githubUrl'),
                address=body.get('address'),
            )
            info.full_clean()
            info.save()
            message = "Basic information created successfully"

        data = {
            "id": str(info.id),
            "fullName": info.full_name,
            "phoneNumber": info.phone_number,
            "email": info.email,
            "linkedinUrl": info.linkedin_url,
            "githubUrl": info.github_url,
            "address": info.address,
        }
        return ok(data, message)
    except ValidationError as e:
        return validation_err(e)
    except Exception as e:
        return err("DATABASE_ERROR", "Failed to save basic information", str(e), 500)


# ─── 2. Academics ─────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def academics(request):
    if request.method == 'GET':
        try:
            academic_id = request.query_params.get('id')
            if academic_id:
                try:
                    academic = Academics.objects.get(id=academic_id, user=request.user)
                    return ok({
                        "id": str(academic.id),
                        "collegeName": academic.college_name,
                        "graduationDate": academic.graduation_date,
                        "course": academic.course,
                        "displayOrder": academic.display_order,
                    })
                except Academics.DoesNotExist:
                    return err("NOT_FOUND", "Academic record not found", status=404)
            else:
                items = Academics.objects.filter(user=request.user).order_by('display_order')
                data = [
                    {
                        "id": str(a.id),
                        "collegeName": a.college_name,
                        "graduationDate": a.graduation_date,
                        "course": a.course,
                        "displayOrder": a.display_order,
                    }
                    for a in items
                ]
                return ok(data)
        except Exception as e:
            return err("DATABASE_ERROR", "Failed to retrieve academics", str(e), 500)

    # POST
    try:
        body = request.data
        action = body.get('action', 'create')

        if action == 'create':
            display_order = body.get('displayOrder', Academics.objects.filter(user=request.user).count())
            academic = Academics(
                user=request.user,
                college_name=body.get('collegeName'),
                graduation_date=body.get('graduationDate'),
                course=body.get('course'),
                display_order=display_order,
            )
            academic.full_clean()
            academic.save()
            return ok(
                {
                    "id": str(academic.id),
                    "collegeName": academic.college_name,
                    "graduationDate": academic.graduation_date,
                    "course": academic.course,
                    "displayOrder": academic.display_order,
                },
                "Academic record created successfully",
            )

        elif action == 'update':
            academic_id = body.get('id')
            if not academic_id:
                return err("VALIDATION_ERROR", "Academic ID is required for update")
            try:
                academic = Academics.objects.get(id=academic_id, user=request.user)
            except Academics.DoesNotExist:
                return err("NOT_FOUND", "Academic record not found", status=404)
            if 'collegeName' in body:
                academic.college_name = body['collegeName']
            if 'graduationDate' in body:
                academic.graduation_date = body['graduationDate']
            if 'course' in body:
                academic.course = body['course']
            if 'displayOrder' in body:
                academic.display_order = body['displayOrder']
            academic.full_clean()
            academic.save()
            return ok(
                {
                    "id": str(academic.id),
                    "collegeName": academic.college_name,
                    "graduationDate": academic.graduation_date,
                    "course": academic.course,
                    "displayOrder": academic.display_order,
                },
                "Academic record updated successfully",
            )

        elif action == 'delete':
            academic_id = body.get('id')
            if not academic_id:
                return err("VALIDATION_ERROR", "Academic ID is required for delete")
            try:
                academic = Academics.objects.get(id=academic_id, user=request.user)
            except Academics.DoesNotExist:
                return err("NOT_FOUND", "Academic record not found", status=404)
            academic.delete()
            return ok(message="Academic record deleted successfully")

        elif action == 'reorder':
            with transaction.atomic():
                for order in body.get('academicOrders', []):
                    try:
                        academic = Academics.objects.get(id=order.get('id'), user=request.user)
                        academic.display_order = order.get('displayOrder')
                        academic.save()
                    except Academics.DoesNotExist:
                        continue
            return ok(message="Academics reordered successfully")

        else:
            return err("VALIDATION_ERROR", f"Invalid action: {action}. Use create, update, delete, or reorder")

    except ValidationError as e:
        return validation_err(e)
    except Exception as e:
        return err("DATABASE_ERROR", "Failed to process academic request", str(e), 500)


# ─── 3. Achievements ──────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def achievements(request):
    if request.method == 'GET':
        try:
            achievement_id = request.query_params.get('id')
            if achievement_id:
                try:
                    item = Achievements.objects.get(id=achievement_id, user=request.user)
                    return ok({
                        "id": str(item.id),
                        "achievementPoint": item.achievement_point,
                        "displayOrder": item.display_order,
                    })
                except Achievements.DoesNotExist:
                    return err("NOT_FOUND", "Achievement not found", status=404)
            else:
                items = Achievements.objects.filter(user=request.user).order_by('display_order')
                data = [
                    {"id": str(a.id), "achievementPoint": a.achievement_point, "displayOrder": a.display_order}
                    for a in items
                ]
                return ok(data)
        except Exception as e:
            return err("DATABASE_ERROR", "Failed to retrieve achievements", str(e), 500)

    # POST
    try:
        body = request.data
        action = body.get('action', 'create')

        if action == 'create':
            display_order = body.get('displayOrder', Achievements.objects.filter(user=request.user).count())
            item = Achievements(
                user=request.user,
                achievement_point=body.get('achievementPoint'),
                display_order=display_order,
            )
            item.full_clean()
            item.save()
            return ok(
                {"id": str(item.id), "achievementPoint": item.achievement_point, "displayOrder": item.display_order},
                "Achievement created successfully",
            )

        elif action == 'update':
            achievement_id = body.get('id')
            if not achievement_id:
                return err("VALIDATION_ERROR", "Achievement ID is required for update")
            try:
                item = Achievements.objects.get(id=achievement_id, user=request.user)
            except Achievements.DoesNotExist:
                return err("NOT_FOUND", "Achievement not found", status=404)
            if 'achievementPoint' in body:
                item.achievement_point = body['achievementPoint']
            if 'displayOrder' in body:
                item.display_order = body['displayOrder']
            item.full_clean()
            item.save()
            return ok(
                {"id": str(item.id), "achievementPoint": item.achievement_point, "displayOrder": item.display_order},
                "Achievement updated successfully",
            )

        elif action == 'delete':
            achievement_id = body.get('id')
            if not achievement_id:
                return err("VALIDATION_ERROR", "Achievement ID is required for delete")
            try:
                item = Achievements.objects.get(id=achievement_id, user=request.user)
            except Achievements.DoesNotExist:
                return err("NOT_FOUND", "Achievement not found", status=404)
            item.delete()
            return ok(message="Achievement deleted successfully")

        elif action == 'reorder':
            with transaction.atomic():
                for order in body.get('achievementOrders', []):
                    try:
                        item = Achievements.objects.get(id=order.get('id'), user=request.user)
                        item.display_order = order.get('displayOrder')
                        item.save()
                    except Achievements.DoesNotExist:
                        continue
            return ok(message="Achievements reordered successfully")

        else:
            return err("VALIDATION_ERROR", f"Invalid action: {action}. Use create, update, delete, or reorder")

    except ValidationError as e:
        return validation_err(e)
    except Exception as e:
        return err("DATABASE_ERROR", "Failed to process achievement request", str(e), 500)


# ─── 4. Skills (global catalog) ───────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def skills(request):
    if request.method == 'GET':
        try:
            category = request.query_params.get('category')
            search = request.query_params.get('search')
            qs = Skills.objects.all()
            if category:
                qs = qs.filter(category=category)
            if search:
                qs = qs.filter(skill_name__icontains=search)
            return ok([serialize_skill(s) for s in qs])
        except Exception as e:
            return err("DATABASE_ERROR", "Failed to retrieve skills", str(e), 500)

    # POST
    try:
        body = request.data
        skill = Skills(skill_name=body.get('skillName'), category=body.get('category'))
        skill.full_clean()
        skill.save()
        return ok(serialize_skill(skill), "Skill created successfully")
    except ValidationError as e:
        return validation_err(e)
    except IntegrityError:
        return err("DUPLICATE_ENTRY", "Skill name already exists", status=400)
    except Exception as e:
        return err("DATABASE_ERROR", "Failed to create skill", str(e), 500)


# ─── 5. User Skills ───────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_skills(request):
    if request.method == 'GET':
        try:
            items = UserSkills.objects.filter(user=request.user).select_related('skill')
            return ok([serialize_skill(us.skill) for us in items])
        except Exception as e:
            return err("DATABASE_ERROR", "Failed to retrieve user skills", str(e), 500)

    # POST
    try:
        body = request.data
        action = body.get('action', 'add')
        skill_ids = body.get('skillIds', [])

        if action == 'add':
            added_count = 0
            added_skills = []
            with transaction.atomic():
                for skill_id in skill_ids:
                    try:
                        skill = Skills.objects.get(id=skill_id)
                        us, created = UserSkills.objects.get_or_create(user=request.user, skill=skill)
                        if created:
                            added_count += 1
                            added_skills.append(serialize_skill(skill))
                    except Skills.DoesNotExist:
                        continue
            return ok({"added": added_count, "skills": added_skills}, f"{added_count} skills added successfully")

        elif action == 'remove':
            removed_count = 0
            with transaction.atomic():
                for skill_id in skill_ids:
                    try:
                        skill = Skills.objects.get(id=skill_id)
                        deleted, _ = UserSkills.objects.filter(user=request.user, skill=skill).delete()
                        removed_count += deleted
                    except Skills.DoesNotExist:
                        continue
            return ok({"removed": removed_count}, f"{removed_count} skills removed successfully")

        else:
            return err("VALIDATION_ERROR", f"Invalid action: {action}. Use add or remove")

    except Exception as e:
        return err("DATABASE_ERROR", "Failed to process user skills request", str(e), 500)


# ─── 6. Projects ──────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def projects(request):
    if request.method == 'GET':
        try:
            project_id = request.query_params.get('id')
            if project_id:
                try:
                    project = Projects.objects.get(id=project_id, user=request.user)
                    return ok(serialize_project_with_skills(project))
                except Projects.DoesNotExist:
                    return err("NOT_FOUND", "Project not found", status=404)
            else:
                items = Projects.objects.filter(user=request.user).order_by('display_order')
                return ok([serialize_project_with_skills(p) for p in items])
        except Exception as e:
            return err("DATABASE_ERROR", "Failed to retrieve projects", str(e), 500)

    # POST
    try:
        body = request.data
        action = body.get('action', 'create')

        if action == 'create':
            display_order = body.get('displayOrder', Projects.objects.filter(user=request.user).count())
            with transaction.atomic():
                project = Projects(
                    user=request.user,
                    project_name=body.get('projectName'),
                    project_info=body.get('projectInfo'),
                    display_order=display_order,
                )
                project.full_clean()
                project.save()
                for skill_id in body.get('skillIds', []):
                    try:
                        skill = Skills.objects.get(id=skill_id)
                        ProjectSkills.objects.create(project=project, skill=skill)
                    except Skills.DoesNotExist:
                        continue
            return ok(serialize_project_with_skills(project), "Project created successfully")

        elif action == 'update':
            project_id = body.get('id')
            if not project_id:
                return err("VALIDATION_ERROR", "Project ID is required for update")
            try:
                project = Projects.objects.get(id=project_id, user=request.user)
            except Projects.DoesNotExist:
                return err("NOT_FOUND", "Project not found", status=404)
            with transaction.atomic():
                if 'projectName' in body:
                    project.project_name = body['projectName']
                if 'projectInfo' in body:
                    project.project_info = body['projectInfo']
                if 'displayOrder' in body:
                    project.display_order = body['displayOrder']
                project.full_clean()
                project.save()
                if 'skillIds' in body:
                    ProjectSkills.objects.filter(project=project).delete()
                    for skill_id in body['skillIds']:
                        try:
                            skill = Skills.objects.get(id=skill_id)
                            ProjectSkills.objects.create(project=project, skill=skill)
                        except Skills.DoesNotExist:
                            continue
            return ok(serialize_project_with_skills(project), "Project updated successfully")

        elif action == 'delete':
            project_id = body.get('id')
            if not project_id:
                return err("VALIDATION_ERROR", "Project ID is required for delete")
            try:
                project = Projects.objects.get(id=project_id, user=request.user)
            except Projects.DoesNotExist:
                return err("NOT_FOUND", "Project not found", status=404)
            project.delete()
            return ok(message="Project deleted successfully")

        elif action == 'reorder':
            with transaction.atomic():
                for order in body.get('projectOrders', []):
                    try:
                        project = Projects.objects.get(id=order.get('id'), user=request.user)
                        project.display_order = order.get('displayOrder')
                        project.save()
                    except Projects.DoesNotExist:
                        continue
            return ok(message="Projects reordered successfully")

        else:
            return err("VALIDATION_ERROR", f"Invalid action: {action}. Use create, update, delete, or reorder")

    except ValidationError as e:
        return validation_err(e)
    except Exception as e:
        return err("DATABASE_ERROR", "Failed to process project request", str(e), 500)


# ─── 7. Experiences ───────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def experiences(request):
    if request.method == 'GET':
        try:
            experience_id = request.query_params.get('id')
            if experience_id:
                try:
                    exp = Experiences.objects.get(id=experience_id, user=request.user)
                    return ok({
                        "id": str(exp.id),
                        "experienceName": exp.experience_name,
                        "startDate": exp.start_date,
                        "endDate": exp.end_date,
                        "role": exp.role,
                        "location": exp.location,
                        "experienceExplanation": exp.experience_explanation,
                        "displayOrder": exp.display_order,
                    })
                except Experiences.DoesNotExist:
                    return err("NOT_FOUND", "Experience not found", status=404)
            else:
                items = Experiences.objects.filter(user=request.user).order_by('display_order')
                data = [
                    {
                        "id": str(e.id),
                        "experienceName": e.experience_name,
                        "startDate": e.start_date,
                        "endDate": e.end_date,
                        "role": e.role,
                        "location": e.location,
                        "experienceExplanation": e.experience_explanation,
                        "displayOrder": e.display_order,
                    }
                    for e in items
                ]
                return ok(data)
        except Exception as e:
            return err("DATABASE_ERROR", "Failed to retrieve experiences", str(e), 500)

    # POST
    try:
        body = request.data
        action = body.get('action', 'create')

        if action == 'create':
            display_order = body.get('displayOrder', Experiences.objects.filter(user=request.user).count())
            exp = Experiences(
                user=request.user,
                experience_name=body.get('experienceName'),
                start_date=body.get('startDate'),
                end_date=body.get('endDate'),
                role=body.get('role'),
                location=body.get('location'),
                experience_explanation=body.get('experienceExplanation'),
                display_order=display_order,
            )
            exp.full_clean()
            exp.save()
            return ok(
                {
                    "id": str(exp.id),
                    "experienceName": exp.experience_name,
                    "startDate": exp.start_date,
                    "endDate": exp.end_date,
                    "role": exp.role,
                    "location": exp.location,
                    "experienceExplanation": exp.experience_explanation,
                    "displayOrder": exp.display_order,
                },
                "Experience created successfully",
            )

        elif action == 'update':
            experience_id = body.get('id')
            if not experience_id:
                return err("VALIDATION_ERROR", "Experience ID is required for update")
            try:
                exp = Experiences.objects.get(id=experience_id, user=request.user)
            except Experiences.DoesNotExist:
                return err("NOT_FOUND", "Experience not found", status=404)
            for field, attr in [
                ('experienceName', 'experience_name'),
                ('startDate', 'start_date'),
                ('endDate', 'end_date'),
                ('role', 'role'),
                ('location', 'location'),
                ('experienceExplanation', 'experience_explanation'),
                ('displayOrder', 'display_order'),
            ]:
                if field in body:
                    setattr(exp, attr, body[field])
            exp.full_clean()
            exp.save()
            return ok(
                {
                    "id": str(exp.id),
                    "experienceName": exp.experience_name,
                    "startDate": exp.start_date,
                    "endDate": exp.end_date,
                    "role": exp.role,
                    "location": exp.location,
                    "experienceExplanation": exp.experience_explanation,
                    "displayOrder": exp.display_order,
                },
                "Experience updated successfully",
            )

        elif action == 'delete':
            experience_id = body.get('id')
            if not experience_id:
                return err("VALIDATION_ERROR", "Experience ID is required for delete")
            try:
                exp = Experiences.objects.get(id=experience_id, user=request.user)
            except Experiences.DoesNotExist:
                return err("NOT_FOUND", "Experience not found", status=404)
            exp.delete()
            return ok(message="Experience deleted successfully")

        elif action == 'reorder':
            with transaction.atomic():
                for order in body.get('experienceOrders', []):
                    try:
                        exp = Experiences.objects.get(id=order.get('id'), user=request.user)
                        exp.display_order = order.get('displayOrder')
                        exp.save()
                    except Experiences.DoesNotExist:
                        continue
            return ok(message="Experiences reordered successfully")

        else:
            return err("VALIDATION_ERROR", f"Invalid action: {action}. Use create, update, delete, or reorder")

    except ValidationError as e:
        return validation_err(e)
    except Exception as e:
        return err("DATABASE_ERROR", "Failed to process experience request", str(e), 500)


# ─── 8. Complete Applicant Info ───────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def complete_applicant_info(request):
    try:
        u = request.user

        info = ApplicantBasicInfo.objects.filter(user=u).first()
        basic_data = None
        if info:
            basic_data = {
                "id": str(info.id),
                "fullName": info.full_name,
                "phoneNumber": info.phone_number,
                "email": info.email,
                "linkedinUrl": info.linkedin_url,
                "githubUrl": info.github_url,
                "address": info.address,
            }

        academics_data = [
            {
                "id": str(a.id),
                "collegeName": a.college_name,
                "graduationDate": a.graduation_date,
                "course": a.course,
                "displayOrder": a.display_order,
            }
            for a in Academics.objects.filter(user=u).order_by('display_order')
        ]

        achievements_data = [
            {"id": str(a.id), "achievementPoint": a.achievement_point, "displayOrder": a.display_order}
            for a in Achievements.objects.filter(user=u).order_by('display_order')
        ]

        skills_data = [
            serialize_skill(us.skill)
            for us in UserSkills.objects.filter(user=u).select_related('skill')
        ]

        projects_data = [
            serialize_project_with_skills(p)
            for p in Projects.objects.filter(user=u).order_by('display_order')
        ]

        experiences_data = [
            {
                "id": str(e.id),
                "experienceName": e.experience_name,
                "startDate": e.start_date,
                "endDate": e.end_date,
                "role": e.role,
                "location": e.location,
                "experienceExplanation": e.experience_explanation,
                "displayOrder": e.display_order,
            }
            for e in Experiences.objects.filter(user=u).order_by('display_order')
        ]

        return ok({
            "basicInformation": basic_data,
            "academics": academics_data,
            "achievements": achievements_data,
            "skills": skills_data,
            "projects": projects_data,
            "experiences": experiences_data,
        })
    except Exception as e:
        return err("DATABASE_ERROR", "Failed to retrieve complete applicant information", str(e), 500)


# ─── 9. Applications ──────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def applications(request):
    if request.method == 'GET':
        try:
            application_id = request.query_params.get('id')
            if application_id:
                try:
                    app = Applications.objects.get(id=application_id, user=request.user)
                    return ok({
                        "id": str(app.id),
                        "jobName": app.job_name,
                        "companyName": app.company_name,
                        "jobLink": app.job_link,
                        "resumeFilePath": app.resume_file_path,
                        "status": app.status,
                        "notes": app.notes,
                    })
                except Applications.DoesNotExist:
                    return err("NOT_FOUND", "Application not found", status=404)

            status_filter = request.query_params.get('status')
            company = request.query_params.get('company')
            limit = int(request.query_params.get('limit', 10))
            offset = int(request.query_params.get('offset', 0))
            sort_by = request.query_params.get('sortBy', 'created_at')
            sort_order = request.query_params.get('sortOrder', 'desc')

            sort_field_map = {
                'jobName': 'job_name',
                'companyName': 'company_name',
                'status': 'status',
            }
            sort_field = sort_field_map.get(sort_by, 'created_at')
            if sort_order == 'desc':
                sort_field = f'-{sort_field}'

            qs = Applications.objects.filter(user=request.user)
            if status_filter:
                qs = qs.filter(status=status_filter)
            if company:
                qs = qs.filter(company_name__icontains=company)
            qs = qs.order_by(sort_field)
            total = qs.count()
            apps_page = qs[offset:offset + limit]

            apps_data = [
                {
                    "id": str(a.id),
                    "jobName": a.job_name,
                    "companyName": a.company_name,
                    "jobLink": a.job_link,
                    "resumeFilePath": a.resume_file_path,
                    "status": a.status,
                    "notes": a.notes,
                }
                for a in apps_page
            ]
            return ok({
                "applications": apps_data,
                "total": total,
                "page": offset // limit + 1 if limit > 0 else 1,
                "limit": limit,
            })
        except Exception as e:
            return err("DATABASE_ERROR", "Failed to retrieve applications", str(e), 500)

    # POST
    try:
        body = request.data
        action = body.get('action', 'create')

        if action == 'create':
            resume_file_path = f"ResumeBlobs/placeholder_{uuid.uuid4()}.pdf"
            app = Applications(
                user=request.user,
                job_name=body.get('jobName'),
                company_name=body.get('companyName'),
                job_link=body.get('jobLink'),
                resume_file_path=resume_file_path,
                status=body.get('status', 'Applied'),
                notes=body.get('notes'),
            )
            app.full_clean()
            app.save()
            return ok(
                {
                    "id": str(app.id),
                    "jobName": app.job_name,
                    "companyName": app.company_name,
                    "jobLink": app.job_link,
                    "resumeFilePath": app.resume_file_path,
                    "status": app.status,
                    "notes": app.notes,
                },
                "Application created successfully",
            )

        elif action == 'update':
            application_id = body.get('id')
            if not application_id:
                return err("VALIDATION_ERROR", "Application ID is required for update")
            try:
                app = Applications.objects.get(id=application_id, user=request.user)
            except Applications.DoesNotExist:
                return err("NOT_FOUND", "Application not found", status=404)
            for field, attr in [
                ('jobName', 'job_name'),
                ('companyName', 'company_name'),
                ('jobLink', 'job_link'),
                ('status', 'status'),
                ('notes', 'notes'),
            ]:
                if field in body:
                    setattr(app, attr, body[field])
            app.full_clean()
            app.save()
            return ok(
                {
                    "id": str(app.id),
                    "jobName": app.job_name,
                    "companyName": app.company_name,
                    "jobLink": app.job_link,
                    "resumeFilePath": app.resume_file_path,
                    "status": app.status,
                    "notes": app.notes,
                },
                "Application updated successfully",
            )

        elif action == 'delete':
            application_id = body.get('id')
            if not application_id:
                return err("VALIDATION_ERROR", "Application ID is required for delete")
            try:
                app = Applications.objects.get(id=application_id, user=request.user)
            except Applications.DoesNotExist:
                return err("NOT_FOUND", "Application not found", status=404)
            if app.resume_file_path and not app.resume_file_path.startswith('ResumeBlobs/placeholder_'):
                resume_path = Path(__file__).resolve().parent.parent / app.resume_file_path
                if resume_path.exists():
                    resume_path.unlink()
            app.delete()
            return ok(message="Application deleted successfully")

        else:
            return err("VALIDATION_ERROR", f"Invalid action: {action}. Use create, update, or delete")

    except ValidationError as e:
        return validation_err(e)
    except Exception as e:
        return err("DATABASE_ERROR", "Failed to process application request", str(e), 500)


# ─── 10. Resume File Management ───────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def resume_file(request):
    if request.method == 'GET':
        try:
            application_id = request.query_params.get('id')
            if not application_id:
                return err("VALIDATION_ERROR", "Application ID is required")
            try:
                app = Applications.objects.get(id=application_id, user=request.user)
            except Applications.DoesNotExist:
                return err("NOT_FOUND", "Application not found", status=404)

            if not app.resume_file_path or app.resume_file_path.startswith('ResumeBlobs/placeholder_'):
                return err("FILE_NOT_FOUND", "Resume file not found", status=404)

            base_dir = Path(__file__).resolve().parent.parent
            file_path = base_dir / app.resume_file_path
            if not file_path.exists():
                return err("FILE_NOT_FOUND", "Resume file not found on server", status=404)

            content_type_map = {
                '.pdf': 'application/pdf',
                '.doc': 'application/msword',
                '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            }
            content_type = content_type_map.get(file_path.suffix.lower(), 'application/octet-stream')
            response = FileResponse(open(file_path, 'rb'), content_type=content_type)
            response['Content-Disposition'] = f'attachment; filename="{file_path.name}"'
            return response
        except Exception as e:
            return err("FILE_NOT_FOUND", "Failed to download resume", str(e), 500)

    # POST
    try:
        action = request.data.get('action', 'upload')
        application_id = request.data.get('id')
        if not application_id:
            return err("VALIDATION_ERROR", "Application ID is required")
        try:
            app = Applications.objects.get(id=application_id, user=request.user)
        except Applications.DoesNotExist:
            return err("NOT_FOUND", "Application not found", status=404)

        if action == 'upload':
            if 'file' not in request.FILES:
                return err("FILE_UPLOAD_ERROR", "No file provided")
            uploaded_file = request.FILES['file']

            allowed_types = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ]
            if uploaded_file.content_type not in allowed_types:
                return err("INVALID_FILE_TYPE", "Only PDF, DOC, and DOCX files are allowed")
            if uploaded_file.size > 10 * 1024 * 1024:
                return err("FILE_SIZE_EXCEEDED", "File size exceeds 10MB limit")

            base_dir = Path(__file__).resolve().parent.parent
            resume_dir = base_dir / 'ResumeBlobs'
            resume_dir.mkdir(exist_ok=True)

            if app.resume_file_path and not app.resume_file_path.startswith('ResumeBlobs/placeholder_'):
                old_path = base_dir / app.resume_file_path
                if old_path.exists():
                    old_path.unlink()

            file_extension = Path(uploaded_file.name).suffix
            filename = f"{application_id}_{uuid.uuid4()}{file_extension}"
            file_path = resume_dir / filename
            with open(file_path, 'wb+') as dest:
                for chunk in uploaded_file.chunks():
                    dest.write(chunk)

            app.resume_file_path = f"ResumeBlobs/{filename}"
            app.save()

            return ok(
                {
                    "resumeFilePath": app.resume_file_path,
                    "fileName": filename,
                    "fileSize": uploaded_file.size,
                    "mimeType": uploaded_file.content_type,
                },
                "Resume uploaded successfully",
            )

        elif action == 'delete':
            if app.resume_file_path and not app.resume_file_path.startswith('ResumeBlobs/placeholder_'):
                base_dir = Path(__file__).resolve().parent.parent
                file_path = base_dir / app.resume_file_path
                if file_path.exists():
                    file_path.unlink()
            app.resume_file_path = f"ResumeBlobs/placeholder_{uuid.uuid4()}.pdf"
            app.save()
            return ok(message="Resume deleted successfully")

        else:
            return err("VALIDATION_ERROR", f"Invalid action: {action}. Use upload or delete")

    except Exception as e:
        return err("FILE_UPLOAD_ERROR", "Failed to process resume file request", str(e), 500)


# ─── 11. Application Statistics ───────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def application_stats(request):
    try:
        qs = Applications.objects.filter(user=request.user)
        total = qs.count()
        status_counts = {
            s: qs.filter(status=s).count()
            for s in ['Applied', 'Rejected', 'Timed out', 'Processed', 'Accepted', 'Interview']
        }
        successful_count = qs.filter(status__in=['Accepted', 'Interview']).count()
        success_rate = round(successful_count / total * 100, 2) if total > 0 else 0

        recent_data = [
            {"id": str(a.id), "jobName": a.job_name, "companyName": a.company_name, "status": a.status}
            for a in qs.order_by('-created_at')[:5]
        ]
        return ok({
            "total": total,
            "byStatus": status_counts,
            "successRate": success_rate,
            "recentApplications": recent_data,
        })
    except Exception as e:
        return err("DATABASE_ERROR", "Failed to retrieve application statistics", str(e), 500)
