from django.shortcuts import render
from django.http import JsonResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ValidationError
from django.db import transaction, IntegrityError
from django.db.models import Q, Count
import json
import os
import uuid
from pathlib import Path

from .models import (
    ApplicantBasicInfo, Academics, Achievements, Skills, 
    UserSkills, Projects, ProjectSkills, Experiences, Applications
)


# ============================================
# UTILITY FUNCTIONS
# ============================================

def json_response(success, data=None, message=None, error=None, status=200):
    """Standard JSON response format"""
    response = {"success": success}
    if data is not None:
        response["data"] = data
    if message:
        response["message"] = message
    if error:
        response["error"] = error
    return JsonResponse(response, status=status)


def parse_json_body(request):
    """Parse JSON body from request"""
    try:
        return json.loads(request.body.decode('utf-8')) if request.body else {}
    except json.JSONDecodeError:
        return None


def handle_validation_error(e):
    """Handle Django validation errors"""
    if hasattr(e, 'message_dict'):
        details = e.message_dict
    elif hasattr(e, 'messages'):
        details = list(e.messages)
    else:
        details = str(e)
    
    return json_response(
        success=False,
        error={
            "code": "VALIDATION_ERROR",
            "message": "Input validation failed",
            "details": details
        },
        status=400
    )


def serialize_skill(skill):
    """Serialize skill object"""
    return {
        "id": str(skill.id),
        "skillName": skill.skill_name,
        "category": skill.category
    }


def serialize_project_with_skills(project):
    """Serialize project with skills"""
    project_skills = ProjectSkills.objects.filter(project=project).select_related('skill')
    skills = [serialize_skill(ps.skill) for ps in project_skills]
    
    return {
        "id": str(project.id),
        "projectName": project.project_name,
        "projectInfo": project.project_info,
        "displayOrder": project.display_order,
        "skills": skills
    }


# ============================================
# 1. BASIC INFORMATION APIs
# ============================================

@csrf_exempt
@require_http_methods(["GET", "POST"])
def basic_info(request):
    """
    GET /api/applicant-info/basic - Get basic information
    POST /api/applicant-info/basic - Create/Update basic information
    """
    if request.method == "GET":
        try:
            basic_info = ApplicantBasicInfo.objects.first()
            
            if not basic_info:
                return json_response(
                    success=True,
                    data=None,
                    message="No basic information found"
                )
            
            data = {
                "id": str(basic_info.id),
                "fullName": basic_info.full_name,
                "phoneNumber": basic_info.phone_number,
                "email": basic_info.email,
                "linkedinUrl": basic_info.linkedin_url,
                "githubUrl": basic_info.github_url,
                "address": basic_info.address
            }
            
            return json_response(success=True, data=data)
        
        except Exception as e:
            return json_response(
                success=False,
                error={
                    "code": "DATABASE_ERROR",
                    "message": "Failed to retrieve basic information",
                    "details": str(e)
                },
                status=500
            )
    
    else:  # POST
        try:
            body = parse_json_body(request)
            if body is None:
                return json_response(
                    success=False,
                    error={
                        "code": "VALIDATION_ERROR",
                        "message": "Invalid JSON in request body"
                    },
                    status=400
                )
            
            # Get or create basic info (only one record should exist)
            basic_info = ApplicantBasicInfo.objects.first()
            
            # Update or create
            if basic_info:
                # Update existing
                basic_info.full_name = body.get('fullName', basic_info.full_name)
                basic_info.phone_number = body.get('phoneNumber', basic_info.phone_number)
                basic_info.email = body.get('email', basic_info.email)
                basic_info.linkedin_url = body.get('linkedinUrl', basic_info.linkedin_url)
                basic_info.github_url = body.get('githubUrl', basic_info.github_url)
                basic_info.address = body.get('address', basic_info.address)
                basic_info.full_clean()  # Validate
                basic_info.save()
                message = "Basic information updated successfully"
            else:
                # Create new
                basic_info = ApplicantBasicInfo(
                    full_name=body.get('fullName'),
                    phone_number=body.get('phoneNumber'),
                    email=body.get('email'),
                    linkedin_url=body.get('linkedinUrl'),
                    github_url=body.get('githubUrl'),
                    address=body.get('address')
                )
                basic_info.full_clean()  # Validate
                basic_info.save()
                message = "Basic information created successfully"
            
            data = {
                "id": str(basic_info.id),
                "fullName": basic_info.full_name,
                "phoneNumber": basic_info.phone_number,
                "email": basic_info.email,
                "linkedinUrl": basic_info.linkedin_url,
                "githubUrl": basic_info.github_url,
                "address": basic_info.address
            }
            
            return json_response(success=True, data=data, message=message)
        
        except ValidationError as e:
            return handle_validation_error(e)
        except IntegrityError as e:
            return json_response(
                success=False,
                error={
                    "code": "DUPLICATE_ENTRY",
                    "message": "Email already exists",
                    "details": str(e)
                },
                status=400
            )
        except Exception as e:
            return json_response(
                success=False,
                error={
                    "code": "DATABASE_ERROR",
                    "message": "Failed to save basic information",
                    "details": str(e)
                },
                status=500
            )


# ============================================
# 2. ACADEMICS APIs
# ============================================

