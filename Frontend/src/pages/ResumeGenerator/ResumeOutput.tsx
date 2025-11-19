import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useResume } from '../../context/ResumeContext';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import styles from './ResumeOutput.module.css';

const ResumeOutput: React.FC = () => {
  const { applicantInfo, generatorOutput } = useResume();
  const [resumeContent, setResumeContent] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Generate initial resume content
    const initialContent = generateResumeHTML();
    setResumeContent(initialContent);
  }, [applicantInfo, generatorOutput]);

  const generateResumeHTML = (): string => {
    const { basicInformation } = applicantInfo;
    const { experiences, projects, skills } = generatorOutput;

    let html = `
      <h1 style="text-align: center; margin-bottom: 10px; font-size: 20px; font-weight: bold;">${basicInformation.fullName || 'Your Name'}</h1>
      <p style="text-align: center; margin-bottom: 8px; font-size: 10px;">
        ${basicInformation.email || 'email@example.com'} | ${basicInformation.phoneNumber || '(123) 456-7890'}
      </p>
      <p style="text-align: center; margin-bottom: 8px; font-size: 10px;">
        ${basicInformation.linkedIn ? `${basicInformation.linkedIn} | ` : ''}${basicInformation.github || ''}
      </p>
      <p style="text-align: center; margin-bottom: 20px; font-size: 10px;">
        ${basicInformation.address || 'City, State'}
      </p>
    `;

    // Education Section
    if (basicInformation.academics.length > 0) {
      html += `<h2 style="font-size: 14px; font-weight: bold; margin-bottom: 8px; margin-top: 16px;">EDUCATION</h2>`;
      basicInformation.academics.forEach(academic => {
        html += `
          <p style="margin-bottom: 8px; font-size: 10px; font-weight: bold;">${academic.collegeName}</p>
          <p style="margin-bottom: 12px; font-size: 10px;">${academic.course} - ${academic.graduationDate}</p>
        `;
      });
    }

    // Experience Section
    if (experiences.length > 0) {
      html += `<h2 style="font-size: 14px; font-weight: bold; margin-bottom: 8px; margin-top: 16px;">PROFESSIONAL EXPERIENCE</h2>`;
      experiences.forEach(exp => {
        html += `
          <p style="margin-bottom: 8px; font-size: 10px; font-weight: bold;">${exp.companyName}</p>
        `;
        exp.newExperience.forEach(point => {
          html += `<p style="margin-left: 14px; margin-bottom: 6px; font-size: 10px;">• ${point}</p>`;
        });
        html += `<br/>`;
      });
    }

    // Projects Section
    if (projects.length > 0) {
      html += `<h2 style="font-size: 14px; font-weight: bold; margin-bottom: 8px; margin-top: 16px;">PROJECTS</h2>`;
      projects.forEach(project => {
        html += `<p style="margin-bottom: 8px; font-size: 10px; font-weight: bold;">${project.projectName}</p>`;
        
        // Handle new project points format
        if (project.projectPoints && project.projectPoints.length > 0) {
          html += `<ul style="margin-bottom: 8px; padding-left: 16px;">`;
          project.projectPoints.forEach(point => {
            html += `<li style="font-size: 10px; margin-bottom: 4px;">${point}</li>`;
          });
          html += `</ul>`;
        } else if (project.newProjectInfo) {
          // Fallback to old format
          html += `<p style="margin-bottom: 8px; font-size: 10px;">${project.newProjectInfo}</p>`;
        }
        
        // Add project skills if available
        if (project.projectSkills && project.projectSkills.length > 0) {
          html += `<p style="margin-bottom: 12px; font-size: 9px; font-style: italic; color: #666;">Skills: ${project.projectSkills.join(' • ')}</p>`;
        } else {
          html += `<br/>`;
        }
      });
    }

    // Skills Section - Handle category format and include project skills
    const allSkills: string[] = [];
    
    // Add skills from generated categories
    Object.values(skills).forEach(categorySkills => {
      allSkills.push(...categorySkills);
    });
    
    // Add project skills that aren't already included
    projects.forEach(project => {
      if (project.projectSkills) {
        project.projectSkills.forEach(skill => {
          if (!allSkills.includes(skill)) {
            allSkills.push(skill);
          }
        });
      }
    });
    
    if (allSkills.length > 0) {
      html += `<h2 style="font-size: 14px; font-weight: bold; margin-bottom: 8px; margin-top: 16px;">TECHNICAL SKILLS</h2>`;
      html += `<p style="margin-bottom: 12px; font-size: 10px;">${allSkills.join(' • ')}</p>`;
    }

    // Achievements Section
    if (basicInformation.achievements.length > 0) {
      html += `<h2 style="font-size: 14px; font-weight: bold; margin-bottom: 8px; margin-top: 16px;">ACHIEVEMENTS</h2>`;
      html += `<ul style="margin-bottom: 12px;">`;
      basicInformation.achievements.forEach(achievement => {
        html += `<li style="font-size: 10px; margin-bottom: 6px;">${achievement.achievementPoint}</li>`;
      });
      html += `</ul>`;
    }

    return html;
  };

  const downloadAsWord = async () => {
    setIsDownloading(true);
    try {
      const { basicInformation } = applicantInfo;
      const { experiences, projects, skills } = generatorOutput;

      const doc = new Document({
        sections: [
          {
            children: [
              // Header with name and contact info
              new Paragraph({
                text: basicInformation.fullName || 'Your Name',
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${basicInformation.email || 'email@example.com'} | ${basicInformation.phoneNumber || '(123) 456-7890'}`,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${basicInformation.linkedIn || ''} ${basicInformation.github ? '| ' + basicInformation.github : ''}`,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: basicInformation.address || 'City, State',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({ text: '' }), // Spacing

              // Education
              ...(basicInformation.academics.length > 0
                ? [
                    new Paragraph({
                      text: 'EDUCATION',
                      heading: HeadingLevel.HEADING_1,
                    }),
                    ...basicInformation.academics.flatMap(academic => [
                      new Paragraph({
                        children: [
                          new TextRun({ text: academic.collegeName, bold: true }),
                        ],
                      }),
                      new Paragraph({
                        text: `${academic.course} - ${academic.graduationDate}`,
                      }),
                      new Paragraph({ text: '' }),
                    ]),
                  ]
                : []),

              // Experience
              ...(experiences.length > 0
                ? [
                    new Paragraph({
                      text: 'PROFESSIONAL EXPERIENCE',
                      heading: HeadingLevel.HEADING_1,
                    }),
                    ...experiences.flatMap(exp => [
                      new Paragraph({
                        children: [
                          new TextRun({ text: exp.companyName, bold: true }),
                        ],
                      }),
                      ...exp.newExperience.map(
                        point =>
                          new Paragraph({
                            text: `• ${point}`,
                          })
                      ),
                      new Paragraph({ text: '' }),
                    ]),
                  ]
                : []),

              // Projects
              ...(projects.length > 0
                ? [
                    new Paragraph({
                      text: 'PROJECTS',
                      heading: HeadingLevel.HEADING_1,
                    }),
                    ...projects.flatMap(project => [
                      new Paragraph({
                        children: [
                          new TextRun({ text: project.projectName, bold: true }),
                        ],
                      }),
                      new Paragraph({
                        text: project.newProjectInfo,
                      }),
                      new Paragraph({ text: '' }),
                    ]),
                  ]
                : []),

              // Skills - Handle category format
              ...(Object.keys(skills).length > 0
                ? [
                    new Paragraph({
                      text: 'TECHNICAL SKILLS',
                      heading: HeadingLevel.HEADING_1,
                    }),
                    new Paragraph({
                      text: (() => {
                        const allSkills: string[] = [];
                        Object.values(skills).forEach(categorySkills => {
                          allSkills.push(...categorySkills);
                        });
                        return allSkills.join(' • ');
                      })(),
                    }),
                    new Paragraph({ text: '' }),
                  ]
                : []),

              // Achievements
              ...(basicInformation.achievements.length > 0
                ? [
                    new Paragraph({
                      text: 'ACHIEVEMENTS',
                      heading: HeadingLevel.HEADING_1,
                    }),
                    ...basicInformation.achievements.map(
                      achievement =>
                        new Paragraph({
                          text: `• ${achievement.achievementPoint}`,
                        })
                    ),
                  ]
                : []),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${basicInformation.fullName || 'Resume'}_Resume.docx`);
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
      const { basicInformation } = applicantInfo;
      const { experiences, projects, skills } = generatorOutput;

      const pdf = new jsPDF();
      let yPosition = 20;
      const lineHeight = 7;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;

      const checkPageBreak = () => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = 20;
        }
      };

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(basicInformation.fullName || 'Your Name', 105, yPosition, { align: 'center' });
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `${basicInformation.email || 'email@example.com'} | ${basicInformation.phoneNumber || '(123) 456-7890'}`,
        105,
        yPosition,
        { align: 'center' }
      );
      yPosition += 6;

      if (basicInformation.linkedIn || basicInformation.github) {
        pdf.text(
          `${basicInformation.linkedIn || ''} ${basicInformation.github ? '| ' + basicInformation.github : ''}`,
          105,
          yPosition,
          { align: 'center' }
        );
        yPosition += 6;
      }

      pdf.text(basicInformation.address || 'City, State', 105, yPosition, { align: 'center' });
      yPosition += 10;

      // Education
      if (basicInformation.academics.length > 0) {
        checkPageBreak();
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('EDUCATION', margin, yPosition);
        yPosition += lineHeight;

        pdf.setFontSize(10);
        basicInformation.academics.forEach(academic => {
          checkPageBreak();
          pdf.setFont('helvetica', 'bold');
          pdf.text(academic.collegeName, margin, yPosition);
          yPosition += lineHeight;
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${academic.course} - ${academic.graduationDate}`, margin, yPosition);
          yPosition += lineHeight + 2;
        });
        yPosition += 3;
      }

      // Experience
      if (experiences.length > 0) {
        checkPageBreak();
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PROFESSIONAL EXPERIENCE', margin, yPosition);
        yPosition += lineHeight;

        pdf.setFontSize(10);
        experiences.forEach(exp => {
          checkPageBreak();
          pdf.setFont('helvetica', 'bold');
          pdf.text(exp.companyName, margin, yPosition);
          yPosition += lineHeight;

          pdf.setFont('helvetica', 'normal');
          exp.newExperience.forEach(point => {
            checkPageBreak();
            const lines = pdf.splitTextToSize(`• ${point}`, 170);
            lines.forEach((line: string) => {
              checkPageBreak();
              pdf.text(line, margin + 5, yPosition);
              yPosition += lineHeight;
            });
          });
          yPosition += 3;
        });
      }

      // Projects
      if (projects.length > 0) {
        checkPageBreak();
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PROJECTS', margin, yPosition);
        yPosition += lineHeight;

        pdf.setFontSize(10);
        projects.forEach(project => {
          checkPageBreak();
          pdf.setFont('helvetica', 'bold');
          pdf.text(project.projectName, margin, yPosition);
          yPosition += lineHeight;

          pdf.setFont('helvetica', 'normal');
          const lines = pdf.splitTextToSize(project.newProjectInfo, 170);
          lines.forEach((line: string) => {
            checkPageBreak();
            pdf.text(line, margin, yPosition);
            yPosition += lineHeight;
          });
          yPosition += 3;
        });
      }

      // Skills - Handle category format
      if (Object.keys(skills).length > 0) {
        checkPageBreak();
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TECHNICAL SKILLS', margin, yPosition);
        yPosition += lineHeight;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const allSkills: string[] = [];
        Object.values(skills).forEach(categorySkills => {
          allSkills.push(...categorySkills);
        });
        const skillsText = allSkills.join(' • ');
        const lines = pdf.splitTextToSize(skillsText, 170);
        lines.forEach((line: string) => {
          checkPageBreak();
          pdf.text(line, margin, yPosition);
          yPosition += lineHeight;
        });
        yPosition += 3;
      }

      // Achievements
      if (basicInformation.achievements.length > 0) {
        checkPageBreak();
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('ACHIEVEMENTS', margin, yPosition);
        yPosition += lineHeight;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        basicInformation.achievements.forEach(achievement => {
          checkPageBreak();
          const lines = pdf.splitTextToSize(`• ${achievement.achievementPoint}`, 170);
          lines.forEach((line: string) => {
            checkPageBreak();
            pdf.text(line, margin, yPosition);
            yPosition += lineHeight;
          });
        });
      }

      pdf.save(`${basicInformation.fullName || 'Resume'}_Resume.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['clean'],
    ],
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>📄 Resume Output</h2>
        <p>Edit and download your tailored resume</p>
      </div>

      <div className={styles.editorContainer}>
        <ReactQuill
          theme="snow"
          value={resumeContent}
          onChange={setResumeContent}
          modules={quillModules}
          className={styles.editor}
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

