import groq
import dotenv
import os
import re
import json

# Load environment variables
dotenv.load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")
# Falls back to a default if MODEL_NAME is unset/blank in .env
model_name = os.getenv("MODEL_NAME") or "openai/gpt-oss-120b"

# Initialize Groq client
client = groq.Client(api_key=groq_api_key)

# gpt-oss models spend completion tokens on reasoning first; with a small budget the
# visible answer can come back empty, so keep reasoning light and the budget generous.
MAX_COMPLETION_TOKENS = 8192
LLM_ATTEMPTS = 2


def call_llm(messages, temperature):
    """Call Groq and return non-empty message content, retrying once if the model returns nothing."""
    last_finish_reason = None
    for _ in range(LLM_ATTEMPTS):
        chat_completion = client.chat.completions.create(
            messages=messages,
            model=model_name,
            temperature=temperature,
            max_completion_tokens=MAX_COMPLETION_TOKENS,
            reasoning_effort="low",
        )
        choice = chat_completion.choices[0]
        content = choice.message.content
        if content and content.strip():
            return content
        last_finish_reason = choice.finish_reason
    raise ValueError(
        f"The LLM returned an empty response (finish_reason={last_finish_reason}; "
        f"check MODEL_NAME, GROQ_API_KEY and token limits)"
        )