@csrf_exempt
@require_http_methods(["GET", "POST"])
def academics(request):
    """
    GET /api/applicant-info/academics - Get all academics or single by id query param
    POST /api/applicant-info/academics - Create, Update, Delete, or Reorder academics
    
    POST actions (via 'action' field):
    - create: Create new academic record
    - update: Update existing record (requires 'id')
    - delete: Delete record (requires 'id')
    - reorder: Reorder records (requires 'academicOrders')
    """
    if request.method == "GET":
        try:
            academic_id = request.GET.get('id')
            
            if academic_id:
                # Get single academic
                try:
                    academic = Academics.objects.get(id=academic_id)
                    data = {
                        "id": str(academic.id),
                        "collegeName": academic.college_name,
                        "graduationDate": academic.graduation_date,
                        "course": academic.course,
                        "displayOrder": academic.display_order
                    }
                    return json_response(success=True, data=data)
                except Academics.DoesNotExist:
                    return json_response(
                        success=False,
                        error={
                            "code": "NOT_FOUND",
                            "message": "Academic record not found"
                        },
                        status=404
                    )
            else:
                # Get all academics
                academics = Academics.objects.all().order_by('display_order')
                data = [
                    {
                        "id": str(academic.id),
                        "collegeName": academic.college_name,
                        "graduationDate": academic.graduation_date,
                        "course": academic.course,
                        "displayOrder": academic.display_order
                    }
                    for academic in academics
                ]
                return json_response(success=True, data=data)
        
        except Exception as e:
            return json_response(
                success=False,
                error={
                    "code": "DATABASE_ERROR",
                    "message": "Failed to retrieve academics",
                    "details": str(e)
                },
                status=500
            )
    
    else:  # POST
        try:
            body = parse_json_body(request)
            if body is None:
                return json_response(
                    success=False,
                    error={
                        "code": "VALIDATION_ERROR",
                        "message": "Invalid JSON in request body"
                    },
                    status=400
                )
            
            action = body.get('action', 'create')
            
            if action == 'create':
                display_order = body.get('displayOrder', Academics.objects.count())
                
                academic = Academics(
                    college_name=body.get('collegeName'),
                    graduation_date=body.get('graduationDate'),
                    course=body.get('course'),
                    display_order=display_order
                )
                academic.full_clean()
                academic.save()
                
                data = {
                    "id": str(academic.id),
                    "collegeName": academic.college_name,
                    "graduationDate": academic.graduation_date,
                    "course": academic.course,
                    "displayOrder": academic.display_order
                }
                
                return json_response(
                    success=True,
                    data=data,
                    message="Academic record created successfully"
                )
            
            elif action == 'update':
                academic_id = body.get('id')
                if not academic_id:
                    return json_response(
                        success=False,
                        error={
                            "code": "VALIDATION_ERROR",
                            "message": "Academic ID is required for update"
                        },
                        status=400
                    )
                
                try:
                    academic = Academics.objects.get(id=academic_id)
                except Academics.DoesNotExist:
                    return json_response(
                        success=False,
                        error={
                            "code": "NOT_FOUND",
                            "message": "Academic record not found"
                        },
                        status=404
                    )
                
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
                
                data = {
                    "id": str(academic.id),
                    "collegeName": academic.college_name,
                    "graduationDate": academic.graduation_date,
                    "course": academic.course,
                    "displayOrder": academic.display_order
                }
                
                return json_response(
                    success=True,
                    data=data,
                    message="Academic record updated successfully"
                )
            
            elif action == 'delete':
                academic_id = body.get('id')
                if not academic_id:
                    return json_response(
                        success=False,
                        error={
                            "code": "VALIDATION_ERROR",
                            "message": "Academic ID is required for delete"
                        },
                        status=400
                    )
                
                try:
                    academic = Academics.objects.get(id=academic_id)
                except Academics.DoesNotExist:
                    return json_response(
                        success=False,
                        error={
                            "code": "NOT_FOUND",
                            "message": "Academic record not found"
                        },
                        status=404
                    )
                
                academic.delete()
                
                return json_response(
                    success=True,
                    message="Academic record deleted successfully"
                )
            
            elif action == 'reorder':
                academic_orders = body.get('academicOrders', [])
                
                with transaction.atomic():
                    for order in academic_orders:
                        academic_id = order.get('id')
                        display_order = order.get('displayOrder')
                        
                        try:
                            academic = Academics.objects.get(id=academic_id)
                            academic.display_order = display_order
                            academic.save()
                        except Academics.DoesNotExist:
                            continue
                
                return json_response(
                    success=True,
                    message="Academics reordered successfully"
                )
            
            else:
                return json_response(
                    success=False,
                    error={
                        "code": "VALIDATION_ERROR",
                        "message": f"Invalid action: {action}. Use 'create', 'update', 'delete', or 'reorder'"
                    },
                    status=400
                )
        
        except ValidationError as e:
            return handle_validation_error(e)
        except Exception as e:
            return json_response(
                success=False,
                error={
                    "code": "DATABASE_ERROR",
                    "message": "Failed to process academic request",
                    "details": str(e)
                },
                status=500
            )


# ============================================
# 3. ACHIEVEMENTS APIs
# ============================================

