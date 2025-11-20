import React, { useState, useEffect, useRef } from 'react';
import { useResume } from '../../context/ResumeContext';
import { completeInfoApi, CompleteApplicantInfoData } from '../../services/api';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType,
  ExternalHyperlink,
  BorderStyle
} from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import styles from './ResumeOutput.module.css';

// Constants for consistent formatting
const FONT_SIZE = 18; // 9pt in half-points
const FONT_FAMILY = 'Times New Roman';
const LINE_SPACING = 276; // 1.15 line spacing (240 * 1.15 = 276)
const SECTION_SPACING_BEFORE = 120; // 6pt before
const SECTION_SPACING_AFTER = 60; // 3pt after
const BULLET_SPACING_AFTER = 60; // 3pt after each bullet

const ResumeOutput: React.FC = () => {
  const { applicantInfo, generatorOutput } = useResume();
  const [apiApplicantInfo, setApiApplicantInfo] = useState<CompleteApplicantInfoData | null>(null);
  const [resumeContent, setResumeContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch applicant info from API
    const fetchApplicantInfo = async () => {
      try {
        setIsLoading(true);
        const data = await completeInfoApi.get();
        setApiApplicantInfo(data);
      } catch (error) {
        console.error('Error fetching applicant info:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplicantInfo();
  }, []);

  // Use API data if available, otherwise fall back to context
  const basicInfo = apiApplicantInfo?.basicInformation || applicantInfo.basicInformation;
  const academics = apiApplicantInfo?.academics || applicantInfo.basicInformation?.academics || [];
  const apiExperiences = apiApplicantInfo?.experiences || [];
  const { experiences, projects, skills } = generatorOutput;
  
  // Handle LinkedIn URL field name differences
  const linkedinUrl = (basicInfo as any)?.linkedinUrl || (basicInfo as any)?.linkedIn || '';

  // Common text styles
  const nameStyle = {
    size: FONT_SIZE,
    bold: true,
    font: FONT_FAMILY,
    color: '000000'
  };

  const contactStyle = {
    size: FONT_SIZE,
    font: FONT_FAMILY,
    color: '000000'
  };

  const sectionHeaderStyle = {
    size: FONT_SIZE,
    bold: true,
    font: FONT_FAMILY,
    color: '0000FF' // Blue
  };

  const bodyTextStyle = {
    size: FONT_SIZE,
    font: FONT_FAMILY,
    color: '000000'
  };

  const boldTextStyle = {
    size: FONT_SIZE,
    bold: true,
    font: FONT_FAMILY,
    color: '000000'
  };

  const roleTextStyle = {
    size: FONT_SIZE,
    bold: true,
    font: FONT_FAMILY,
    color: '800080' // Purple
  };

  const generateResumeHTML = (): string => {
    const name = basicInfo?.fullName || 'Your Name';
    const phone = basicInfo?.phoneNumber || '';
    const email = basicInfo?.email || '';
    const location = basicInfo?.address || '';
    
    let html = `
      <div class="${styles.resumeName}">${name}</div>
      <div class="${styles.resumeContact}">
        ${phone}${phone && email ? ' | ' : ''}${email}${(phone || email) && location ? ' | ' : ''}${location}${linkedinUrl ? ` | <a href="${linkedinUrl}" class="${styles.linkedinLink}">LinkedIn</a>` : ''}
      </div>
    `;

    // EDUCATION SECTION
    if (academics.length > 0) {
      html += `<div class="${styles.sectionHeader}"><h2>EDUCATION:</h2><div class="${styles.gridLine}"></div></div>`;
      academics.forEach(academic => {
        html += `
          <div class="${styles.educationEntry}">
            <span><span class="${styles.bold}">${academic.collegeName}</span> – ${academic.course}</span>
            <span contenteditable="true" class="${styles.dateField}" style="white-space: pre-wrap;">${academic.graduationDate}</span>
          </div>
        `;
      });
    }

    // WORK EXPERIENCE SECTION
    if (experiences.length > 0) {
      html += `<div class="${styles.sectionHeader}"><h2>WORK EXPERIENCE:</h2><div class="${styles.gridLine}"></div></div>`;
      experiences.forEach((exp, index) => {
        const originalExp = apiExperiences[index] || applicantInfo.experiences?.[index];
        html += `
          <div class="${styles.jobHeader}">
            <span>
              <span class="${styles.roleName}">${originalExp?.role || 'Professional Role'}</span> | 
              <span class="${styles.bold}">${exp.companyName}</span> | 
              ${(originalExp as any)?.location || 'Location'}
            </span>
            <span contenteditable="true" class="${styles.dateField}" style="white-space: pre-wrap;">${originalExp?.startDate || 'Start'} - ${originalExp?.endDate || 'End'}</span>
          </div>
        `;
        exp.newExperience.forEach(point => {
          html += `<div class="${styles.bulletPoint}"><span class="${styles.bulletSymbol}">•</span>${point}</div>`;
        });
      });
    }

    // SKILLS SECTION - Format as bullet points
    if (Object.keys(skills).length > 0) {
      html += `<div class="${styles.sectionHeader}"><h2>SKILLS:</h2><div class="${styles.gridLine}"></div></div>`;
      Object.entries(skills).forEach(([category, categorySkills]) => {
        html += `<div class="${styles.bulletPoint}"><span class="${styles.bulletSymbol}">•</span><span class="${styles.bold}">${category}:</span> ${categorySkills.join(', ')}</div>`;
      });
    }

    // PROJECTS SECTION
    if (projects.length > 0) {
      html += `<div class="${styles.sectionHeader}"><h2>PROJECTS:</h2><div class="${styles.gridLine}"></div></div>`;
      projects.forEach(project => {
        // Project name with skills formatted as "Project Name: Skill 1 | Skill 2 | Skill 3"
        const skillsText = project.projectSkills && project.projectSkills.length > 0 
          ? `: ${project.projectSkills.join(' | ')}` 
          : '';
        html += `<div class="${styles.projectName}"><span class="${styles.bold}">${project.projectName}</span>${skillsText}</div>`;
        
        // Project bullets
        if (project.projectPoints && project.projectPoints.length > 0) {
          project.projectPoints.forEach(point => {
            html += `<div class="${styles.bulletPoint}"><span class="${styles.bulletSymbol}">•</span>${point}</div>`;
          });
        } else if (project.newProjectInfo) {
          html += `<div class="${styles.bulletPoint}"><span class="${styles.bulletSymbol}">•</span>${project.newProjectInfo}</div>`;
        }
      });
    }

    return html;
  };

  const handleContentChange = () => {
    if (resumeRef.current) {
      setResumeContent(resumeRef.current.innerHTML);
    }
  };

  const handleDateFieldKeyDown = (event: React.KeyboardEvent) => {
    // Allow normal text editing including spaces for positioning
    if (event.key === 'Tab') {
      event.preventDefault();
      // Find next editable date field
      const dateFields = resumeRef.current?.querySelectorAll(`.${styles.dateField}`);
      if (dateFields) {
        const currentField = event.target as HTMLElement;
        const currentIndex = Array.from(dateFields).indexOf(currentField);
        const nextIndex = event.shiftKey ? currentIndex - 1 : currentIndex + 1;
        if (nextIndex >= 0 && nextIndex < dateFields.length) {
          (dateFields[nextIndex] as HTMLElement).focus();
        }
      }
    }
  };

  const downloadAsWord = async () => {
    setIsDownloading(true);
    try {
      const { experiences, projects, skills } = generatorOutput;
      
      // Extract date content with preserved spaces from editable content
      // Since there are multiple date fields, we'll extract all and match by order
      const getAllDateContents = (element: HTMLElement | null): string[] => {
        if (!element) return [];
        const dateElements = element.querySelectorAll(`.${styles.dateField}`);
        return Array.from(dateElements).map(el => el.textContent || '');
      };
      
      // Get all edited date contents with preserved spaces
      const editedDates = resumeRef.current ? getAllDateContents(resumeRef.current) : [];
      let dateIndex = 0;

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 720, // 0.5 inch (720 twips) - Narrow margins
                  right: 720,
                  bottom: 720,
                  left: 720,
                },
              },
            },
            children: [
              // NAME - Top of document, centered, 9pt, bold
              new Paragraph({
                children: [
                  new TextRun({
                    text: basicInfo?.fullName || 'Your Name',
                    ...nameStyle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: {
                  line: LINE_SPACING,
                },
              }),

              // CONTACT INFO - Single line, centered, 9pt with LinkedIn hyperlink
              new Paragraph({
                children: [
                  new TextRun({
                    text: basicInfo?.phoneNumber || '',
                    ...contactStyle,
                  }),
                  new TextRun({
                    text: ' | ',
                    ...contactStyle,
                  }),
                  new TextRun({
                    text: basicInfo?.email || '',
                    ...contactStyle,
                  }),
                  new TextRun({
                    text: ' | ',
                    ...contactStyle,
                  }),
                  new TextRun({
                    text: basicInfo?.address || '',
                    ...contactStyle,
                  }),
                  ...(linkedinUrl ? [
                    new TextRun({
                      text: ' | ',
                      ...contactStyle,
                    }),
                    new ExternalHyperlink({
                      children: [
                        new TextRun({
                          text: 'LinkedIn',
                          ...contactStyle,
                          color: '0000FF',
                          underline: {},
                        }),
                      ],
                      link: linkedinUrl,
                    }),
                  ] : []),
                ],
                alignment: AlignmentType.CENTER,
                spacing: {
                  line: LINE_SPACING,
                },
              }),

              // EDUCATION SECTION
              ...(academics.length > 0
                ? [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: 'EDUCATION:',
                          ...sectionHeaderStyle,
                        }),
                      ],
                      alignment: AlignmentType.LEFT,
                      spacing: {
                        before: SECTION_SPACING_BEFORE,
                        after: LINE_SPACING, // Line space below heading
                        line: LINE_SPACING,
                      },
                      border: {
                        bottom: {
                          color: '000000', // Black border
                          size: 6, // Single line border
                          space: 1,
                          style: BorderStyle.SINGLE,
                        },
                      },
                    }),
                    ...academics.flatMap((academic) => {
                      // Get edited date content with preserved spaces
                      const dateContent = editedDates[dateIndex] || academic.graduationDate;
                      dateIndex++;
                      
                      // Calculate spaces needed to push date to the right
                      // Approximate: page width (7.5in = 540pt) - margins (1in = 72pt each side) = 396pt usable width
                      // Each space is roughly 4pt at 9pt font, so we need about 50-80 spaces depending on text length
                      const mainText = `${academic.collegeName} – ${academic.course}`;
                      const estimatedMainTextWidth = mainText.length * 4.5; // Approximate width per character
                      const availableWidth = 396; // Approximate usable width in points
                      const dateWidth = dateContent.length * 4.5;
                      const spacesNeeded = Math.max(1, Math.floor((availableWidth - estimatedMainTextWidth - dateWidth) / 4));
                      const spacingText = ' '.repeat(Math.min(spacesNeeded, 100)); // Cap at 100 spaces
                      
                      return [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${academic.collegeName} – ${academic.course}`,
                              ...boldTextStyle,
                            }),
                            new TextRun({
                              text: `${spacingText}${dateContent}`, // Use spaces instead of tab
                              ...bodyTextStyle,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                          spacing: {
                            after: SECTION_SPACING_AFTER,
                            line: LINE_SPACING,
                          },
                        }),
                      ];
                    }),
                  ]
                : []),

              // WORK EXPERIENCE SECTION
              ...(experiences.length > 0
                ? [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: 'WORK EXPERIENCE:',
                          ...sectionHeaderStyle,
                        }),
                      ],
                      alignment: AlignmentType.LEFT,
                      spacing: {
                        before: SECTION_SPACING_BEFORE,
                        after: LINE_SPACING, // Line space below heading
                        line: LINE_SPACING,
                      },
                      border: {
                        bottom: {
                          color: '000000', // Black border
                          size: 6, // Single line border
                          space: 1,
                          style: BorderStyle.SINGLE,
                        },
                      },
                    }),
                    ...experiences.flatMap((exp, index) => {
                      const originalExp = apiExperiences[index] || applicantInfo.experiences?.[index];
                      const defaultDate = `${originalExp?.startDate || 'Start'} - ${originalExp?.endDate || 'End'}`;
                      
                      // Get edited date content with preserved spaces
                      const dateContent = editedDates[dateIndex] || defaultDate;
                      dateIndex++;
                      
                      // Calculate spaces needed to push date to the right
                      const mainText = `${originalExp?.role || 'Professional Role'} | ${exp.companyName} | ${(originalExp as any)?.location || 'Location'}`;
                      const estimatedMainTextWidth = mainText.length * 4.5; // Approximate width per character
                      const availableWidth = 396; // Approximate usable width in points
                      const dateWidth = dateContent.length * 4.5;
                      const spacesNeeded = Math.max(1, Math.floor((availableWidth - estimatedMainTextWidth - dateWidth) / 4));
                      const spacingText = ' '.repeat(Math.min(spacesNeeded, 100)); // Cap at 100 spaces
                      
                      return [
                        // Job Title | Company | Location | Dates (right-aligned)
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${originalExp?.role || 'Professional Role'}`,
                              ...roleTextStyle,
                            }),
                            new TextRun({
                              text: ` | `,
                              ...bodyTextStyle,
                            }),
                            new TextRun({
                              text: `${exp.companyName}`,
                              ...boldTextStyle,
                            }),
                            new TextRun({
                              text: ` | ${(originalExp as any)?.location || 'Location'}`,
                              ...bodyTextStyle,
                            }),
                            new TextRun({
                              text: `${spacingText}${dateContent}`, // Use spaces instead of tab
                              ...bodyTextStyle,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                          spacing: {
                            line: LINE_SPACING,
                          },
                        }),
                        // Experience bullets - using proper Word bullet formatting with full justification
                        ...exp.newExperience.map(
                          point =>
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: point,
                                  ...bodyTextStyle,
                                }),
                              ],
                              bullet: {
                                level: 0,
                              },
                              alignment: AlignmentType.JUSTIFIED,
                              spacing: {
                                after: BULLET_SPACING_AFTER,
                                line: LINE_SPACING,
                              },
                            })
                        ),
                      ];
                    }),
                  ]
                : []),

              // SKILLS SECTION - Format as bullet points
              ...(Object.keys(skills).length > 0
                ? [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: 'SKILLS:',
                          ...sectionHeaderStyle,
                        }),
                      ],
                      alignment: AlignmentType.LEFT,
                      spacing: {
                        before: SECTION_SPACING_BEFORE,
                        after: LINE_SPACING, // Line space below heading
                        line: LINE_SPACING,
                      },
                      border: {
                        bottom: {
                          color: '000000', // Black border
                          size: 6, // Single line border
                          space: 1,
                          style: BorderStyle.SINGLE,
                        },
                      },
                    }),
                    ...Object.entries(skills).map(([category, categorySkills]) =>
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${category}: `,
                            ...boldTextStyle,
                          }),
                          new TextRun({
                            text: categorySkills.join(', '),
                            ...bodyTextStyle,
                          }),
                        ],
                        bullet: {
                          level: 0,
                        },
                        alignment: AlignmentType.LEFT,
                        spacing: {
                          after: BULLET_SPACING_AFTER,
                          line: LINE_SPACING,
                        },
                      })
                    ),
                  ]
                : []),

              // PROJECTS SECTION
              ...(projects.length > 0
                ? [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: 'PROJECTS:',
                          ...sectionHeaderStyle,
                        }),
                      ],
                      alignment: AlignmentType.LEFT,
                      spacing: {
                        before: SECTION_SPACING_BEFORE,
                        after: LINE_SPACING, // Line space below heading
                        line: LINE_SPACING,
                      },
                      border: {
                        bottom: {
                          color: '000000', // Black border
                          size: 6, // Single line border
                          space: 1,
                          style: BorderStyle.SINGLE,
                        },
                      },
                    }),
                    ...projects.flatMap(project => {
                      // Project Name with skills formatted as "Project Name: Skill 1 | Skill 2 | Skill 3"
                      const skillsText = project.projectSkills && project.projectSkills.length > 0 
                        ? `: ${project.projectSkills.join(' | ')}` 
                        : '';
                      
                      return [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: project.projectName,
                              ...boldTextStyle,
                            }),
                            ...(skillsText ? [new TextRun({
                              text: skillsText,
                              ...bodyTextStyle,
                            })] : []),
                          ],
                          alignment: AlignmentType.LEFT,
                          spacing: {
                            line: LINE_SPACING,
                          },
                        }),
                        // Project bullets - using proper Word bullet formatting with full justification
                        ...(project.projectPoints && project.projectPoints.length > 0
                          ? project.projectPoints.map(point =>
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: point,
                                    ...bodyTextStyle,
                                  }),
                                ],
                                bullet: {
                                  level: 0,
                                },
                                alignment: AlignmentType.JUSTIFIED,
                                spacing: {
                                  after: BULLET_SPACING_AFTER,
                                  line: LINE_SPACING,
                                },
                              })
                            )
                          : project.newProjectInfo
                          ? [new Paragraph({
                              children: [
                                new TextRun({
                                  text: project.newProjectInfo,
                                  ...bodyTextStyle,
                                }),
                              ],
                              bullet: {
                                level: 0,
                              },
                              alignment: AlignmentType.JUSTIFIED,
                              spacing: {
                                after: BULLET_SPACING_AFTER,
                                line: LINE_SPACING,
                              },
                            })]
                          : []),
                      ];
                    }),
                  ]
                : []),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${basicInfo?.fullName || 'Resume'}_Resume.docx`);
    } catch (error) {
      console.error('Error generating Word document:', error);
      alert('Failed to generate Word document. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadAsPDF = async () => {
    setIsDownloading(true);
    try {
      const { experiences, projects, skills } = generatorOutput;

      // Extract date content with preserved spaces from editable content
      const getAllDateContents = (element: HTMLElement | null): string[] => {
        if (!element) return [];
        const dateElements = element.querySelectorAll(`.${styles.dateField}`);
        return Array.from(dateElements).map(el => el.textContent || '');
      };
      
      // Get all edited date contents with preserved spaces
      const editedDates = resumeRef.current ? getAllDateContents(resumeRef.current) : [];
      let dateIndex = 0;

      const pdf = new jsPDF();
      // Narrow margins: 0.5 inch = 14.4mm (approximately)
      let yPosition = 14.4; // Start with narrow margin
      const lineHeight = 7;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 14.4; // Narrow margin (0.5 inch)

      const checkPageBreak = () => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin; // Reset to narrow margin
        }
      };

      // Header - Name (9pt, Times Roman)
      pdf.setFontSize(9);
      pdf.setFont('times', 'bold');
      const pageWidth = pdf.internal.pageSize.width;
      pdf.text(basicInfo?.fullName || 'Your Name', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;

      // Contact info (9pt, Times Roman)
      pdf.setFontSize(9);
      pdf.setFont('times', 'normal');
      const contactParts = [
        basicInfo?.phoneNumber || '',
        basicInfo?.email || '',
        basicInfo?.address || '',
        linkedinUrl ? 'LinkedIn' : ''
      ].filter(Boolean);
      pdf.text(contactParts.join(' | '), pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      // Education
      if (academics.length > 0) {
        checkPageBreak();
        pdf.setFontSize(9);
        pdf.setFont('times', 'bold');
        pdf.setTextColor(0, 0, 255); // Blue text
        pdf.text('EDUCATION:', margin, yPosition);
        // Draw grid line - black, single line
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPosition + 2, pdf.internal.pageSize.width - margin, yPosition + 2);
        pdf.setTextColor(0, 0, 0);
        yPosition += lineHeight + 2; // Line space below heading

        pdf.setFontSize(9);
        academics.forEach(academic => {
          checkPageBreak();
          pdf.setFont('times', 'bold');
          pdf.text(`${academic.collegeName} – ${academic.course}`, margin, yPosition);
          pdf.setFont('times', 'normal');
          // Use edited date content with preserved spaces
          const dateContent = editedDates[dateIndex] || academic.graduationDate;
          dateIndex++;
          pdf.text(dateContent, pageWidth - margin, yPosition, { align: 'right' });
          yPosition += lineHeight + 2;
        });
        yPosition += 3;
      }

      // Work Experience
      if (experiences.length > 0) {
        checkPageBreak();
        pdf.setFontSize(9);
        pdf.setFont('times', 'bold');
        pdf.setTextColor(0, 0, 255); // Blue text
        pdf.text('WORK EXPERIENCE:', margin, yPosition);
        // Draw grid line - black, single line
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPosition + 2, pdf.internal.pageSize.width - margin, yPosition + 2);
        pdf.setTextColor(0, 0, 0);
        yPosition += lineHeight + 2; // Line space below heading

        pdf.setFontSize(9);
        experiences.forEach((exp, index) => {
          const originalExp = apiExperiences[index] || applicantInfo.experiences?.[index];
          checkPageBreak();
          
          // Job Title | Company | Location | Dates
          pdf.setFont('times', 'bold');
          pdf.setTextColor(128, 0, 128); // Purple for role
          pdf.text(`${originalExp?.role || 'Professional Role'}`, margin, yPosition);
          pdf.setTextColor(0, 0, 0); // Reset to black
          const companyLine = ` | ${exp.companyName} | ${(originalExp as any)?.location || 'Location'}`;
          pdf.text(companyLine, margin + pdf.getTextWidth(`${originalExp?.role || 'Professional Role'}`), yPosition);
          pdf.setFont('times', 'normal');
          // Use edited date content with preserved spaces
          const defaultDate = `${originalExp?.startDate || 'Start'} - ${originalExp?.endDate || 'End'}`;
          const dateContent = editedDates[dateIndex] || defaultDate;
          dateIndex++;
          pdf.text(dateContent, pageWidth - margin, yPosition, { align: 'right' });
          yPosition += lineHeight;

          // Experience bullets - using proper bullet formatting with indentation and justification
          pdf.setFont('times', 'normal');
          exp.newExperience.forEach(point => {
            checkPageBreak();
            // Use bullet character and indent text properly
            pdf.text('•', margin + 2, yPosition);
            const textWidth = pageWidth - margin * 2 - 8;
            const lines = pdf.splitTextToSize(point, textWidth);
            lines.forEach((line: string, lineIndex: number) => {
              checkPageBreak();
              // Apply justification for multi-line text (except last line)
              if (lineIndex < lines.length - 1 && line.trim().length > 0) {
                // Justify text by adding extra spaces
                const words = line.trim().split(' ');
                if (words.length > 1) {
                  const totalTextWidth = words.reduce((sum, word) => sum + pdf.getTextWidth(word), 0);
                  const totalSpaces = words.length - 1;
                  const extraSpace = (textWidth - totalTextWidth) / totalSpaces;
                  let xPos = margin + 8;
                  words.forEach((word, wordIndex) => {
                    pdf.text(word, xPos, yPosition);
                    if (wordIndex < words.length - 1) {
                      xPos += pdf.getTextWidth(word) + pdf.getTextWidth(' ') + extraSpace;
                    }
                  });
                } else {
                  pdf.text(line, margin + 8, yPosition);
                }
              } else {
                pdf.text(line, margin + 8, yPosition);
              }
              if (lineIndex < lines.length - 1) yPosition += lineHeight;
            });
            yPosition += lineHeight;
          });
          yPosition += 3;
        });
      }

      // Skills - Format as bullet points
      if (Object.keys(skills).length > 0) {
        checkPageBreak();
        pdf.setFontSize(9);
        pdf.setFont('times', 'bold');
        pdf.setTextColor(0, 0, 255); // Blue text
        pdf.text('SKILLS:', margin, yPosition);
        // Draw grid line - black, single line
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPosition + 2, pdf.internal.pageSize.width - margin, yPosition + 2);
        pdf.setTextColor(0, 0, 0);
        yPosition += lineHeight + 2; // Line space below heading

        pdf.setFontSize(9);
        Object.entries(skills).forEach(([category, categorySkills]) => {
          checkPageBreak();
          pdf.setFont('times', 'normal');
          // Use bullet character and indent text properly
          pdf.text('•', margin + 2, yPosition);
          const skillText = `${category}: ${categorySkills.join(', ')}`;
          const lines = pdf.splitTextToSize(skillText, pdf.internal.pageSize.width - margin * 2 - 8);
          lines.forEach((line: string, lineIndex: number) => {
            checkPageBreak();
            pdf.text(line, margin + 8, yPosition);
            if (lineIndex < lines.length - 1) yPosition += lineHeight;
          });
          yPosition += lineHeight;
        });
        yPosition += 3;
      }

      // Projects
      if (projects.length > 0) {
        checkPageBreak();
        pdf.setFontSize(9);
        pdf.setFont('times', 'bold');
        pdf.setTextColor(0, 0, 255); // Blue text
        pdf.text('PROJECTS:', margin, yPosition);
        // Draw grid line - black, single line
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPosition + 2, pdf.internal.pageSize.width - margin, yPosition + 2);
        pdf.setTextColor(0, 0, 0);
        yPosition += lineHeight + 2; // Line space below heading

        pdf.setFontSize(9);
        projects.forEach(project => {
          checkPageBreak();
          pdf.setFont('times', 'bold');
          const projectTitle = project.projectName;
          const skillsText = project.projectSkills && project.projectSkills.length > 0 
            ? `: ${project.projectSkills.join(' | ')}` 
            : '';
          pdf.text(projectTitle + skillsText, margin, yPosition);
          yPosition += lineHeight;

          // Project bullets - using proper bullet formatting with indentation and justification
          if (project.projectPoints && project.projectPoints.length > 0) {
            project.projectPoints.forEach(point => {
              checkPageBreak();
              // Use bullet character and indent text properly
              pdf.text('•', margin + 2, yPosition);
              const textWidth = pageWidth - margin * 2 - 8;
              const lines = pdf.splitTextToSize(point, textWidth);
              lines.forEach((line: string, lineIndex: number) => {
                checkPageBreak();
                // Apply justification for multi-line text (except last line)
                if (lineIndex < lines.length - 1 && line.trim().length > 0) {
                  // Justify text by adding extra spaces
                  const words = line.trim().split(' ');
                  if (words.length > 1) {
                    const totalTextWidth = words.reduce((sum, word) => sum + pdf.getTextWidth(word), 0);
                    const totalSpaces = words.length - 1;
                    const extraSpace = (textWidth - totalTextWidth) / totalSpaces;
                    let xPos = margin + 8;
                    words.forEach((word, wordIndex) => {
                      pdf.text(word, xPos, yPosition);
                      if (wordIndex < words.length - 1) {
                        xPos += pdf.getTextWidth(word) + pdf.getTextWidth(' ') + extraSpace;
                      }
                    });
                  } else {
                    pdf.text(line, margin + 8, yPosition);
                  }
                } else {
                  pdf.text(line, margin + 8, yPosition);
                }
                if (lineIndex < lines.length - 1) yPosition += lineHeight;
              });
              yPosition += lineHeight;
            });
          } else if (project.newProjectInfo) {
            pdf.text('•', margin + 2, yPosition);
            const textWidth = pageWidth - margin * 2 - 8;
            const lines = pdf.splitTextToSize(project.newProjectInfo, textWidth);
            lines.forEach((line: string, lineIndex: number) => {
              checkPageBreak();
              // Apply justification for multi-line text (except last line)
              if (lineIndex < lines.length - 1 && line.trim().length > 0) {
                // Justify text by adding extra spaces
                const words = line.trim().split(' ');
                if (words.length > 1) {
                  const totalTextWidth = words.reduce((sum, word) => sum + pdf.getTextWidth(word), 0);
                  const totalSpaces = words.length - 1;
                  const extraSpace = (textWidth - totalTextWidth) / totalSpaces;
                  let xPos = margin + 8;
                  words.forEach((word, wordIndex) => {
                    pdf.text(word, xPos, yPosition);
                    if (wordIndex < words.length - 1) {
                      xPos += pdf.getTextWidth(word) + pdf.getTextWidth(' ') + extraSpace;
                    }
                  });
                } else {
                  pdf.text(line, margin + 8, yPosition);
                }
              } else {
                pdf.text(line, margin + 8, yPosition);
              }
              if (lineIndex < lines.length - 1) yPosition += lineHeight;
            });
            yPosition += lineHeight;
          }
          yPosition += 3;
        });
      }

      pdf.save(`${basicInfo?.fullName || 'Resume'}_Resume.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    // Generate resume HTML whenever data changes
    const content = generateResumeHTML();
    setResumeContent(content);
  }, [apiApplicantInfo, applicantInfo, generatorOutput]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>📄 Resume Output</h2>
          <p>Loading applicant information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>📄 Resume Output</h2>
        <p>Edit and download your tailored resume</p>
      </div>

      <div className={styles.editorContainer}>
        <div 
          ref={resumeRef}
          contentEditable
          suppressContentEditableWarning
          className={styles.resumePreview}
          dangerouslySetInnerHTML={{ __html: resumeContent }}
          onInput={handleContentChange}
          onBlur={handleContentChange}
          onKeyDown={handleDateFieldKeyDown}
        />
      </div>

      <div className={styles.downloadButtons}>
        <button
          onClick={downloadAsWord}
          disabled={isDownloading}
          className={styles.downloadButton}
        >
          {isDownloading ? '⏳ Downloading...' : '📥 Download as Word (.docx)'}
        </button>
        <button
          onClick={downloadAsPDF}
          disabled={isDownloading}
          className={styles.downloadButton}
        >
          {isDownloading ? '⏳ Downloading...' : '📥 Download as PDF'}
        </button>
      </div>
    </div>
  );
};

export default ResumeOutput;
