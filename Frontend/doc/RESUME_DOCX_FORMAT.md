# Resume DOCX Formatting

## Overview
The ResumeOutput component generates properly formatted DOCX resumes following strict formatting rules for professional presentation.

## Formatting Specifications

### Font & Typography
- **Default Font**: Calibri, 9pt
- **Name**: 16pt, Bold
- **Section Headers**: 11pt, Bold, ALL CAPS
- **Job Titles**: 9pt, Bold
- **Company Names**: 9pt, Bold, Dark Gray (#444)

### Spacing & Layout
- **Line Spacing**: 1.15 throughout
- **Section Header Spacing**: 6pt before, 3pt after
- **Bullet Spacing**: 3pt after each bullet
- **Margins**: 1 inch all sides
- **Layout**: Single column, vertical

### Section Order
1. **Name** - Large, bold, top of document
2. **Contact Info** - Phone | Email | Location | LinkedIn
3. **EDUCATION** - University, degree, graduation date
4. **WORK EXPERIENCE** - Job Title | Company | Location | Dates + bullets
5. **SKILLS** - Categorized skills with labels
6. **PROJECTS** - Project name, tech stack, description bullets
7. **ACHIEVEMENTS** - Bullet points (if any)

### Implementation
- Uses `docx` library for programmatic DOCX generation
- Maintains consistent formatting across all sections
- Dynamically inserts content while preserving structure
- Exports as downloadable .docx file

## Usage
The component automatically formats resume content from the ResumeContext and generates a professional DOCX document matching standard resume templates.