@csrf_exempt
@require_http_methods(["GET", "POST"])
def achievements(request):
    """
    GET /api/applicant-info/achievements - Get all achievements or single by id query param
    POST /api/applicant-info/achievements - Create, Update, Delete, or Reorder achievements
    
    POST actions (via 'action' field):
    - create: Create new achievement
    - update: Update existing achievement (requires 'id')
    - delete: Delete achievement (requires 'id')
    - reorder: Reorder achievements (requires 'achievementOrders')
    """
    if request.method == "GET":
        try:
            achievement_id = request.GET.get('id')
            
            if achievement_id:
                try:
                    achievement = Achievements.objects.get(id=achievement_id)
                    data = {
                        "id": str(achievement.id),
                        "achievementPoint": achievement.achievement_point,
                        "displayOrder": achievement.display_order
                    }
                    return json_response(success=True, data=data)
                except Achievements.DoesNotExist:
                    return json_response(
                        success=False,
                        error={
                            "code": "NOT_FOUND",
                            "message": "Achievement not found"
                        },
                        status=404
                    )
            else:
                achievements = Achievements.objects.all().order_by('display_order')
                data = [
                    {
                        "id": str(achievement.id),
                        "achievementPoint": achievement.achievement_point,
                        "displayOrder": achievement.display_order
                    }
                    for achievement in achievements
                ]
                return json_response(success=True, data=data)
        
        except Exception as e:
            return json_response(
                success=False,
                error={
                    "code": "DATABASE_ERROR",
                    "message": "Failed to retrieve achievements",
                    "details": str(e)
                },
                status=500
            )
    
    else:  # POST
        try:
            body = parse_json_body(request)
            if body is None:
                return json_response(
                    success=False,
                    error={
                        "code": "VALIDATION_ERROR",
                        "message": "Invalid JSON in request body"
                    },
                    status=400
                )
            
            action = body.get('action', 'create')
            
            if action == 'create':
                display_order = body.get('displayOrder', Achievements.objects.count())
                
                achievement = Achievements(
                    achievement_point=body.get('achievementPoint'),
                    display_order=display_order
                )
                achievement.full_clean()
                achievement.save()
                
                data = {
                    "id": str(achievement.id),
                    "achievementPoint": achievement.achievement_point,
                    "displayOrder": achievement.display_order
                }
                
                return json_response(
                    success=True,
                    data=data,
                    message="Achievement created successfully"
                )
            
            elif action == 'update':
                achievement_id = body.get('id')
                if not achievement_id:
                    return json_response(
                        success=False,
                        error={
                            "code": "VALIDATION_ERROR",
                            "message": "Achievement ID is required for update"
                        },
                        status=400
                    )
                
                try:
                    achievement = Achievements.objects.get(id=achievement_id)
                except Achievements.DoesNotExist:
                    return json_response(
                        success=False,
                        error={
                            "code": "NOT_FOUND",
                            "message": "Achievement not found"
                        },
                        status=404
                    )
                
                if 'achievementPoint' in body:
                    achievement.achievement_point = body['achievementPoint']
                if 'displayOrder' in body:
                    achievement.display_order = body['displayOrder']
                
                achievement.full_clean()
                achievement.save()
                
                data = {
                    "id": str(achievement.id),
                    "achievementPoint": achievement.achievement_point,
                    "displayOrder": achievement.display_order
                }
                
                return json_response(
                    success=True,
                    data=data,
                    message="Achievement updated successfully"
                )
            
            elif action == 'delete':
                achievement_id = body.get('id')
                if not achievement_id:
                    return json_response(
                        success=False,
                        error={
                            "code": "VALIDATION_ERROR",
                            "message": "Achievement ID is required for delete"
                        },
                        status=400
                    )
                
                try:
                    achievement = Achievements.objects.get(id=achievement_id)
                except Achievements.DoesNotExist:
                    return json_response(
                        success=False,
                        error={
                            "code": "NOT_FOUND",
                            "message": "Achievement not found"
                        },
                        status=404
                    )
                
                achievement.delete()
                
                return json_response(
                    success=True,
                    message="Achievement deleted successfully"
                )
            
            elif action == 'reorder':
                achievement_orders = body.get('achievementOrders', [])
                
                with transaction.atomic():
                    for order in achievement_orders:
                        achievement_id = order.get('id')
                        display_order = order.get('displayOrder')
                        
                        try:
                            achievement = Achievements.objects.get(id=achievement_id)
                            achievement.display_order = display_order
                            achievement.save()
                        except Achievements.DoesNotExist:
                            continue
                
                return json_response(
                    success=True,
                    message="Achievements reordered successfully"
                )
            
            else:
                return json_response(
                    success=False,
                    error={
                        "code": "VALIDATION_ERROR",
                        "message": f"Invalid action: {action}. Use 'create', 'update', 'delete', or 'reorder'"
                    },
                    status=400
                )
        
        except ValidationError as e:
            return handle_validation_error(e)
        except Exception as e:
            return json_response(
                success=False,
                error={
                    "code": "DATABASE_ERROR",
                    "message": "Failed to process achievement request",
                    "details": str(e)
                },
                status=500
            )


# ============================================
# 4. SKILLS APIs
# ============================================

@csrf_exempt
@require_http_methods(["GET", "POST"])
def skills(request):
    """
    GET /api/skills - Get all available skills with optional filters
    POST /api/skills - Create new skill
    
    GET query parameters:
    - category: Filter by category
    - search: Search by skill name
    """
    if request.method == "GET":
        try:
            category = request.GET.get('category')
            search = request.GET.get('search')
            
            skills_list = Skills.objects.all()
            
            if category:
                skills_list = skills_list.filter(category=category)
            
            if search:
                skills_list = skills_list.filter(skill_name__icontains=search)
            
            data = [serialize_skill(skill) for skill in skills_list]
            
            return json_response(success=True, data=data)
        
        except Exception as e:
            return json_response(
                success=False,
                error={
                    "code": "DATABASE_ERROR",
                    "message": "Failed to retrieve skills",
                    "details": str(e)
                },
                status=500
            )
    
    else:  # POST
        try:
            body = parse_json_body(request)
            if body is None:
                return json_response(
                    success=False,
                    error={
                        "code": "VALIDATION_ERROR",
                        "message": "Invalid JSON in request body"
                    },
                    status=400
                )
            
            skill = Skills(
                skill_name=body.get('skillName'),
                category=body.get('category')
            )
            skill.full_clean()
            skill.save()
            
            data = serialize_skill(skill)
            
            return json_response(
                success=True,
                data=data,
                message="Skill created successfully"
            )
        
        except ValidationError as e:
            return handle_validation_error(e)
        except IntegrityError as e:
            return json_response(
                success=False,
                error={
                    "code": "DUPLICATE_ENTRY",
                    "message": "Skill name already exists",
                    "details": str(e)
                },
                status=400
            )
        except Exception as e:
            return json_response(
                success=False,
                error={
                    "code": "DATABASE_ERROR",
                    "message": "Failed to create skill",
                    "details": str(e)
                },
                status=500
            )


