from django.db import connection
from AnalyzerApp.Analysis import llm_code
import pandas as pd


def _query_df(sql, params):
    """Run a query on the default (Postgres) connection and return a DataFrame."""
    with connection.cursor() as cursor:
        cursor.execute(sql, params)
        return pd.DataFrame(cursor.fetchall(), columns=[c[0] for c in cursor.description])

# Generate experience output
def generate_experience_output(user_id, job_role, job_description, experiences_points_count, additional_instruction):
    try:
        # Get experiences from database
        experiences = _query_df(
            "SELECT * FROM experiences WHERE user_id = %s ORDER BY display_order",
            [user_id],
        )

        # Convert experiences to input format
        experiences_input = [{"experience_id":i["display_order"]+1,"experience_company_name":i["experience_name"], "experience_role":i["role"], "experience_description":i["experience_explanation"]} for i in experiences.to_dict(orient="records")]

        # Add resume points to experiences input
        for i in range(len(experiences_input)):
            experiences_input[i]["resume_points"] = experiences_points_count[i]

        # Generate experience output
        llm_output = llm_code.generate_enhanced_experience_points(job_role, job_description, experiences_input, None if additional_instruction=="" else additional_instruction)

        experience_output= []
        for llm_experience in llm_output:
            experience_data = experiences[experiences["display_order"] == int(llm_experience["experience_id"])-1].iloc[0].to_dict()
            experience_output.append({
                "experience_id": int(llm_experience["experience_id"]),
                "experience_role": llm_experience["experience_role"],
                "resume_points": llm_experience["resume_points"],
                "experience_company_name": experience_data["experience_name"],
                "start_date": experience_data["start_date"],
                "end_date": experience_data["end_date"],
            })
        
        return experience_output
    except Exception as e:
        raise e

# Generate project output
def generate_project_output(user_id, job_role, job_description, project_points_count, additional_instruction):

    try:
        # Get projects from database
        projects_skills_data = _query_df("""
        SELECT p.*, STRING_AGG(s.skill_name, ', ') as skills FROM project_skills as ps
        INNER JOIN projects as p ON ps.project_id = p.id
        INNER JOIN skills as s ON ps.skill_id = s.id
        WHERE p.user_id = %s
        GROUP BY p.id
        ORDER BY p.display_order
        """, [user_id])

        # Convert projects to input format
        projects_input = [{"project_id":i["display_order"]+1, "project_name":i["project_name"], "project_description":i["project_info"], "project_skills":i["skills"].split(', ')} for i in projects_skills_data.to_dict(orient="records")]
        
        # Add resume points to projects input
        for i in range(len(projects_input)):
            projects_input[i]["resume_points"] = project_points_count[i]

        # Generate project output
        project_output = llm_code.generate_enhanced_project_points(job_role, job_description, projects_input, None if additional_instruction=="" else additional_instruction)

        return project_output
    except Exception as e:
        raise e

# Generate skill output
def generate_skill_output(user_id, job_role, job_description, additional_instruction, include_web_research, experience_data, project_data):
    try:
        # Get skills from database
        skills_data = _query_df("""
            SELECT s.category, STRING_AGG(s.skill_name, ', ') as skills FROM skills as s
            INNER JOIN user_skills as us ON us.skill_id = s.id
            WHERE us.user_id = %s
            GROUP BY s.category
            """, [user_id])

        # Convert skills to input format
        skills_input = [{ "skill_category":i["category"], "skill_names":i["skills"].split(', ')} for i in skills_data.to_dict(orient="records")]

        # Generate skill output
        skill_output = llm_code.generate_optimized_skills_with_research(job_role, job_description, skills_input, experience_data, project_data,include_web_research, None if additional_instruction=="" else additional_instruction)

        return skill_output
    except Exception as e:
        raise e
