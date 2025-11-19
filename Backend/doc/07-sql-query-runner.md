# SQL Query Runner Guide

**Document Version**: 1.0  
**Last Updated**: 2025

Complete guide for using the SQL query runner tool to interact with the ResumeAnalyzer database.

## Table of Contents

1. [Overview](#overview)
2. [Usage](#usage)
3. [Database Tables](#database-tables)
4. [Example Queries](#example-queries)
5. [Tips](#tips)
6. [Troubleshooting](#troubleshooting)


The `run_sql.py` script provides an easy way to run SQL queries on the ResumeAnalyzer SQLite database.

## Usage

### Interactive Mode (Recommended)

Run the script without arguments to enter interactive mode:

```bash
python run_sql.py
```

In interactive mode, you can:

#### Execute SQL Queries
```sql
SQL> SELECT * FROM applicant_basic_info;
SQL> SELECT COUNT(*) FROM applications WHERE status = 'Applied';
SQL> SELECT * FROM skills ORDER BY category;
```

#### Special Commands

- `.tables` - List all tables in the database
- `.schema <table_name>` - Show the schema for a specific table
- `.info <table_name>` - Show detailed information about a table
- `.count <table_name>` - Count rows in a table
- `.help` - Show help message
- `.quit` or `.exit` - Exit interactive mode

#### Examples

```bash
# List all tables
SQL> .tables

# Show schema for a table
SQL> .schema applicant_basic_info

# Show table info
SQL> .info applications

# Count rows
SQL> .count skills

# Execute custom query
SQL> SELECT * FROM applications WHERE status = 'Applied';
```

### Command Line Mode

Execute a single query from the command line:

```bash
python run_sql.py "SELECT * FROM applicant_basic_info;"
python run_sql.py "SELECT COUNT(*) FROM applications;"
python run_sql.py "SELECT name FROM sqlite_master WHERE type='table';"
```

## Database Tables

The following tables are available:

1. **applicant_basic_info** - Applicant personal information
2. **academics** - Educational background
3. **achievements** - Achievement points
4. **skills** - Master skills list
5. **user_skills** - User's selected skills (junction table)
6. **projects** - Project information
7. **project_skills** - Skills linked to projects (junction table)
8. **experiences** - Work experience information
9. **applications** - Job application tracking

## Example Queries

### View All Applications
```sql
SELECT * FROM applications ORDER BY created_at DESC;
```

### Count Applications by Status
```sql
SELECT status, COUNT(*) as count 
FROM applications 
GROUP BY status;
```

### List All Skills
```sql
SELECT skill_name, category 
FROM skills 
ORDER BY category, skill_name;
```

### View User Skills
```sql
SELECT s.skill_name, s.category 
FROM user_skills us
JOIN skills s ON us.skill_id = s.id
ORDER BY s.category;
```

### View Projects with Their Skills
```sql
SELECT p.project_name, GROUP_CONCAT(s.skill_name, ', ') as skills
FROM projects p
LEFT JOIN project_skills ps ON p.id = ps.project_id
LEFT JOIN skills s ON ps.skill_id = s.id
GROUP BY p.id, p.project_name;
```

### View Applications with Company Names
```sql
SELECT job_name, company_name, status, created_at
FROM applications
ORDER BY created_at DESC
LIMIT 10;
```

## Tips

1. **Use LIMIT** when exploring large tables:
   ```sql
   SELECT * FROM applications LIMIT 10;
   ```

2. **Use WHERE clauses** to filter data:
   ```sql
   SELECT * FROM applications WHERE status = 'Applied';
   ```

3. **Use JOIN** to combine related data:
   ```sql
   SELECT p.project_name, s.skill_name
   FROM projects p
   JOIN project_skills ps ON p.id = ps.project_id
   JOIN skills s ON ps.skill_id = s.id;
   ```

4. **Use GROUP BY** for aggregations:
   ```sql
   SELECT category, COUNT(*) as count
   FROM skills
   GROUP BY category;
   ```

## Requirements

- Python 3.8+
- sqlite3 (usually included with Python)
- pandas (for better data display, optional but recommended)

Install pandas if needed:
```bash
pip install pandas
```

## Database Location

The database file is located at: `db.sqlite3` in the project root directory.

## Notes

- The script automatically handles database connections
- Results are formatted for easy reading
- Error messages provide helpful feedback
- All queries are read-only unless you explicitly write UPDATE/DELETE statements

## Safety

⚠️ **Warning**: The script allows you to execute any SQL query, including UPDATE, DELETE, and DROP statements. Be careful when modifying data!

For safer operations, consider:
- Using Django's ORM for data modifications
- Making backups before running destructive queries
- Testing queries in a development environment first

## Troubleshooting

### Database not found
```
❌ Database not found at: /path/to/db.sqlite3
Make sure you run migrations first: python manage.py migrate
```

**Solution**: Run migrations to create the database:
```bash
python manage.py migrate
```

### SQL Syntax Error
```
❌ SQL Error: near "xyz": syntax error
```

**Solution**: Check your SQL syntax. Common issues:
- Missing semicolons
- Incorrect table/column names
- Improper quotes

### Module not found
```
ModuleNotFoundError: No module named 'pandas'
```

**Solution**: Install pandas:
```bash
pip install pandas
```

Note: pandas is optional but recommended for better output formatting.