@csrf_exempt
@require_http_methods(["GET", "POST"])
def user_skills(request):
    """
    GET /api/applicant-info/skills - Get user's selected skills
    POST /api/applicant-info/skills - Add or remove skills from user
    
    POST actions (via 'action' field):
    - add: Add skills to user (requires 'skillIds')
    - remove: Remove skills from user (requires 'skillIds')
    """
    if request.method == "GET":
        try:
            user_skills_list = UserSkills.objects.all().select_related('skill')
            data = [serialize_skill(us.skill) for us in user_skills_list]
            
            return json_response(success=True, data=data)
        
        except Exception as e:
            return json_response(
                success=False,
                error={
                    "code": "DATABASE_ERROR",
                    "message": "Failed to retrieve user skills",
                    "details": str(e)
                },
                status=500
            )
    
    else:  # POST
        try:
            body = parse_json_body(request)
            if body is None:
                return json_response(
                    success=False,
                    error={
                        "code": "VALIDATION_ERROR",
                        "message": "Invalid JSON in request body"
                    },
                    status=400
                )
            
            action = body.get('action', 'add')
            skill_ids = body.get('skillIds', [])
            
            if action == 'add':
                added_count = 0
                added_skills = []
                
                with transaction.atomic():
                    for skill_id in skill_ids:
                        try:
                            skill = Skills.objects.get(id=skill_id)
                            if not UserSkills.objects.filter(skill=skill).exists():
                                user_skill = UserSkills(skill=skill)
                                user_skill.save()
                                added_count += 1
                                added_skills.append(serialize_skill(skill))
                        except Skills.DoesNotExist:
                            continue
                
                data = {
                    "added": added_count,
                    "skills": added_skills
                }
                
                return json_response(
                    success=True,
                    data=data,
                    message=f"{added_count} skills added successfully"
                )
            
            elif action == 'remove':
                removed_count = 0
                
                with transaction.atomic():
                    for skill_id in skill_ids:
                        try:
                            skill = Skills.objects.get(id=skill_id)
                            deleted_count = UserSkills.objects.filter(skill=skill).delete()[0]
                            removed_count += deleted_count
                        except Skills.DoesNotExist:
                            continue
                
                data = {
                    "removed": removed_count
                }
                
                return json_response(
                    success=True,
                    data=data,
                    message=f"{removed_count} skills removed successfully"
                )
            
            else:
                return json_response(
                    success=False,
                    error={
                        "code": "VALIDATION_ERROR",
                        "message": f"Invalid action: {action}. Use 'add' or 'remove'"
                    },
                    status=400
                )
        
        except Exception as e:
            return json_response(
                success=False,
                error={
                    "code": "DATABASE_ERROR",
                    "message": "Failed to process user skills request",
                    "details": str(e)
                },
                status=500
            )


# ============================================
# 5. PROJECTS APIs
# ============================================

@csrf_exempt
@require_http_methods(["GET", "POST"])
def projects(request):
    """
    GET /api/applicant-info/projects - Get all projects or single by id query param
    POST /api/applicant-info/projects - Create, Update, Delete, or Reorder projects
    
    POST actions (via 'action' field):
    - create: Create new project (requires 'projectName', 'projectInfo', optional 'skillIds')
    - update: Update existing project (requires 'id')
    - delete: Delete project (requires 'id')
    - reorder: Reorder projects (requires 'projectOrders')
    """
    if request.method == "GET":
        try:
            project_id = request.GET.get('id')
            
            if project_id:
                try:
                    project = Projects.objects.get(id=project_id)
                    data = serialize_project_with_skills(project)
                    return json_response(success=True, data=data)
                except Projects.DoesNotExist:
                    return json_response(
                        success=False,
                        error={
                            "code": "NOT_FOUND",
                            "message": "Project not found"
                        },
                        status=404
                    )
            else:
                projects_list = Projects.objects.all().order_by('display_order')
                data = [serialize_project_with_skills(project) for project in projects_list]
                return json_response(success=True, data=data)
        
        except Exception as e:
            return json_response(
                success=False,
                error={
                    "code": "DATABASE_ERROR",
                    "message": "Failed to retrieve projects",
                    "details": str(e)
                },
                status=500
            )
    
    else:  # POST
        try:
            body = parse_json_body(request)
            if body is None:
                return json_response(
                    success=False,
                    error={
                        "code": "VALIDATION_ERROR",
                        "message": "Invalid JSON in request body"
                    },
                    status=400
                )
            
            action = body.get('action', 'create')
            
            if action == 'create':
                display_order = body.get('displayOrder', Projects.objects.count())
                
                with transaction.atomic():
                    project = Projects(
                        project_name=body.get('projectName'),
                        project_info=body.get('projectInfo'),
                        display_order=display_order
                    )
                    project.full_clean()
                    project.save()
                    
                    skill_ids = body.get('skillIds', [])
                    for skill_id in skill_ids:
                        try:
                            skill = Skills.objects.get(id=skill_id)
                            ProjectSkills.objects.create(project=project, skill=skill)
                        except Skills.DoesNotExist:
                            continue
                
                data = serialize_project_with_skills(project)
                
                return json_response(
                    success=True,
                    data=data,
                    message="Project created successfully"
                )
            
            elif action == 'update':
                project_id = body.get('id')
                if not project_id:
                    return json_response(
                        success=False,
                        error={
                            "code": "VALIDATION_ERROR",
                            "message": "Project ID is required for update"
                        },
                        status=400
                    )
                
                try:
                    project = Projects.objects.get(id=project_id)
                except Projects.DoesNotExist:
                    return json_response(
                        success=False,
                        error={
                            "code": "NOT_FOUND",
                            "message": "Project not found"
                        },
                        status=404
                    )
                
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
                        
                        skill_ids = body['skillIds']
                        for skill_id in skill_ids:
                            try:
                                skill = Skills.objects.get(id=skill_id)
                                ProjectSkills.objects.create(project=project, skill=skill)
                            except Skills.DoesNotExist:
                                continue
                
                data = serialize_project_with_skills(project)
                
                return json_response(
                    success=True,
                    data=data,
                    message="Project updated successfully"
                )
            
            elif action == 'delete':
                project_id = body.get('id')
                if not project_id:
                    return json_response(
                        success=False,
                        error={
                            "code": "VALIDATION_ERROR",
                            "message": "Project ID is required for delete"
                        },
                        status=400
                    )
                
                try:
                    project = Projects.objects.get(id=project_id)
                except Projects.DoesNotExist:
                    return json_response(
                        success=False,
                        error={
                            "code": "NOT_FOUND",
                            "message": "Project not found"
                        },
                        status=404
                    )
                
                project.delete()
                
                return json_response(
                    success=True,
                    message="Project deleted successfully"
                )
            
            elif action == 'reorder':
                project_orders = body.get('projectOrders', [])
                
                with transaction.atomic():
                    for order in project_orders:
                        project_id = order.get('id')
                        display_order = order.get('displayOrder')
                        
                        try:
                            project = Projects.objects.get(id=project_id)
                            project.display_order = display_order
                            project.save()
                        except Projects.DoesNotExist:
                            continue
                
                return json_response(
                    success=True,
                    message="Projects reordered successfully"
                )
            
            else:
                return json_response(
                    success=False,
                    error={
                        "code": "VALIDATION_ERROR",
                        "message": f"Invalid action: {action}. Use 'create', 'update', 'delete', or 'reorder'"
                    },
                    status=400
                )
        
        except ValidationError as e:
            return handle_validation_error(e)
        except Exception as e:
            return json_response(
                success=False,
                error={
                    "code": "DATABASE_ERROR",
                    "message": "Failed to process project request",
                    "details": str(e)
                },
                status=500
            )


