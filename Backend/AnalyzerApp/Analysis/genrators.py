from collections import defaultdict

from AnalyzerApp.Analysis import llm_code
from BackendApp.models import Experiences, Projects, ProjectSkills, UserSkills

# Generate experience output
def generate_experience_output(user, job_role, job_description, experiences_points_count, additional_instruction):
    try:
        # Get the user's experiences from database
        experiences = list(Experiences.objects.filter(user=user).order_by('display_order'))

        # Convert experiences to input format
        experiences_input = [{"experience_id":i.display_order+1,"experience_company_name":i.experience_name, "experience_role":i.role, "experience_description":i.experience_explanation} for i in experiences]

        # Add resume points to experiences input
        for i in range(len(experiences_input)):
            experiences_input[i]["resume_points"] = experiences_points_count[i]

        # Generate experience output
        llm_output = llm_code.generate_enhanced_experience_points(job_role, job_description, experiences_input, None if additional_instruction=="" else additional_instruction)

        experience_output= []
        for llm_experience in llm_output:
            experience_data = next(e for e in experiences if e.display_order == int(llm_experience["experience_id"])-1)
            experience_output.append({
                "experience_id": int(llm_experience["experience_id"]),
                "experience_role": llm_experience["experience_role"],
                "resume_points": llm_experience["resume_points"],
                "experience_company_name": experience_data.experience_name,
                "start_date": experience_data.start_date,
                "end_date": experience_data.end_date,
            })
        
        return experience_output
    except Exception as e:
        raise e

# Generate project output
def generate_project_output(user, job_role, job_description, project_points_count, additional_instruction):

    try:
        # Get the user's projects (including those without skills) from database
        project_skills = defaultdict(list)
        for ps in ProjectSkills.objects.filter(project__user=user).select_related('skill'):
            project_skills[ps.project_id].append(ps.skill.skill_name)
        projects = list(Projects.objects.filter(user=user).order_by('display_order'))

        # Convert projects to input format
        projects_input = [{"project_id":p.display_order+1, "project_name":p.project_name, "project_description":p.project_info, "project_skills":project_skills.get(p.id, [])} for p in projects]

        if not projects_input:
            raise ValueError("No projects found for this user; add projects before generating")
        
        # Add resume points to projects input
        for i in range(len(projects_input)):
            projects_input[i]["resume_points"] = project_points_count[i]

        # Generate project output
        project_output = llm_code.generate_enhanced_project_points(job_role, job_description, projects_input, None if additional_instruction=="" else additional_instruction)

        return project_output
    except Exception as e:
        raise e

# Generate skill output
def generate_skill_output(user, job_role, job_description, additional_instruction, include_web_research, experience_data, project_data):
    try:
        # Get the user's skills from database, grouped by category
        skills_by_category = defaultdict(list)
        for us in UserSkills.objects.filter(user=user).select_related('skill'):
            skills_by_category[us.skill.category].append(us.skill.skill_name)

        # Convert skills to input format
        skills_input = [{ "skill_category":category, "skill_names":names} for category, names in skills_by_category.items()]

        # Generate skill output
        skill_output = llm_code.generate_optimized_skills_with_research(job_role, job_description, skills_input, experience_data, project_data,include_web_research, None if additional_instruction=="" else additional_instruction)

        return skill_output
    except Exception as e:
        raise e
