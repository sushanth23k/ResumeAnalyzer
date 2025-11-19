from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from BackendApp.views import parse_json_body
from AnalyzerApp.Analysis.genrators import generate_experience_output, generate_project_output, generate_skill_output

# Resume Analyzer APIs
## Experience Generation
@csrf_exempt
@require_http_methods(["POST"])
def experience_generation(request):

    try:
        request_data = parse_json_body(request)
        job_role = request_data.get("job_role")
        job_description = request_data.get("job_description")
        experiences_points_count = request_data.get("points_count")
        additional_instruction = request_data.get("additional_instruction")

        # Generate experience output
        experience_output = generate_experience_output(job_role, job_description, experiences_points_count, additional_instruction)

        return JsonResponse({'message': 'Experience generation', 'status': "success", "output": experience_output})
    except Exception as e:
        return JsonResponse({'message': 'Experience generation', 'status': "error", "error": str(e)})
        
## Project Generation
@csrf_exempt
@require_http_methods(["POST"])
def project_generation(request):

    try:
        request_data = parse_json_body(request)
        job_role = request_data.get("job_role")
        job_description = request_data.get("job_description")
        project_points_count = request_data.get("points_count")
        additional_instruction = request_data.get("additional_instruction")

        # Generate project output
        project_output = generate_project_output(job_role, job_description, project_points_count, additional_instruction)

        return JsonResponse({'message': 'Project generation', 'status': "success", "output": project_output})
    except Exception as e:
        return JsonResponse({'message': 'Project generation', 'status': "error", "error": str(e)})
    
## Skill Generation
@csrf_exempt
@require_http_methods(["POST"])
def skill_generation(request):
    try:
        request_data = parse_json_body(request)
        job_role = request_data.get("job_role")
        job_description = request_data.get("job_description")
        include_web_research = request_data.get("include_web_research")
        additional_instruction = request_data.get("additional_instruction")
        experience_data = request_data.get("experience_data")
        project_data = request_data.get("project_data")

        # Generate skill output
        skill_output = generate_skill_output(job_role, job_description, additional_instruction, include_web_research, experience_data, project_data)

        return JsonResponse({'message': 'Skill generation', 'status': "success", "output": skill_output})
    except Exception as e:
        return JsonResponse({'message': 'Skill generation', 'status': "error", "error": str(e)})
    