# ============================================
# 6. EXPERIENCES APIs
# ============================================

@csrf_exempt
@require_http_methods(["GET", "POST"])
def experiences(request):
    """
    GET /api/applicant-info/experiences - Get all experiences or single by id query param
    POST /api/applicant-info/experiences - Create, Update, Delete, or Reorder experiences
    
    POST actions (via 'action' field):
    - create: Create new experience
    - update: Update existing experience (requires 'id')
    - delete: Delete experience (requires 'id')
    - reorder: Reorder experiences (requires 'experienceOrders')
    """
    if request.method == "GET":
        try:
            experience_id = request.GET.get('id')
            
            if experience_id:
                try:
                    experience = Experiences.objects.get(id=experience_id)
                    data = {
                        "id": str(experience.id),
                        "experienceName": experience.experience_name,
                        "startDate": experience.start_date,
                        "endDate": experience.end_date,
                        "role": experience.role,
                        "location": experience.location,
                        "experienceExplanation": experience.experience_explanation,
                        "displayOrder": experience.display_order
                    }
                    return json_response(success=True, data=data)
                except Experiences.DoesNotExist:
                    return json_response(
                        success=False,
                        error={
                            "code": "NOT_FOUND",
                            "message": "Experience not found"
                        },
                        status=404
                    )
            else:
                experiences_list = Experiences.objects.all().order_by('display_order')
                data = [
                    {
                        "id": str(exp.id),
                        "experienceName": exp.experience_name,
                        "startDate": exp.start_date,
                        "endDate": exp.end_date,
                        "role": exp.role,
                        "location": exp.location,
                        "experienceExplanation": exp.experience_explanation,
                        "displayOrder": exp.display_order
                    }
                    for exp in experiences_list
                ]
                return json_response(success=True, data=data)
        
        except Exception as e:
            return json_response(
                success=False,
                error={
                    "code": "DATABASE_ERROR",
                    "message": "Failed to retrieve experiences",
                    "details": str(e)
                },
                status=500
            )
    
    else:  # POST
        try:
            body = parse_json_body(request)
            if body is None:
                return json_response(
                    success=False,
                    error={
                        "code": "VALIDATION_ERROR",
                        "message": "Invalid JSON in request body"
                    },
                    status=400
                )
            
            action = body.get('action', 'create')
            
            if action == 'create':
                display_order = body.get('displayOrder', Experiences.objects.count())
                
                experience = Experiences(
                    experience_name=body.get('experienceName'),
                    start_date=body.get('startDate'),
                    end_date=body.get('endDate'),
                    role=body.get('role'),
                    location=body.get('location'),
                    experience_explanation=body.get('experienceExplanation'),
                    display_order=display_order
                )
                experience.full_clean()
                experience.save()
                
                data = {
                    "id": str(experience.id),
                    "experienceName": experience.experience_name,
                    "startDate": experience.start_date,
                    "endDate": experience.end_date,
                    "role": experience.role,
                    "location": experience.location,
                    "experienceExplanation": experience.experience_explanation,
                    "displayOrder": experience.display_order
                }
                
                return json_response(
                    success=True,
                    data=data,
                    message="Experience created successfully"
                )
            
            elif action == 'update':
                experience_id = body.get('id')
                if not experience_id:
                    return json_response(
                        success=False,
                        error={
                            "code": "VALIDATION_ERROR",
                            "message": "Experience ID is required for update"
                        },
                        status=400
                    )
                
                try:
                    experience = Experiences.objects.get(id=experience_id)
                except Experiences.DoesNotExist:
                    return json_response(
                        success=False,
                        error={
                            "code": "NOT_FOUND",
                            "message": "Experience not found"
                        },
                        status=404
                    )
                
                if 'experienceName' in body:
                    experience.experience_name = body['experienceName']
                if 'startDate' in body:
                    experience.start_date = body['startDate']
                if 'endDate' in body:
                    experience.end_date = body['endDate']
                if 'role' in body:
                    experience.role = body['role']
                if 'location' in body:
                    experience.location = body['location']
                if 'experienceExplanation' in body:
                    experience.experience_explanation = body['experienceExplanation']
                if 'displayOrder' in body:
                    experience.display_order = body['displayOrder']
                
                experience.full_clean()
                experience.save()
                
                data = {
                    "id": str(experience.id),
                    "experienceName": experience.experience_name,
                    "startDate": experience.start_date,
                    "endDate": experience.end_date,
                    "role": experience.role,
                    "location": experience.location,
                    "experienceExplanation": experience.experience_explanation,
                    "displayOrder": experience.display_order
                }
                
                return json_response(
                    success=True,
                    data=data,
                    message="Experience updated successfully"
                )
            
            elif action == 'delete':
                experience_id = body.get('id')
                if not experience_id:
                    return json_response(
                        success=False,
                        error={
                            "code": "VALIDATION_ERROR",
                            "message": "Experience ID is required for delete"
                        },
                        status=400
                    )
                
                try:
                    experience = Experiences.objects.get(id=experience_id)
                except Experiences.DoesNotExist:
                    return json_response(
                        success=False,
                        error={
                            "code": "NOT_FOUND",
                            "message": "Experience not found"
                        },
                        status=404
                    )
                
                experience.delete()
                
                return json_response(
                    success=True,
                    message="Experience deleted successfully"
                )
            
            elif action == 'reorder':
                experience_orders = body.get('experienceOrders', [])
                
                with transaction.atomic():
                    for order in experience_orders:
                        experience_id = order.get('id')
                        display_order = order.get('displayOrder')
                        
                        try:
                            experience = Experiences.objects.get(id=experience_id)
                            experience.display_order = display_order
                            experience.save()
                        except Experiences.DoesNotExist:
                            continue
                
                return json_response(
                    success=True,
                    message="Experiences reordered successfully"
                )
            
            else:
                return json_response(
                    success=False,
                    error={
                        "code": "VALIDATION_ERROR",
                        "message": f"Invalid action: {action}. Use 'create', 'update', 'delete', or 'reorder'"
                    },
                    status=400
                )
        
        except ValidationError as e:
            return handle_validation_error(e)
        except Exception as e:
            return json_response(
                success=False,
                error={
                    "code": "DATABASE_ERROR",
                    "message": "Failed to process experience request",
                    "details": str(e)
                },
                status=500
            )


