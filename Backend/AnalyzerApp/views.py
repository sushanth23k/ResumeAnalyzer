from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from AnalyzerApp.Analysis.genrators import (
    generate_experience_output,
    generate_project_output,
    generate_skill_output,
)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def experience_generation(request):
    try:
        data = request.data
        experience_output = generate_experience_output(
            data.get("job_role"),
            data.get("job_description"),
            data.get("points_count"),
            data.get("additional_instruction"),
        )
        return Response({'message': 'Experience generation', 'status': 'success', 'output': experience_output})
    except Exception as e:
        return Response({'message': 'Experience generation', 'status': 'error', 'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def project_generation(request):
    try:
        data = request.data
        project_output = generate_project_output(
            data.get("job_role"),
            data.get("job_description"),
            data.get("points_count"),
            data.get("additional_instruction"),
        )
        return Response({'message': 'Project generation', 'status': 'success', 'output': project_output})
    except Exception as e:
        return Response({'message': 'Project generation', 'status': 'error', 'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def skill_generation(request):
    try:
        data = request.data
        skill_output = generate_skill_output(
            data.get("job_role"),
            data.get("job_description"),
            data.get("additional_instruction"),
            data.get("include_web_research"),
            data.get("experience_data"),
            data.get("project_data"),
        )
        return Response({'message': 'Skill generation', 'status': 'success', 'output': skill_output})
    except Exception as e:
        return Response({'message': 'Skill generation', 'status': 'error', 'error': str(e)}, status=500)