def parse_json_list(response_content):
    """Parse a JSON list out of an LLM response, with a descriptive error on failure."""
    if not response_content or not response_content.strip():
        raise ValueError("The LLM returned an empty response (check MODEL_NAME, GROQ_API_KEY and token limits)")

    # Drop reasoning blocks some models emit before the answer
    cleaned = re.sub(r'<think>.*?</think>', '', response_content, flags=re.DOTALL)

    json_match = re.search(r'\[.*\]', cleaned, re.DOTALL)
    try:
        return json.loads(json_match.group() if json_match else cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(f"The LLM response was not valid JSON ({e}). Response started with: {response_content[:200]!r}")


# Generate enhanced work experience points for job application
def generate_enhanced_experience_points(job_role, job_description, work_experience, additional_instruction=None):
    """
    Generate enhanced work experience points tailored for a specific job application
    using Groq API to optimize resume for ATS systems.
    
    Args:
        model_name: Groq model to use
        job_role: Target job role
        job_description: Job description with requirements
        work_experience: List of work experience data
        additional_instruction: Optional custom instruction to modify LLM behavior, output format, or analysis approach
    """

    # Construct the prompt for the LLM
    prompt = f"""
    You are an expert technical recruiter and ATS optimization specialist. Your goal is to transform the candidate's existing experience into high-impact, ATS-friendly resume bullet points that a hiring manager for the target role would immediately short-list.

    Job Role (target position): {job_role}
    Job Description (authoritative source of requirements): {job_description}
    Candidate Work Experience (must be preserved and enhanced, not replaced):"""

    work_experience_str = ""
    for i in work_experience:
        work_experience_str += f"""
        Experience ID: {i["experience_id"]}:
        Company: {i["experience_company_name"]}
        Role: {i["experience_role"]}
        Description: {i["experience_description"]}
        Experience Points: {i["resume_points"]}
        """
    # Add additional instruction if provided
    additional_instruction_text = ""
    if additional_instruction:
        additional_instruction_text = f"""
    
    ADDITIONAL INSTRUCTION (PRIORITY OVERRIDE):
    {additional_instruction}
    
    Note: The above additional instruction should modify your approach, output format, or analysis method as specified. Integrate this instruction with the base requirements below.
    """
    
    prompt = prompt + work_experience_str + additional_instruction_text + """
    Requirements for the bullet points:
    1. Use the structure: What + How + Why/Impact (except the first bullet, which is a simple, high-level summary).
    2. The first bullet for each experience should be a clear summary of the experience should be presented as a resume work experience bullet point.
    3. Aggressively incorporate relevant keywords and skills from the job description to maximize ATS scoring, but only where they make sense.
    4. Do not repeat any single skill more than 4 times across all experiences.
    5. Each bullet point must contain at least 25-30 words.
    6. Include clear, quantifiable outcomes or improvements (numbers, percentages, time saved, revenue impact, scale, reliability, etc.).
    7. Explicitly optimize content for ATS keyword filtering and recruiter readability (concise, impact-focused, no fluff).
    8. Add missing but relevant skills/tools from the job description by credibly mapping them onto the candidate's existing responsibilities and projects.
    9. Generate exactly the number of bullet points specified in the "resume_points" field for each experience—no more, no less.
    10. Follow professional resume style with strong action verbs, quantifiable metrics, and business impact.
    11. Keep the word count of all bullet points within a tight, consistent range (same rough length for every bullet).
    12. IMPORTANT: Creatively adapt and enhance the work experience to match job requirements, even if certain technologies or responsibilities were not explicitly mentioned originally.
    13. Strategically weave in missing job requirements by reframing existing work to demonstrate the relevant skills, tools, and ownership.
    14. Transform generic tasks into role-specific, outcome-driven achievements aligned to the target job.
    15. CRITICAL: Preserve the core project use cases and business contexts from the original experience (for example, drive-thru platforms, data processing workflows, metadata crawlers). Do NOT invent completely new projects.
    16. Always build on the existing project explanations instead of replacing them, enhancing them with job-relevant technologies, methodologies, and responsibilities.

    Example bullet format:
    • Modernized HSBC's customer profile system by refactoring monolithic bottlenecks into autonomous Java Spring Boot microservices with REST APIs, improving resiliency and reducing downtime by 30% through circuit breaker patterns.
    • Migrated a legacy mainframe database to cloud-native AWS S3 and CockroachDB (NoSQL) with near-zero downtime, ensuring 99% data integrity via Java-based batch validations and automated health checks.

    Output format (valid JSON only):
    [{{
        "experience_id": "experience_id_from_input",
        "experience_role": "role_from_input",
        "resume_points": ["bullet_point_1", "bullet_point_2", "bullet_point_3", ...]
    }}]

    You MUST:
    - Return only JSON in the exact format shown above (no extra commentary, no markdown, no explanations).
    - Ensure the number of bullet points for each experience exactly matches its "resume_points" value.
    - Ensure the final bullets would make a recruiter for the target role confident enough to move this candidate to the interview stage and that the resume will pass ATS filters for this job.
    """

    try:
        # Make API call to Groq
        response_content = call_llm(
            [
                {
                    "role": "system",
                    "content": "You are an expert resume writer specializing in ATS optimization and technical resume enhancement."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            0.8,
        )


        return parse_json_list(response_content)

    except Exception as e:
        print(f"Error generating enhanced experience points: {str(e)}")
        raise e

# Generate enhanced project points for job application
def generate_enhanced_project_points(job_role, job_description, project_info, additional_instruction=None):
    """
    Generate enhanced project points tailored for a specific job application
    using Groq API to optimize resume for ATS systems.
    
    Args:
        model_name: Groq model to use (e.g., "openai/gpt-oss-120b")
        job_role: Target job role
        job_description: Job description with requirements
        project_info: List of dicts with project_id, project_name, project_description, project_skills, resume_points
        additional_instruction: Optional custom instruction to modify LLM behavior, output format, or analysis approach
    
    Returns:
        List of dicts with project_id, project_name, project_points array, and project_skills array
    """
    
    # Construct the prompt for the LLM
    prompt = f"""
    You are an expert ATS optimization specialist. Transform existing projects into ATS-friendly resume content for this role.

    TARGET ROLE: {job_role}
    JOB REQUIREMENTS: {job_description}

    PROJECTS TO ENHANCE:"""

    for i in project_info:
        prompt += f"""
    Project ID: {i["project_id"]}
    Name: {i["project_name"]}
    Description: {i["project_description"]}
    Current Skills: {i["project_skills"]}
    Points Needed: {i["resume_points"]}
    """
    
    # Add additional instruction if provided
    additional_instruction_text = ""
    if additional_instruction:
        additional_instruction_text = f"""
    
    ADDITIONAL INSTRUCTION (PRIORITY OVERRIDE):
    {additional_instruction}
    
    Note: The above additional instruction should modify your approach, output format, or analysis method as specified. Integrate this instruction with the base requirements below.
    """
    
    prompt += additional_instruction_text + """
    REQUIREMENTS:
    1. PRESERVE project use cases (Airbnb analysis, farm data, etc.) - DO NOT change core business context
    2. UPDATE skills to match job requirements - replace irrelevant skills with job-relevant ones
    3. Bullets: What + How + Why/Impact structure
    4. 15-20 words minimum per bullet point
    5. Include quantifiable metrics (numbers, percentages, improvements)
    6. Use job description keywords for ATS optimization
    7. No skill repeats more than 4 times across all projects
    9. Match project_points count exactly to resume_points value
    10. Ensure project_skills align with technologies mentioned in project_points

    EXAMPLE OUTPUT:
    [{"project_id": 1, "project_name": "Customer Analytics Platform", "project_points": ["Built analytics system to help business understand customer behavior patterns", "Developed real-time dashboard using Python and AWS Lambda processing 1M+ records daily, reducing analysis time by 40%"], "project_skills": ["Python", "AWS Lambda", "Data Analytics"]}]

    OUTPUT FORMAT: Valid JSON only, no explanations. Ensure project_skills match technologies used in project_points.
    """
    
    try:
        # Make API call to Groq
        response_content = call_llm(
            [
                {
                    "role": "system",
                    "content": "You are an expert resume writer specializing in ATS optimization and technical resume enhancement for projects."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            0.8,
        )

        return parse_json_list(response_content)

    except Exception as e:
        print(f"Error generating enhanced project points: {str(e)}")
        raise e

# # Enhanced Skills Generator with Web Research Integration
# def generate_optimized_skills_with_research(job_role, job_description, current_skills, include_web_research, additional_instruction=None):
#     """
#     Generate an optimized skills list with optional web research for the most current industry trends.
    
#     Args:
#         model_name: Groq model to use
#         job_role: Target job role
#         job_description: Job description with requirements
#         current_skills: List of dicts with skill_category and skill_names
#         include_web_research: Whether to include web research for trending skills
#         additional_instruction: Optional custom instruction to modify LLM behavior, output format, or analysis approach
    
#     Returns:
#         Dict with optimized_skills list and research_insights (if web research enabled)
#     """
    
#     research_context = ""
#     research_insights = []
    
#     if include_web_research:
#         # Research current industry trends and tools
#         research_queries = [
#             f"{job_role} required skills 2024",
#             f"AWS contact center development tools",
#             f"Amazon Connect development skills",
#             f"cloud contact center technologies"
#         ]
        
#         print("🔍 Researching current industry trends...")
#         for query in research_queries:
#             try:
#                 # Note: In a real implementation, you would use web_search here
#                 # For now, we'll simulate this with comprehensive knowledge
#                 research_context += f"Research Query: {query}\n"
#             except Exception as e:
#                 print(f"Research query failed: {query} - {e}")
    
#     # Convert current skills to string format for the prompt
#     current_skills_str = ""
#     for skill_group in current_skills:
#         current_skills_str += f"Category: {skill_group['skill_category']}\n"
#         current_skills_str += f"Skills: {', '.join(skill_group['skill_names'])}\n\n"
    
#     # Add additional instruction if provided
#     additional_instruction_text = ""
#     if additional_instruction:
#         additional_instruction_text = f"""
        
#         ADDITIONAL INSTRUCTION (PRIORITY OVERRIDE):
#         {additional_instruction}
        
#         Note: The above additional instruction should modify your approach, output format, or analysis method as specified. Integrate this instruction with the base requirements below.
#         """
    
#     # Enhanced prompt with research context
#     prompt = f"""
#         You are an expert ATS optimization specialist and technical recruiter with deep knowledge of specific tools, frameworks, and technologies. Create an optimized skills list using ONLY specific, concrete tools and technologies - never use generic or ambiguous terms.

#         TARGET JOB ROLE: {job_role}
        
#         JOB DESCRIPTION: 
#         {job_description}

#         CURRENT SKILLS TO OPTIMIZE:
#         {current_skills_str}

#         INDUSTRY RESEARCH CONTEXT:
#         {research_context}
#         {additional_instruction_text}
#         CRITICAL REQUIREMENTS:
#         1. PRESERVE valuable existing skills that align with the role
#         2. ADD critical missing skills from job description (exact keyword matching)
#         3. DETECT cloud platform from job description - if AWS mentioned, use AWS tools; if Azure mentioned, use Azure tools; if GCP mentioned, use GCP tools
#         4. If NO cloud platform mentioned in job description, use cloud tools from existing skills data
#         5. ONLY use SPECIFIC tool names - NEVER generic terms like "Microservices Architecture", "Relational Databases", "Infrastructure as Code"
#         6. INCLUDE cutting-edge specific technologies and frameworks
#         7. ADD specific tools relevant to the job requirements
#         8. ENSURE skills demonstrate technical depth with specific tool knowledge

#         FORBIDDEN GENERIC TERMS (NEVER USE):
#         - "Microservices Architecture" → Use specific frameworks like "Spring Boot", "Node.js", "Django"
#         - "Relational Databases" → Use specific databases like "PostgreSQL", "MySQL", "SQL Server"
#         - "Infrastructure as Code" → Use specific tools like "Terraform", "CloudFormation", "Ansible"
#         - "NoSQL Databases" → Use specific databases like "MongoDB", "DynamoDB", "Cosmos DB"
#         - "Container Orchestration" → Use "Kubernetes", "Docker Swarm", "Azure Container Apps"
#         - "CI/CD" → Use "Jenkins", "GitLab CI", "Azure DevOps", "GitHub Actions"
#         - "RESTful APIs" → Use "Spring Boot REST", "Django REST Framework", "Express.js"

#         SPECIFIC SKILL CATEGORIES AND EXAMPLES:
#         - Programming Languages: Python, Java, C, C++, JavaScript, TypeScript, SQL, HTML, CSS, Go, Rust
#         - Web Frameworks: Django, Spring Boot, Flask, Node.js, ReactJS, Angular, Vue.js, Express.js
#         - Database Management: MongoDB, PostgreSQL, MySQL, Redis, DynamoDB, Cosmos DB, Pinecone, Hive
#         - Cloud Technologies: 
#         * AWS: Lambda, S3, EC2, RDS, Kinesis, SQS, SNS, CloudFormation, ECS, EKS
#         * Azure: Functions, Web Apps, Blob Storage, Cosmos DB, Service Bus, Logic Apps, ADF
#         * GCP: Cloud Functions, Pub/Sub, BigQuery, Cloud Storage, Dataflow, Cloud Run
#         - Event Streaming: Apache Kafka, Azure Service Bus, Google Pub/Sub, Amazon Kinesis, RabbitMQ
#         - Machine Learning & Gen AI: TensorFlow, Scikit-learn, LangChain, Vector DB, Pinecone, LLMs
#         - DevOps Tools: Docker, Kubernetes, Terraform, Ansible, Jenkins, GitLab CI, GitHub Actions
#         - Monitoring & Analytics: Splunk, Grafana, Prometheus, New Relic, Datadog, Power BI, Tableau

#         CLOUD PLATFORM DETECTION RULES:
#         - If job description mentions "AWS", "Amazon Web Services", or AWS services → Use AWS-specific tools
#         - If job description mentions "Azure", "Microsoft Azure" → Use Azure-specific tools  
#         - If job description mentions "GCP", "Google Cloud" → Use GCP-specific tools
#         - If multiple clouds mentioned → Use the most frequently mentioned one
#         - If no cloud mentioned → Use cloud tools from existing skills or most relevant for the role """+"""OUTPUT FORMAT (JSON only):
#         [
#             {
#                 "skill_category": "Programming Languages",
#                 "skills": ["Java", "Python", "JavaScript", "SQL", "TypeScript"]
#             },
#             {
#                 "skill_category": "Web Frameworks",
#                 "skills": ["Spring Boot", "ReactJS", "Node.js", "Django"]
#             }
#         ]

#         Generate a skills list with ONLY specific, concrete tools and technologies that would make recruiters immediately recognize technical expertise.
#     """

#     try:
#         # Make API call to Groq
#         chat_completion = client.chat.completions.create(
#             messages=[
#                 {
#                     "role": "system",
#                     "content": "You are an expert technical recruiter specializing in AWS and contact center technologies with deep knowledge of current industry trends and ATS optimization."
#                 },
#                 {
#                     "role": "user",
#                     "content": prompt
#                 }
#             ],
#             model=model_name,
#             temperature=0.6,
#         )

#         # Extract the response
#         response_content = chat_completion.choices[0].message.content

#         # Extract JSON from response
#         json_match = re.search(r'\[.*\]', response_content, re.DOTALL)
#         if json_match:
#             json_str = json_match.group()
#             optimized_skills = json.loads(json_str)
#         else:
#             optimized_skills = json.loads(response_content)

#         return optimized_skills

#     except Exception as e:
#         print(f"Error generating optimized skills: {str(e)}")
#         print(f"Raw response: {response_content}")
#         raise e

# Enhanced Skills Generator with Web Research Integration
def generate_optimized_skills_with_research(job_role, job_description, current_skills, enhanced_experience=None, enhanced_projects=None, include_web_research=True, additional_instruction=None):
    """
    Generate an efficient ATS-optimized skills list focused on job description alignment.
    
    Args:
        model_name: Groq model to use
        job_role: Target job role
        job_description: Job description with requirements (PRIMARY FOCUS)
        current_skills: List of dicts with skill_category and skill_names (PRESERVE existing)
        enhanced_experience: List of experience data (for validation only)
        enhanced_projects: List of project data (for validation only)
        include_web_research: Whether to enable web research validation
        additional_instruction: Optional custom instruction
    
    Returns:
        Dict with optimized_skills list (100-120 chars per category) and metadata
    """
    
    research_context = ""
    research_insights = []
    
    if include_web_research:
        print("🔍 Web research enabled for industry trends validation...")
    
    # Convert current skills to string format for the prompt
    current_skills_str = ""
    for skill_group in current_skills:
        current_skills_str += f"Category: {skill_group['skill_category']}\n"
        current_skills_str += f"Skills: {', '.join(skill_group['skill_names'])}\n\n"
    
    # Convert enhanced experience to string format
    experience_str = ""
    if enhanced_experience:
        experience_str = "\n        CANDIDATE'S WORK EXPERIENCE:\n"
        for exp in enhanced_experience:
            experience_str += f"        Role: {exp['experience_role']}\n"
            experience_str += "        Key Achievements:\n"
            for point in exp['resume_points']:
                experience_str += f"          • {point}\n"
            experience_str += "\n"
    
    # Convert enhanced projects to string format
    projects_str = ""
    if enhanced_projects:
        projects_str = "\n        CANDIDATE'S PROJECTS:\n"
        for proj in enhanced_projects:
            projects_str += f"        Project: {proj['project_name']}\n"
            projects_str += "        Highlights:\n"
            for point in proj['project_points']:
                projects_str += f"          • {point}\n"
            if 'project_skills' in proj and proj['project_skills']:
                projects_str += f"        Technologies Used: {', '.join(proj['project_skills'])}\n"
            projects_str += "\n"
    
    # Add additional instruction if provided
    additional_instruction_text = ""
    if additional_instruction:
        additional_instruction_text = f"""
        
        ADDITIONAL INSTRUCTION (PRIORITY OVERRIDE):
        {additional_instruction}
        
        Note: The above additional instruction should modify your approach, output format, or analysis method as specified. Integrate this instruction with the base requirements below.
        """
    
    # Enhanced prompt with research context
    prompt = f"""
        You are an expert ATS optimization specialist. Create an optimized skills list using ONLY specific, concrete tools and technologies.

        TARGET JOB ROLE: {job_role}
        
        JOB DESCRIPTION: 
        {job_description}

        CURRENT SKILLS TO OPTIMIZE:
        {current_skills_str}
        {experience_str}
        {projects_str}
        {additional_instruction_text}
        
        CORE REQUIREMENTS:
        1. PRIMARY FOCUS: Job description keywords and existing skills alignment
        2. PRESERVE all existing skills that match job requirements - DO NOT REMOVE them
        3. ADD missing critical skills from job description using exact keyword matching
        4. Experience/Projects: Use ONLY for validation - ensure skills mentioned there are included if job-relevant
        5. Use SPECIFIC tool names only - NO generic terms
        6. Each skill category should be 100-120 characters total (including category name and all skills)

        CHARACTER COUNT CONSTRAINT:
        - Each skill_category + skills combined should be approximately 100-120 characters
        - Prioritize most important skills if character limit is reached
        - Example: "Programming Languages" + ["Java", "Python", "SQL"] = ~50 chars, add more skills to reach 100-120

        FORBIDDEN GENERIC TERMS (NEVER USE):
        - "Microservices Architecture" → Use "Spring Boot", "Node.js", "Django"
        - "Relational Databases" → Use "PostgreSQL", "MySQL", "SQL Server"
        - "Infrastructure as Code" → Use "Terraform", "CloudFormation", "Ansible"
        - "NoSQL Databases" → Use "MongoDB", "DynamoDB", "Cosmos DB"
        - "Container Orchestration" → Use "Kubernetes", "Docker Swarm"
        - "CI/CD" → Use "Jenkins", "GitLab CI", "GitHub Actions"

        SPECIFIC SKILL CATEGORIES AND EXAMPLES:
        - Programming Languages: Python, Java, JavaScript, TypeScript, SQL, C++, Go
        - Web Frameworks: Spring Boot, ReactJS, Node.js, Django, Flask, Angular
        - Database Management: PostgreSQL, MongoDB, MySQL, Redis, DynamoDB, Pinecone
        - Cloud Technologies: 
          * AWS: Lambda, S3, EC2, RDS, Kinesis, SQS, CloudFormation, ECS
          * Azure: Functions, Blob Storage, Cosmos DB, Service Bus, Logic Apps
          * GCP: Cloud Functions, Pub/Sub, BigQuery, Cloud Storage, Cloud Run
        - DevOps Tools: Docker, Kubernetes, Terraform, Jenkins, GitLab CI
        - Machine Learning: TensorFlow, Scikit-learn, LangChain, Pinecone
        - Monitoring: Splunk, Grafana, Prometheus, New Relic, Datadog

        CLOUD PLATFORM DETECTION RULES:
        - If job description mentions "AWS" or AWS services → Use AWS-specific tools
        - If job description mentions "Azure" → Use Azure-specific tools  
        - If job description mentions "GCP"/"Google Cloud" → Use GCP-specific tools
        - If multiple clouds mentioned → Use the most frequently mentioned one
        - If no cloud mentioned → Use cloud tools from existing skills

        ATS OPTIMIZATION STRATEGY:
        1. KEYWORD MATCHING: Extract exact keywords from job description
        2. PRIORITIZE JOB-RELEVANT SKILLS: Job description skills appear first in categories
        3. TECHNOLOGY CONSISTENCY: Use specific tool names from experience/projects
        4. DEPTH OVER BREADTH: Fewer, well-evidenced skills over many unsubstantiated ones
        5. MAINTAIN TECHNICAL CREDIBILITY: All skills must be defensible

        SKILL VALIDATION (Secondary Priority):
        - If skill in experience/projects AND job-relevant → MUST include
        - If skill in current_skills AND job-relevant → MUST preserve
        - Add job description skills only if they complement existing expertise""" + """

        OUTPUT FORMAT (JSON only):
        [
            {
                "skill_category": "Programming Languages",
                "skills": ["Java", "Python", "JavaScript", "SQL", "TypeScript"]
            },
            {
                "skill_category": "Web Frameworks", 
                "skills": ["Spring Boot", "ReactJS", "Node.js", "Django"]
            }
        ]

        Focus: Job description alignment + existing skills preservation + 100-120 char limit per category.
    """
    
    try:
        # Make API call to Groq
        response_content = call_llm(
            [
                {
                    "role": "system",
                    "content": "You are an ATS optimization specialist. Focus on job description keywords, preserve existing relevant skills, and use specific tool names only. Keep each skill category within 100-120 characters total. Follow cloud platform detection rules and avoid generic terms."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            0.3,
        )

        return parse_json_list(response_content)

    except Exception as e:
        print(f"Error generating optimized skills: {str(e)}")
        print(f"Raw response: {response_content}")
        raise e