# ============================================
# 7. COMPLETE APPLICANT INFO API
# ============================================

@csrf_exempt
@require_http_methods(["GET"])
def complete_applicant_info(request):
    """GET /api/applicant-info/complete - Get all applicant information"""
    try:
        # Get basic info
        basic_info = ApplicantBasicInfo.objects.first()
        basic_data = None
        if basic_info:
            basic_data = {
                "id": str(basic_info.id),
                "fullName": basic_info.full_name,
                "phoneNumber": basic_info.phone_number,
                "email": basic_info.email,
                "linkedinUrl": basic_info.linkedin_url,
                "githubUrl": basic_info.github_url,
                "address": basic_info.address
            }
        
        # Get academics
        academics_list = Academics.objects.all().order_by('display_order')
        academics_data = [
            {
                "id": str(academic.id),
                "collegeName": academic.college_name,
                "graduationDate": academic.graduation_date,
                "course": academic.course,
                "displayOrder": academic.display_order
            }
            for academic in academics_list
        ]
        
        # Get achievements
        achievements_list = Achievements.objects.all().order_by('display_order')
        achievements_data = [
            {
                "id": str(achievement.id),
                "achievementPoint": achievement.achievement_point,
                "displayOrder": achievement.display_order
            }
            for achievement in achievements_list
        ]
        
        # Get user skills
        user_skills_list = UserSkills.objects.all().select_related('skill')
        skills_data = [serialize_skill(us.skill) for us in user_skills_list]
        
        # Get projects
        projects_list = Projects.objects.all().order_by('display_order')
        projects_data = [serialize_project_with_skills(project) for project in projects_list]
        
        # Get experiences
        experiences_list = Experiences.objects.all().order_by('display_order')
        experiences_data = [
            {
                "id": str(exp.id),
                "experienceName": exp.experience_name,
                "startDate": exp.start_date,
                "endDate": exp.end_date,
                "role": exp.role,
                "location": exp.location,
                "experienceExplanation": exp.experience_explanation,
                "displayOrder": exp.display_order
            }
            for exp in experiences_list
        ]
        
        data = {
            "basicInformation": basic_data,
            "academics": academics_data,
            "achievements": achievements_data,
            "skills": skills_data,
            "projects": projects_data,
            "experiences": experiences_data
        }
        
        return json_response(success=True, data=data)
    
    except Exception as e:
        return json_response(
            success=False,
            error={
                "code": "DATABASE_ERROR",
                "message": "Failed to retrieve complete applicant information",
                "details": str(e)
            },
            status=500
        )


# ============================================
# 8. APPLICATIONS APIs
# ============================================

@csrf_exempt
@require_http_methods(["GET", "POST"])
def applications(request):
    """
    GET /api/applications - Get all applications or single by id query param
    POST /api/applications - Create, Update, or Delete applications
    
    GET query parameters:
    - id: Get specific application by ID
    - status: Filter by status
    - company: Filter by company name (contains)
    - limit: Pagination limit (default: 10)
    - offset: Pagination offset (default: 0)
    - sortBy: Sort field (jobName, companyName, status)
    - sortOrder: Sort order (asc, desc)
    
    POST actions (via 'action' field):
    - create: Create new application
    - update: Update existing application (requires 'id')
    - delete: Delete application (requires 'id')
    """
    if request.method == "GET":
        try:
            application_id = request.GET.get('id')
            
            if application_id:
                try:
                    application = Applications.objects.get(id=application_id)
                    data = {
                        "id": str(application.id),
                        "jobName": application.job_name,
                        "companyName": application.company_name,
                        "jobLink": application.job_link,
                        "resumeFilePath": application.resume_file_path,
                        "status": application.status,
                        "notes": application.notes
                    }
                    return json_response(success=True, data=data)
                except Applications.DoesNotExist:
                    return json_response(
                        success=False,
                        error={
                            "code": "NOT_FOUND",
                            "message": "Application not found"
                        },
                        status=404
                    )
            else:
                # Get query parameters
                status = request.GET.get('status')
                company = request.GET.get('company')
                limit = int(request.GET.get('limit', 10))
                offset = int(request.GET.get('offset', 0))
                sort_by = request.GET.get('sortBy', 'created_at')
                sort_order = request.GET.get('sortOrder', 'desc')
                
                # Map frontend field names to model field names
                sort_field_map = {
                    'jobName': 'job_name',
                    'companyName': 'company_name',
                    'status': 'status'
                }
                sort_field = sort_field_map.get(sort_by, 'created_at')
                
                # Build query
                applications_list = Applications.objects.all()
                
                if status:
                    applications_list = applications_list.filter(status=status)
                
                if company:
                    applications_list = applications_list.filter(company_name__icontains=company)
                
                # Sorting
                if sort_order == 'desc':
                    sort_field = f'-{sort_field}'
                
                applications_list = applications_list.order_by(sort_field)
                
                # Get total count
                total = applications_list.count()
                
                # Pagination
                applications_list = applications_list[offset:offset + limit]
                
                applications_data = [
                    {
                        "id": str(app.id),
                        "jobName": app.job_name,
                        "companyName": app.company_name,
                        "jobLink": app.job_link,
                        "resumeFilePath": app.resume_file_path,
                        "status": app.status,
                        "notes": app.notes
                    }
                    for app in applications_list
                ]
                
                data = {
                    "applications": applications_data,
                    "total": total,
                    "page": offset // limit + 1 if limit > 0 else 1,
                    "limit": limit
                }
                
                return json_response(success=True, data=data)
        
        except Exception as e:
            return json_response(
                success=False,
                error={
                    "code": "DATABASE_ERROR",
                    "message": "Failed to retrieve applications",
                    "details": str(e)
                },
                status=500
            )
    
    else:  # POST
        try:
            body = parse_json_body(request)
            if body is None:
                return json_response(
                    success=False,
                    error={
                        "code": "VALIDATION_ERROR",
                        "message": "Invalid JSON in request body"
                    },
                    status=400
                )
            
            action = body.get('action', 'create')
            
            if action == 'create':
                resume_file_path = f"ResumeBlobs/placeholder_{uuid.uuid4()}.pdf"
                
                application = Applications(
                    job_name=body.get('jobName'),
                    company_name=body.get('companyName'),
                    job_link=body.get('jobLink'),
                    resume_file_path=resume_file_path,
                    status=body.get('status', 'Applied'),
                    notes=body.get('notes')
                )
                application.full_clean()
                application.save()
                
                data = {
                    "id": str(application.id),
                    "jobName": application.job_name,
                    "companyName": application.company_name,
                    "jobLink": application.job_link,
                    "resumeFilePath": application.resume_file_path,
                    "status": application.status,
                    "notes": application.notes
                }
                
                return json_response(
                    success=True,
                    data=data,
                    message="Application created successfully"
                )
            
            elif action == 'update':
                application_id = body.get('id')
                if not application_id:
                    return json_response(
                        success=False,
                        error={
                            "code": "VALIDATION_ERROR",
                            "message": "Application ID is required for update"
                        },
                        status=400
                    )
                
                try:
                    application = Applications.objects.get(id=application_id)
                except Applications.DoesNotExist:
                    return json_response(
                        success=False,
                        error={
                            "code": "NOT_FOUND",
                            "message": "Application not found"
                        },
                        status=404
                    )
                
                if 'jobName' in body:
                    application.job_name = body['jobName']
                if 'companyName' in body:
                    application.company_name = body['companyName']
                if 'jobLink' in body:
                    application.job_link = body['jobLink']
                if 'status' in body:
                    application.status = body['status']
                if 'notes' in body:
                    application.notes = body['notes']
                
                application.full_clean()
                application.save()
                
                data = {
                    "id": str(application.id),
                    "jobName": application.job_name,
                    "companyName": application.company_name,
                    "jobLink": application.job_link,
                    "resumeFilePath": application.resume_file_path,
                    "status": application.status,
                    "notes": application.notes
                }
                
                return json_response(
                    success=True,
                    data=data,
                    message="Application updated successfully"
                )
            
            elif action == 'delete':
                application_id = body.get('id')
                if not application_id:
                    return json_response(
                        success=False,
                        error={
                            "code": "VALIDATION_ERROR",
                            "message": "Application ID is required for delete"
                        },
                        status=400
                    )
                
                try:
                    application = Applications.objects.get(id=application_id)
                except Applications.DoesNotExist:
                    return json_response(
                        success=False,
                        error={
                            "code": "NOT_FOUND",
                            "message": "Application not found"
                        },
                        status=404
                    )
                
                # Delete resume file if it exists
                if application.resume_file_path and not application.resume_file_path.startswith('ResumeBlobs/placeholder_'):
                    resume_path = Path(__file__).resolve().parent.parent / application.resume_file_path
                    if resume_path.exists():
                        resume_path.unlink()
                
                application.delete()
                
                return json_response(
                    success=True,
                    message="Application deleted successfully"
                )
            
            else:
                return json_response(
                    success=False,
                    error={
                        "code": "VALIDATION_ERROR",
                        "message": f"Invalid action: {action}. Use 'create', 'update', or 'delete'"
                    },
                    status=400
                )
        
        except ValidationError as e:
            return handle_validation_error(e)
        except Exception as e:
            return json_response(
                success=False,
                error={
                    "code": "DATABASE_ERROR",
                    "message": "Failed to process application request",
                    "details": str(e)
                },
                status=500
            )


# ============================================
# 9. RESUME FILE MANAGEMENT APIs
# ============================================

@csrf_exempt
@require_http_methods(["GET", "POST"])
def resume_file(request):
    """
    GET /api/resume - Download resume file (requires 'id' query param)
    POST /api/resume - Upload or delete resume file
    
    POST actions (via 'action' field):
    - upload: Upload resume file (requires 'id' in body, file in FILES)
    - delete: Delete resume file (requires 'id' in body)
    """
    if request.method == "GET":
        try:
            application_id = request.GET.get('id')
            if not application_id:
                return json_response(
                    success=False,
                    error={
                        "code": "VALIDATION_ERROR",
                        "message": "Application ID is required"
                    },
                    status=400
                )
            
            try:
                application = Applications.objects.get(id=application_id)
            except Applications.DoesNotExist:
                return json_response(
                    success=False,
                    error={
                        "code": "NOT_FOUND",
                        "message": "Application not found"
                    },
                    status=404
                )
            
            # Check if resume file exists
            if not application.resume_file_path or application.resume_file_path.startswith('ResumeBlobs/placeholder_'):
                return json_response(
                    success=False,
                    error={
                        "code": "FILE_NOT_FOUND",
                        "message": "Resume file not found"
                    },
                    status=404
                )
            
            base_dir = Path(__file__).resolve().parent.parent
            file_path = base_dir / application.resume_file_path
            
            if not file_path.exists():
                return json_response(
                    success=False,
                    error={
                        "code": "FILE_NOT_FOUND",
                        "message": "Resume file not found on server"
                    },
                    status=404
                )
            
            # Determine content type
            file_extension = file_path.suffix.lower()
            content_type_map = {
                '.pdf': 'application/pdf',
                '.doc': 'application/msword',
                '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            }
            content_type = content_type_map.get(file_extension, 'application/octet-stream')
            
            # Return file
            response = FileResponse(open(file_path, 'rb'), content_type=content_type)
            response['Content-Disposition'] = f'attachment; filename="{file_path.name}"'
            return response
        
        except Exception as e:
            return json_response(
                success=False,
                error={
                    "code": "FILE_NOT_FOUND",
                    "message": "Failed to download resume",
                    "details": str(e)
                },
                status=500
            )
    
    else:  # POST
        try:
            action = request.POST.get('action', 'upload')
            application_id = request.POST.get('id')
            
            if not application_id:
                return json_response(
                    success=False,
                    error={
                        "code": "VALIDATION_ERROR",
                        "message": "Application ID is required"
                    },
                    status=400
                )
            
            try:
                application = Applications.objects.get(id=application_id)
            except Applications.DoesNotExist:
                return json_response(
                    success=False,
                    error={
                        "code": "NOT_FOUND",
                        "message": "Application not found"
                    },
                    status=404
                )
            
            if action == 'upload':
                # Check if file is in request
                if 'file' not in request.FILES:
                    return json_response(
                        success=False,
                        error={
                            "code": "FILE_UPLOAD_ERROR",
                            "message": "No file provided"
                        },
                        status=400
                    )
                
                uploaded_file = request.FILES['file']
                
                # Validate file type
                allowed_types = ['application/pdf', 'application/msword', 
                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
                if uploaded_file.content_type not in allowed_types:
                    return json_response(
                        success=False,
                        error={
                            "code": "INVALID_FILE_TYPE",
                            "message": "Only PDF, DOC, and DOCX files are allowed"
                        },
                        status=400
                    )
                
                # Validate file size (10MB max)
                max_size = 10 * 1024 * 1024  # 10MB
                if uploaded_file.size > max_size:
                    return json_response(
                        success=False,
                        error={
                            "code": "FILE_SIZE_EXCEEDED",
                            "message": "File size exceeds 10MB limit"
                        },
                        status=400
                    )
                
                # Create ResumeBlobs directory if it doesn't exist
                base_dir = Path(__file__).resolve().parent.parent
                resume_dir = base_dir / 'ResumeBlobs'
                resume_dir.mkdir(exist_ok=True)
                
                # Generate unique filename
                file_extension = Path(uploaded_file.name).suffix
                filename = f"{application_id}_{uuid.uuid4()}{file_extension}"
                file_path = resume_dir / filename
                
                # Delete old resume file if exists
                if application.resume_file_path and not application.resume_file_path.startswith('ResumeBlobs/placeholder_'):
                    old_path = base_dir / application.resume_file_path
                    if old_path.exists():
                        old_path.unlink()
                
                # Save file
                with open(file_path, 'wb+') as destination:
                    for chunk in uploaded_file.chunks():
                        destination.write(chunk)
                
                # Update application
                application.resume_file_path = f"ResumeBlobs/{filename}"
                application.save()
                
                data = {
                    "resumeFilePath": application.resume_file_path,
                    "fileName": filename,
                    "fileSize": uploaded_file.size,
                    "mimeType": uploaded_file.content_type
                }
                
                return json_response(
                    success=True,
                    data=data,
                    message="Resume uploaded successfully"
                )
            
            elif action == 'delete':
                # Delete resume file if exists
                if application.resume_file_path and not application.resume_file_path.startswith('ResumeBlobs/placeholder_'):
                    base_dir = Path(__file__).resolve().parent.parent
                    file_path = base_dir / application.resume_file_path
                    if file_path.exists():
                        file_path.unlink()
                
                # Update application with placeholder
                application.resume_file_path = f"ResumeBlobs/placeholder_{uuid.uuid4()}.pdf"
                application.save()
                
                return json_response(
                    success=True,
                    message="Resume deleted successfully"
                )
            
            else:
                return json_response(
                    success=False,
                    error={
                        "code": "VALIDATION_ERROR",
                        "message": f"Invalid action: {action}. Use 'upload' or 'delete'"
                    },
                    status=400
                )
        
        except Exception as e:
            return json_response(
                success=False,
                error={
                    "code": "FILE_UPLOAD_ERROR",
                    "message": "Failed to process resume file request",
                    "details": str(e)
                },
                status=500
            )


# ============================================
# 10. APPLICATION STATISTICS API
# ============================================

@csrf_exempt
@require_http_methods(["GET"])
def application_stats(request):
    """GET /api/applications/stats - Get application statistics"""
    try:
        # Total applications
        total = Applications.objects.count()
        
        # Count by status
        status_counts = {
            'Applied': Applications.objects.filter(status='Applied').count(),
            'Rejected': Applications.objects.filter(status='Rejected').count(),
            'Timed out': Applications.objects.filter(status='Timed out').count(),
            'Processed': Applications.objects.filter(status='Processed').count(),
            'Accepted': Applications.objects.filter(status='Accepted').count(),
            'Interview': Applications.objects.filter(status='Interview').count(),
        }
        
        # Calculate success rate
        successful_statuses = ['Accepted', 'Interview']
        successful_count = Applications.objects.filter(status__in=successful_statuses).count()
        success_rate = (successful_count / total * 100) if total > 0 else 0
        
        # Recent applications (last 5)
        recent_applications = Applications.objects.all().order_by('-created_at')[:5]
        recent_data = [
            {
                "id": str(app.id),
                "jobName": app.job_name,
                "companyName": app.company_name,
                "status": app.status
            }
            for app in recent_applications
        ]
        
        data = {
            "total": total,
            "byStatus": status_counts,
            "successRate": round(success_rate, 2),
            "recentApplications": recent_data
        }
        
        return json_response(success=True, data=data)
    
    except Exception as e:
        return json_response(
            success=False,
            error={
                "code": "DATABASE_ERROR",
                "message": "Failed to retrieve application statistics",
                "details": str(e)
            },
            status=500
        )
