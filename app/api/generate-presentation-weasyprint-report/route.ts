import { NextResponse } from 'next/server';
// import { generateScorecardHTML } from '../generate-scorecard-report-v6/scorecard-html-generator'; // Not used in this version
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/firebase';
import { getDoc, doc } from 'firebase/firestore';

// WeasyPrint service configuration
const WEASYPRINT_SERVICE_URL = process.env.WEASYPRINT_SERVICE_URL || 'http://localhost:5001/generate-pdf'; // Use environment variable, fallback to localhost
const WEASYPRINT_TIMEOUT = 120000; // 120 seconds timeout (increased from 30 seconds)

/**
 * API route handler for generating presentation-style PDF using WeasyPrint service
 * POST /api/generate-presentation-weasyprint-report
 */
export async function POST(request: Request) {
  console.log('Starting PDF generation request...');
  let reportData: any;
  let reportId: string | null = null;

  try {
    const url = new URL(request.url);
    reportId = url.searchParams.get('reportId');
    console.log('Report ID from URL:', reportId);

    // Initialize with default/fallback structure
    reportData = {
      UserInformation: {
        UserName: 'N/A',
        CompanyName: 'N/A',
        Industry: 'N/A',
        Email: 'N/A',
      },
      ScoreInformation: {
        AITier: 'N/A',
        FinalScore: 'N/A',
        ReportID: reportId || 'N/A',
      },
      FullReportMarkdown: '',
      QuestionAnswerHistory: [],
      ReportDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    };

    if (reportId) {
      console.log(`Fetching report data from Firestore for reportId: ${reportId}`);
      const reportRef = doc(db, 'scorecardReports', reportId);
      const reportSnapshot = await getDoc(reportRef);

      if (!reportSnapshot.exists()) {
        console.error(`No report found in Firestore with ID: ${reportId}`);
        return NextResponse.json(
          { error: `No report found in Firestore with ID: ${reportId}` },
          { status: 404 }
        );
      }

      const firestoreData = reportSnapshot.data();
      console.log('Firestore data retrieved:', {
        hasUserInfo: !!firestoreData.UserInformation,
        hasScoreInfo: !!firestoreData.ScoreInformation,
        hasMarkdown: !!firestoreData.reportMarkdown || !!firestoreData.markdown,
        hasQAHistory: !!firestoreData.questionAnswerHistory || !!firestoreData.answers,
        dataKeys: Object.keys(firestoreData)
      });
      
      // Debug print all available fields to identify where company name might be
      console.log("FIRESTORE DATA FIELDS:", Object.keys(firestoreData));
      console.log("COMPANY NAME CANDIDATES:", {
        companyName: firestoreData.companyName,
        company: firestoreData.company,
        Company: firestoreData.Company,
        companyname: firestoreData.companyname,
        "UserInformation.CompanyName": firestoreData.UserInformation?.CompanyName,
        userCompany: firestoreData.userCompany,
        usercompany: firestoreData.usercompany,
        raw: firestoreData
      });
      
      // Check if the field names are case-sensitive or if they're nested under another structure
      let companyNameValue = 'N/A';
      
      // Try to find the company name across all variations and nested objects
      if (typeof firestoreData === 'object' && firestoreData !== null) {
        // Direct field access with various casing and naming conventions
        if (firestoreData.companyName) companyNameValue = firestoreData.companyName;
        else if (firestoreData.company) companyNameValue = firestoreData.company;
        else if (firestoreData.Company) companyNameValue = firestoreData.Company;
        else if (firestoreData.companyname) companyNameValue = firestoreData.companyname;
        else if (firestoreData.userCompany) companyNameValue = firestoreData.userCompany;
        else if (firestoreData.usercompany) companyNameValue = firestoreData.usercompany;
        // Check the UserInformation nested object
        else if (firestoreData.UserInformation && firestoreData.UserInformation.CompanyName) 
          companyNameValue = firestoreData.UserInformation.CompanyName;
        // Traverse through all keys looking for the company name (case insensitive)
        else {
          for (const key in firestoreData) {
            if (typeof firestoreData[key] === 'string' && 
                (key.toLowerCase().includes('company') || key.toLowerCase() === 'test')) {
              companyNameValue = firestoreData[key];
              console.log(`Found company name in field: ${key} = ${companyNameValue}`);
              break;
            } else if (typeof firestoreData[key] === 'object' && firestoreData[key] !== null) {
              // Look one level deeper in nested objects
              for (const nestedKey in firestoreData[key]) {
                if (typeof firestoreData[key][nestedKey] === 'string' && 
                    (nestedKey.toLowerCase().includes('company') || nestedKey.toLowerCase() === 'test')) {
                  companyNameValue = firestoreData[key][nestedKey];
                  console.log(`Found company name in nested field: ${key}.${nestedKey} = ${companyNameValue}`);
                  break;
                }
              }
            }
          }
        }
      }
      
      console.log("FINAL COMPANY NAME VALUE:", companyNameValue);
      
      // Overwrite defaults with Firestore data if available
      reportData.UserInformation = {
        UserName: firestoreData.userName || firestoreData.UserInformation?.UserName || firestoreData.name || firestoreData.Name || firestoreData.user || firestoreData.User || 'N/A',
        CompanyName: companyNameValue,
        Industry: firestoreData.industry || firestoreData.Industry || firestoreData.UserInformation?.Industry || 'N/A',
        Email: firestoreData.userEmail || firestoreData.email || firestoreData.Email || firestoreData.UserInformation?.Email || 'N/A',
      };
      reportData.ScoreInformation = {
        AITier: firestoreData.tier || firestoreData.ScoreInformation?.AITier || 'N/A',
        FinalScore: firestoreData.score?.toString() || firestoreData.ScoreInformation?.FinalScore || 'N/A',
        ReportID: reportId, // Already set
      };
      reportData.FullReportMarkdown = firestoreData.reportMarkdown || firestoreData.markdown || '';
      reportData.QuestionAnswerHistory = firestoreData.questionAnswerHistory || firestoreData.answers || [];

      console.log('Processed report data:', {
        userName: reportData.UserInformation.UserName,
        companyName: reportData.UserInformation.CompanyName,
        industry: reportData.UserInformation.Industry,
        email: reportData.UserInformation.Email,
        aiTier: reportData.ScoreInformation.AITier,
        finalScore: reportData.ScoreInformation.FinalScore,
        markdownLength: reportData.FullReportMarkdown.length,
        qaHistoryCount: reportData.QuestionAnswerHistory.length
      });

    } else {
      console.log('No reportId in URL, attempting to read from request body...');
      try {
        const bodyData = await request.json();
        console.log('Request body data:', bodyData);
        reportData.UserInformation = {
          UserName: bodyData.UserInformation?.UserName || reportData.UserInformation.UserName,
          CompanyName: bodyData.UserInformation?.CompanyName || reportData.UserInformation.CompanyName,
          Industry: bodyData.UserInformation?.Industry || reportData.UserInformation.Industry,
          Email: bodyData.UserInformation?.Email || reportData.UserInformation.Email,
        };
        reportData.ScoreInformation = {
          AITier: bodyData.ScoreInformation?.AITier || reportData.ScoreInformation.AITier,
          FinalScore: bodyData.ScoreInformation?.FinalScore || reportData.ScoreInformation.FinalScore,
          ReportID: bodyData.ScoreInformation?.ReportID || reportData.ScoreInformation.ReportID,
        };
        reportData.FullReportMarkdown = bodyData.FullReportMarkdown || reportData.FullReportMarkdown;
        reportData.QuestionAnswerHistory = bodyData.QuestionAnswerHistory || reportData.QuestionAnswerHistory;
      } catch (bodyError) {
        console.warn('Could not parse request body as JSON or body is empty:', bodyError);
      }
    }

    console.log('Generating HTML from report data...');
    const html = await generatePresentationHTML(reportData);

    const debugHtmlPath = path.join(process.cwd(), 'debug_presentation.html');
    fs.writeFileSync(debugHtmlPath, html, 'utf8');
    console.log(`Debug HTML saved to: ${debugHtmlPath}`);

    console.log('Sending request to WeasyPrint service...');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), WEASYPRINT_TIMEOUT);
      
      // Retry mechanism for transient failures
      const MAX_RETRIES = 3;
      let retryCount = 0;
      let weasyPrintResponse;
      
      while (retryCount < MAX_RETRIES) {
        try {
          console.log(`Attempt ${retryCount + 1} of ${MAX_RETRIES} to generate PDF...`);
          
          // Add compression headers to reduce payload size
          weasyPrintResponse = await fetch(WEASYPRINT_SERVICE_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept-Encoding': 'gzip, deflate, br',
            },
            body: JSON.stringify({
              html_content: html,
              pdf_options: {
                presentational_hints: true,
                optimize_size: ['images', 'fonts'],
                compress: true
              }
            }),
            signal: controller.signal
          });
          
          // If successful, break out of retry loop
          if (weasyPrintResponse.ok) {
            console.log(`PDF generation successful on attempt ${retryCount + 1}`);
            break;
          }
          
          console.warn(`Attempt ${retryCount + 1} failed with status: ${weasyPrintResponse.status}`);
          retryCount++;
          
          // Only wait between retries if we're going to retry again
          if (retryCount < MAX_RETRIES) {
            console.log(`Waiting before retry attempt ${retryCount + 1}...`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
          }
        } catch (retryError) {
          // If it's a timeout, don't retry
          if (retryError instanceof Error && retryError.name === 'AbortError') {
            console.error('WeasyPrint service request timed out');
            throw retryError;
          }
          
          console.warn(`Attempt ${retryCount + 1} failed with error:`, retryError);
          retryCount++;
          
          // Only wait between retries if we're going to retry again
          if (retryCount < MAX_RETRIES) {
            console.log(`Waiting before retry attempt ${retryCount + 1}...`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
          }
        }
      }
      
      clearTimeout(timeoutId);
      
      // If all retries failed, handle the error
      if (!weasyPrintResponse || !weasyPrintResponse.ok) {
        let errorDetails = '';
        try {
          if (weasyPrintResponse) {
            const errorData = await weasyPrintResponse.json();
            errorDetails = JSON.stringify(errorData);
          } else {
            errorDetails = 'No response received from WeasyPrint service after multiple attempts';
          }
        } catch (e) {
          errorDetails = weasyPrintResponse ? await weasyPrintResponse.text() : 'Failed to parse error response';
        }
        
        console.error(`WeasyPrint service error after ${MAX_RETRIES} attempts: ${weasyPrintResponse?.status} - ${errorDetails}`);
        return NextResponse.json(
          { error: `WeasyPrint service error: ${weasyPrintResponse?.status}`, details: errorDetails },
          { status: 500 }
        );
      }

      // Process successful response
      try {
        const pdfBuffer = await weasyPrintResponse.arrayBuffer();
        const companyName = reportData.UserInformation.CompanyName || 'Company';
        const userName = reportData.UserInformation.UserName || 'User';
        const sanitizedName = `${userName}_${companyName}`.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const filename = `${sanitizedName}_ai_scorecard_${reportData.ReportDate}.pdf`;

        console.log(`PDF generated successfully. Filename: ${filename}`);

        return new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      } catch (bufferError) {
        console.error('Error processing PDF buffer:', bufferError);
        return NextResponse.json(
          { error: 'Error processing PDF response', details: String(bufferError) },
          { status: 500 }
        );
      }

    } catch (weasyPrintError) {
      console.error('WeasyPrint service error:', weasyPrintError);
      if (weasyPrintError instanceof Error && weasyPrintError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'WeasyPrint service request timed out. The PDF generation process took too long to complete. Please try again with a smaller report or contact support.' },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { error: 'WeasyPrint service error', details: String(weasyPrintError) },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in PDF generation:', error);
    return NextResponse.json(
      { error: 'PDF generation failed', details: String(error) },
      { status: 500 }
    );
  }
}

// --- Helper Functions for Content Extraction and HTML Generation ---

// Simple Markdown to HTML converter
function simpleMarkdownToHTML(markdown: string, isListItemContent: boolean = false): string {
  if (!markdown) return '';
  let html = markdown.trim();

  // Bold: **text** or __text__
  html = html.replace(/\*\*([^\*\*]+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^__]+?)__/g, '<strong>$1</strong>');
  // Italic: *text* or _text_ (avoiding **/** being treated as * or _)
  html = html.replace(/(?<![\*])\*([^\*]+?)\*(?![\*])/g, '<em>$1</em>');
  html = html.replace(/(?<![_])_([^_]+?)_(?![_])/g, '<em>$1</em>');

  if (!isListItemContent) {
    html = html.split('\n\n').map(paragraph => {
      const trimmedParagraph = paragraph.trim();
      if (trimmedParagraph) {
        return `<p>${trimmedParagraph.replace(/\n/g, '<br>')}</p>`;
      }
      return '';
    }).join('');
  } else {
    html = html.replace(/\n/g, '<br>');
  }
  return html;
}

function extractStrengthsHTML(markdown: string): string {
  console.log('Extracting strengths from markdown...');
  
  // More specific pattern to match strengths section
  const strengthsSectionMatch = markdown.match(/\*\*Strengths:\*\*\s*([\s\S]*?)(?=\n\n\*\*Weaknesses:\*\*|\n##|\n###|$)/i);
  
  if (!strengthsSectionMatch || !strengthsSectionMatch[1]) {
    console.log('No strengths section found in markdown');
    return '<p>Strengths section not found in the report.</p>';
  }

  const strengthsText = strengthsSectionMatch[1].trim();
  console.log('Found strengths text:', strengthsText);

  // Split into individual strength items
  const strengthItems = strengthsText.split(/\n(?=\d+\.\s+)/);
  console.log(`Found ${strengthItems.length} strength items`);

  const processedItems = strengthItems.map(item => {
    // Try to match items with titles
    const itemMatch = item.match(/^\d+\.\s+\*\*(.*?):\*\*\s*-\s*([\s\S]*)/s);
    if (itemMatch) {
      const title = itemMatch[1].trim();
      const description = itemMatch[2].trim();
      console.log(`Processing strength with title: ${title}`);
      return `
        <div class="strength-item no-break">
          <h5>${simpleMarkdownToHTML(title, true)}</h5>
          <p>${simpleMarkdownToHTML(description, true)}</p>
        </div>`;
    }

    // Try to match simple numbered items
    const numberedItemMatch = item.match(/^\d+\.\s+([\s\S]*)/s);
    if (numberedItemMatch) {
      const content = numberedItemMatch[1].trim();
      console.log('Processing simple numbered strength item');
      return `
        <div class="strength-item no-break">
          <p>${simpleMarkdownToHTML(content, true)}</p>
        </div>`;
    }

    return '';
  }).filter(item => item.length > 0);

  if (processedItems.length === 0) {
    console.log('No valid strength items found after processing');
    return '<p>No strengths could be extracted in the expected format.</p>';
  }

  console.log(`Successfully processed ${processedItems.length} strength items`);
  return processedItems.join('\n');
}

function extractChallengesHTML(markdown: string): string {
  console.log('Extracting challenges/weaknesses from markdown...');
  
  // More specific pattern to match weaknesses section
  const challengesSectionMatch = markdown.match(/\*\*Weaknesses:\*\*\s*([\s\S]*?)(?=\n\n\d+\.\s|\n##|\n###|$)/i);
  
  if (!challengesSectionMatch || !challengesSectionMatch[1]) {
    console.log('No challenges/weaknesses section found in markdown');
    return '<p>Challenges section not found in the report.</p>';
  }

  const challengesText = challengesSectionMatch[1].trim();
  console.log('Found challenges text:', challengesText);

  // Split into individual challenge items
  const challengeItems = challengesText.split(/\n(?=\d+\.\s+)/);
  console.log(`Found ${challengeItems.length} challenge items`);

  const processedItems = challengeItems.map(item => {
    // Try to match items with titles
    const itemMatch = item.match(/^\d+\.\s+\*\*(.*?):\*\*\s*-\s*([\s\S]*)/s);
    if (itemMatch) {
      const title = itemMatch[1].trim();
      const description = itemMatch[2].trim();
      console.log(`Processing challenge with title: ${title}`);
      return `
        <div class="weakness-item no-break">
          <h5>${simpleMarkdownToHTML(title, true)}</h5>
          <p>${simpleMarkdownToHTML(description, true)}</p>
        </div>`;
    }

    // Try to match simple numbered items
    const numberedItemMatch = item.match(/^\d+\.\s+([\s\S]*)/s);
    if (numberedItemMatch) {
      const content = numberedItemMatch[1].trim();
      console.log('Processing simple numbered challenge item');
      return `
        <div class="weakness-item no-break">
          <p>${simpleMarkdownToHTML(content, true)}</p>
        </div>`;
    }

    return '';
  }).filter(item => item.length > 0);

  if (processedItems.length === 0) {
    console.log('No valid challenge items found after processing');
    return '<p>No challenges could be extracted in the expected format.</p>';
  }

  console.log(`Successfully processed ${processedItems.length} challenge items`);
  return processedItems.join('\n');
}

function extractActionPlanHTML(markdown: string): string {
  console.log('Extracting action plan items from report...');
  
  const actionItemsHtml: string[] = [];
  
  // First try to find a dedicated action plan section
  const sectionPatterns = [
    /## Strategic Action Plan\s*([\s\S]*?)(?=\n##|$)/i,
    /## Action Plan\s*([\s\S]*?)(?=\n##|$)/i,
    /## Strategic Recommendations\s*([\s\S]*?)(?=\n##|$)/i,
    /## Recommendations\s*([\s\S]*?)(?=\n##|$)/i
  ];

  let actionPlanContent = '';
  for (const pattern of sectionPatterns) {
    const match = markdown.match(pattern);
    if (match && match[1]) {
      actionPlanContent = match[1].trim();
      console.log(`Found action plan section with pattern: ${pattern}`);
      break;
    }
  }

  if (actionPlanContent) {
    console.log('Action plan content length:', actionPlanContent.length);
    
    // Split into individual items, keeping the numbers
    const items = actionPlanContent.split(/\n(?=\d+\.\s+)/);
    console.log(`Found ${items.length} potential action items`);

    items.forEach((item, index) => {
      if (index === 0 && !item.match(/^\d+\.\s+/)) {
        return; // Skip introduction text
      }

      // Try different patterns for action items
      const patterns = [
        /^(\d+)\.\s+\*\*([^:]+):\*\*\s*([\s\S]*)/,  // 1. **Title:** Content
        /^(\d+)\.\s+\*\*([^*]+)\*\*\s*([\s\S]*)/,   // 1. **Title** Content
        /^(\d+)\.\s+([^:]+):\s*([\s\S]*)/,          // 1. Title: Content
        /^(\d+)\.\s+([\s\S]*)/                       // 1. Content
      ];

      for (const pattern of patterns) {
        const match = item.match(pattern);
        if (match) {
          const number = match[1];
          const title = pattern === patterns[3] ? `Action Item ${number}` : match[2].trim();
          const content = (pattern === patterns[3] ? match[2] : match[3] || '').trim();

          // Process the content for sub-steps or bullet points
          let contentHtml = '';
          
          // First try to find sub-steps
          const subSteps = content.match(/(?:^|\n)(?:\s*[-*]\s+)\*\*(?:Sub-step|Step) \d+:\*\*\s*([^\n]+)/g);
          if (subSteps) {
            contentHtml = '<ul class="compact-list">';
            subSteps.forEach(step => {
              const stepMatch = step.match(/\*\*((?:Sub-step|Step) \d+):\*\*\s*(.*)/);
              if (stepMatch) {
                contentHtml += `<li><strong>${stepMatch[1]}:</strong> ${simpleMarkdownToHTML(stepMatch[2], true)}</li>`;
              }
            });
            contentHtml += '</ul>';
          } else {
            // Try to find regular bullet points
            const bullets = content.match(/(?:^|\n)(?:\s*[-*]\s+)([^\n]+)/g);
            if (bullets) {
              contentHtml = '<ul class="compact-list">';
              bullets.forEach(bullet => {
                const bulletText = bullet.replace(/^\s*[-*]\s+/, '').trim();
                contentHtml += `<li>${simpleMarkdownToHTML(bulletText, true)}</li>`;
              });
              contentHtml += '</ul>';
            } else {
              // Just use the content as paragraphs
              contentHtml = content.split(/\n\n+/).map(p => 
                `<p>${simpleMarkdownToHTML(p.trim(), true)}</p>`
              ).join('\n');
            }
          }

          actionItemsHtml.push(`
            <div class="action-item no-break">
              <div class="action-number">${number}</div>
              <div class="action-content">
                <h3>${simpleMarkdownToHTML(title, true)}</h3>
                ${contentHtml}
              </div>
            </div>
          `);
          break;
        }
      }
    });
  }

  // If no items found in a dedicated section, look throughout the document
  if (actionItemsHtml.length === 0) {
    console.log('Looking for action items throughout the document...');
    
    // Skip past the strengths and weaknesses sections
    const contentAfterWeaknesses = markdown.replace(/[\s\S]*?\*\*Weaknesses:\*\*([\s\S]*?)(?=\n\n\d+\.\s|\n##|$)/i, '');
    
    // Look for numbered items that look like actions
    const actionPattern = /(?:^|\n)(\d+)\.\s+(?:\*\*([^:\n]+)(?::\*\*|\*\*)\s*|\*([^:\n]+):\*\s*|([^:\n]+):\s*)([\s\S]*?)(?=(?:\n\d+\.\s+)|(?:\n##)|$)/g;
    let match;
    
    while ((match = actionPattern.exec(contentAfterWeaknesses)) !== null) {
      const number = match[1];
      const title = (match[2] || match[3] || match[4] || `Action Item ${number}`).trim();
      const content = match[5].trim();
      
      // Skip if this looks like a strength or weakness
      if (title.toLowerCase().includes('strength') || title.toLowerCase().includes('weakness')) {
        continue;
      }
      
      // Process content similar to above
      let contentHtml = '';
      const subSteps = content.match(/(?:^|\n)(?:\s*[-*]\s+)\*\*(?:Sub-step|Step) \d+:\*\*\s*([^\n]+)/g);
      
      if (subSteps) {
        contentHtml = '<ul class="compact-list">';
        subSteps.forEach(step => {
          const stepMatch = step.match(/\*\*((?:Sub-step|Step) \d+):\*\*\s*(.*)/);
          if (stepMatch) {
            contentHtml += `<li><strong>${stepMatch[1]}:</strong> ${simpleMarkdownToHTML(stepMatch[2], true)}</li>`;
          }
        });
        contentHtml += '</ul>';
      } else {
        const bullets = content.match(/(?:^|\n)(?:\s*[-*]\s+)([^\n]+)/g);
        if (bullets) {
          contentHtml = '<ul class="compact-list">';
          bullets.forEach(bullet => {
            const bulletText = bullet.replace(/^\s*[-*]\s+/, '').trim();
            contentHtml += `<li>${simpleMarkdownToHTML(bulletText, true)}</li>`;
          });
          contentHtml += '</ul>';
        } else {
          contentHtml = content.split(/\n\n+/).map(p => 
            `<p>${simpleMarkdownToHTML(p.trim(), true)}</p>`
          ).join('\n');
        }
      }

      actionItemsHtml.push(`
        <div class="action-item no-break">
          <div class="action-number">${number}</div>
          <div class="action-content">
            <h3>${simpleMarkdownToHTML(title, true)}</h3>
            ${contentHtml}
          </div>
        </div>
      `);
    }
  }

  if (actionItemsHtml.length === 0) {
    console.log('No action items found in any format');
    return '<p>No action items could be extracted from the report.</p>';
  }

  console.log(`Successfully extracted ${actionItemsHtml.length} action items`);
  return actionItemsHtml.join('\n');
}

function extractQAContentHTML(questionAnswerHistory: any[]): string {
  if (!questionAnswerHistory || questionAnswerHistory.length === 0) {
    return '<tr><td colspan="3">No Q&A data available.</td></tr>';
  }
  return questionAnswerHistory.map(qa => {
    const category = qa.phaseName || qa.category || 'N/A';
    const question = qa.question || 'N/A';
    const answer = qa.answer || 'N/A';
    return (
      `<tr class="no-break">
        <td>${simpleMarkdownToHTML(category, true)}</td>
        <td>${simpleMarkdownToHTML(question, true)}</td>
        <td>${simpleMarkdownToHTML(String(answer), true)}</td>
      </tr>`
    );
  }).join('\n');
}

function extractLearningPathHTML(markdown: string): string {
  console.log('Extracting learning path from report...');

  // Try multiple section header patterns
  const sectionPatterns = [
    /### Your Learning Path & Resources\s*([\s\S]*?)(?=\n##|$)/i,
    /### Recommended Learning Path\s*([\s\S]*?)(?=\n##|$)/i,
    /### Learning Path Recommendations\s*([\s\S]*?)(?=\n##|$)/i,
    /### Your Personalized AI Learning Path\s*([\s\S]*?)(?=\n##|$)/i
  ];

  let learningPathText = '';
  for (const pattern of sectionPatterns) {
    const match = markdown.match(pattern);
    if (match && match[1]) {
      console.log('Found learning path section with pattern:', pattern);
      learningPathText = match[1].trim();
      break;
    }
  }

  if (!learningPathText) {
    console.log('No dedicated learning path section found, looking for learning path content...');
    // Try to find numbered list that looks like learning path items
    const fallbackPatterns = [
      // Pattern 1: Numbered items with Resource and Explanation
      /(?:\n|^)(\d+\.\s+\*\*.*?\*\*:[\s\S]*?Explanation:.*?)(?=\n\d+\.\s+\*\*|\n##|$)/g,
      // Pattern 2: Numbered items with Course and Description
      /(?:\n|^)(\d+\.\s+\*\*.*?\*\*:[\s\S]*?Description:.*?)(?=\n\d+\.\s+\*\*|\n##|$)/g,
      // Pattern 3: Simple numbered course recommendations
      /(?:\n|^)(\d+\.\s+\*\*Course:.*?\*\*[\s\S]*?)(?=\n\d+\.\s+\*\*|\n##|$)/g
    ];

    for (const pattern of fallbackPatterns) {
      const matches = Array.from(markdown.matchAll(pattern));
      if (matches.length > 0) {
        console.log(`Found ${matches.length} learning items using fallback pattern`);
        return processLearningItems(matches.map(m => m[1].trim()));
      }
    }

    console.log('No learning path content found in any format');
    return '<p>No learning path recommendations could be found in the report.</p>';
  }

  // Process the found learning path section
  const learningPathItems = learningPathText.split(/\n(?=\d+\.\s+\*\*)/);
  console.log(`Found ${learningPathItems.length} learning path items`);
  
  return processLearningItems(learningPathItems);
}

function processLearningItems(items: string[]): string {
  const processedItems = items.map(itemText => {
    // Try multiple patterns for each item
    const patterns = [
      // Pattern 1: Title + Resource + Explanation
      {
        regex: /^\d+\.\s+\*\*(.*?):\*\*\s*\n\s*-\s+\*\*Resource:\*\*\s*(.*?)\s*\n\s*-\s+\*\*Explanation:\*\*\s*(.*)/s,
        process: (match: RegExpMatchArray) => ({
          title: match[1].trim(),
          resource: match[2].trim(),
          explanation: match[3].trim()
        })
      },
      // Pattern 2: Course + Description
      {
        regex: /^\d+\.\s+\*\*Course:\s*(.*?)\*\*\s*\n\s*-\s+\*\*Description:\*\*\s*(.*)/s,
        process: (match: RegExpMatchArray) => ({
          title: match[1].trim(),
          resource: 'Course',
          explanation: match[2].trim()
        })
      },
      // Pattern 3: Title + Description
      {
        regex: /^\d+\.\s+\*\*(.*?):\*\*\s*\n\s*([\s\S]*)/s,
        process: (match: RegExpMatchArray) => ({
          title: match[1].trim(),
          resource: '',
          explanation: match[2].trim()
        })
      }
    ];

    for (const pattern of patterns) {
      const match = itemText.match(pattern.regex);
      if (match) {
        const { title, resource, explanation } = pattern.process(match);
        return `
          <div class="content-box no-break">
            <h4>${simpleMarkdownToHTML(title, true)}</h4>
            ${resource ? `<p><strong>Resource:</strong> ${simpleMarkdownToHTML(resource, true)}</p>` : ''}
            <p>${resource ? '<strong>Explanation:</strong> ' : ''}${simpleMarkdownToHTML(explanation, true)}</p>
          </div>`;
      }
    }

    // Fallback for any other numbered item format
    const simpleMatch = itemText.match(/^\d+\.\s+\*\*(.*?)\*\*\s*([\s\S]*)/);
    if (simpleMatch) {
      return `
        <div class="content-box no-break">
          <h4>${simpleMarkdownToHTML(simpleMatch[1].trim(), true)}</h4>
          <p>${simpleMarkdownToHTML(simpleMatch[2].trim(), true)}</p>
        </div>`;
    }

    return '';
  }).filter(html => html.length > 0);

  if (processedItems.length === 0) {
    console.log('No learning items could be processed');
    return '<p>No learning path recommendations could be processed from the report.</p>';
  }

  console.log(`Successfully processed ${processedItems.length} learning items`);
  return processedItems.join('\n');
}

function extractDetailedAnalysisHTML(markdown: string): string {
  console.log('Extracting detailed analysis from report...');

  // First try to find a dedicated detailed analysis section
  const detailedAnalysisMatch = markdown.match(/## Detailed Analysis\s*([\s\S]*?)(?=\n##|$)/i);
  
  if (detailedAnalysisMatch && detailedAnalysisMatch[1]) {
    console.log('Found dedicated detailed analysis section');
    const content = detailedAnalysisMatch[1].trim();
    let htmlOutput = '';

    // Split into dimension blocks
    const dimensions = content.split(/\n###\s+/);
    console.log(`Found ${dimensions.length} dimension blocks`);

    for (let i = 0; i < dimensions.length; i++) {
      const dimensionBlockText = dimensions[i].trim();
      if (!dimensionBlockText) {
        console.log(`Skipping empty dimension block ${i}`);
        continue;
      }

      // Extract dimension title
      const dimensionTitleMatch = dimensionBlockText.match(/^([^\n]+)/);
      if (!dimensionTitleMatch) {
        console.log(`No title found for dimension block ${i}`);
        continue;
      }

      const dimensionTitle = dimensionTitleMatch[1].trim();
      console.log(`Processing dimension: ${dimensionTitle}`);
      let dimensionContent = dimensionBlockText.substring(dimensionTitle.length).trim();

      // Start building the dimension block HTML
      htmlOutput += `<div class="dimension-block no-break">`;
      htmlOutput += `<h4 class="dimension-title">${simpleMarkdownToHTML(dimensionTitle, true)}</h4>`;

      // Extract and add introduction text
      const dimensionIntroMatch = dimensionContent.match(/^([\s\S]*?)(?=\n\*\*|\nWeaknesses:|\n###|$)/i);
      if (dimensionIntroMatch && dimensionIntroMatch[1].trim()) {
        const intro = dimensionIntroMatch[1].trim();
        htmlOutput += `<div class="dimension-intro">${simpleMarkdownToHTML(intro)}</div>`;
        dimensionContent = dimensionContent.substring(intro.length).trim();
      }

      // Process strengths, weaknesses, and recommendations
      const sections: {
        strengths: { title: string; content: string }[];
        weaknesses: { title: string; content: string }[];
        recommendations: { title: string; content: string }[];
      } = {
        strengths: [],
        weaknesses: [],
        recommendations: []
      };

      // Find the boundaries of different sections
      const weaknessesStart = dimensionContent.search(/\nWeaknesses:/i);
      const recommendationsStart = dimensionContent.search(/\n\*\*(?!.*(?:strength|weakness)).*:\*\*/i);

      // Extract strengths
      if (weaknessesStart > -1) {
        const strengthsContent = dimensionContent.substring(0, weaknessesStart).trim();
        const strengthMatches = strengthsContent.matchAll(/\*\*([^:]+):\*\*\s*([\s\S]*?)(?=\n\*\*|$)/g);
        for (const match of strengthMatches) {
          const title = match[1].trim();
          const content = match[2].trim();
          if (!title.toLowerCase().includes('sub-step')) {
            sections.strengths.push({
              title,
              content
            });
          }
        }
      }

      // Extract weaknesses
      if (weaknessesStart > -1) {
        const weaknessesEnd = recommendationsStart > -1 ? recommendationsStart : dimensionContent.length;
        const weaknessesContent = dimensionContent.substring(weaknessesStart + 11, weaknessesEnd).trim();
        const weaknessMatches = weaknessesContent.matchAll(/\*\*([^:]+):\*\*\s*([\s\S]*?)(?=\n\*\*|$)/g);
        for (const match of weaknessMatches) {
          const title = match[1].trim();
          const content = match[2].trim();
          if (!title.toLowerCase().includes('sub-step')) {
            sections.weaknesses.push({
              title,
              content
            });
          }
        }
      }

      // Extract recommendations
      if (recommendationsStart > -1) {
        const recommendationsContent = dimensionContent.substring(recommendationsStart).trim();
        const recommendationMatches = recommendationsContent.matchAll(/\*\*([^:]+):\*\*\s*([\s\S]*?)(?=\n\*\*(?!Sub-step)|$)/g);
        for (const match of recommendationMatches) {
          const title = match[1].trim();
          const content = match[2].trim();
          if (!title.toLowerCase().includes('strength') && !title.toLowerCase().includes('weakness')) {
            sections.recommendations.push({
              title,
              content
            });
          }
        }
      }

      // Add strengths to output
      if (sections.strengths.length > 0) {
        htmlOutput += '<div class="strengths-section">';
        sections.strengths.forEach(item => {
          htmlOutput += `
            <div class="strength-item no-break">
              <h5>${simpleMarkdownToHTML(item.title, true)}</h5>
              ${simpleMarkdownToHTML(item.content)}
            </div>`;
        });
        htmlOutput += '</div>';
      }

      // Add weaknesses to output
      if (sections.weaknesses.length > 0) {
        htmlOutput += '<div class="weaknesses-section content-box no-break">';
        htmlOutput += '<h5 class="text-secondary">Weaknesses</h5>';
        sections.weaknesses.forEach(item => {
          htmlOutput += `
            <div class="weakness-item">
              <h5>${simpleMarkdownToHTML(item.title, true)}</h5>
              ${simpleMarkdownToHTML(item.content)}
            </div>`;
        });
        htmlOutput += '</div>';
      }

      // Add recommendations to output
      if (sections.recommendations.length > 0) {
        sections.recommendations.forEach(item => {
          let recommendationHtml = `
            <div class="detailed-recommendation-item no-break">
              <h5>Recommendation: ${simpleMarkdownToHTML(item.title, true)}</h5>`;

          // Check for sub-steps
          const subSteps = [];
          const subStepRegex = /(?:-|\*)\s*\*\*(Sub-step \d+):\*\*\s*([\s\S]*?)(?=\n(?:-|\*)\s*\*\*Sub-step \d+:|$)/gi;
          let subStepMatch;
          let lastIndex = 0;

          while ((subStepMatch = subStepRegex.exec(item.content)) !== null) {
            if (lastIndex === 0) {
              // Add any content before the first sub-step
              const introText = item.content.substring(0, subStepMatch.index).trim();
              if (introText) {
                recommendationHtml += `<div class="recommendation-intro">${simpleMarkdownToHTML(introText)}</div>`;
              }
            }
            subSteps.push(`<li><strong>${subStepMatch[1]}:</strong> ${simpleMarkdownToHTML(subStepMatch[2].trim(), true)}</li>`);
            lastIndex = subStepMatch.index + subStepMatch[0].length;
          }

          if (subSteps.length > 0) {
            recommendationHtml += `<ul class="compact-list">${subSteps.join('')}</ul>`;
            // Add any content after the last sub-step
            const remainingText = item.content.substring(lastIndex).trim();
            if (remainingText) {
              recommendationHtml += `<div class="recommendation-footer">${simpleMarkdownToHTML(remainingText)}</div>`;
            }
          } else {
            // No sub-steps found, check for regular bullet points
            const bulletPoints = item.content.match(/(?:^|\n)(?:\s*[-*]\s+)([^\n]+)/g);
            if (bulletPoints) {
              recommendationHtml += '<ul class="compact-list">';
              bulletPoints.forEach(bullet => {
                const bulletText = bullet.replace(/^\s*[-*]\s+/, '').trim();
                recommendationHtml += `<li>${simpleMarkdownToHTML(bulletText, true)}</li>`;
              });
              recommendationHtml += '</ul>';
            } else {
              // No bullet points, use content as-is
              recommendationHtml += simpleMarkdownToHTML(item.content);
            }
          }

          recommendationHtml += '</div>';
          htmlOutput += recommendationHtml;
        });
      }

      htmlOutput += '</div>'; // Close dimension-block
    }

    if (!htmlOutput) {
      console.log('No content could be extracted from detailed analysis section');
      return '<p>Detailed analysis content could not be parsed or is not in the expected format.</p>';
    }

    console.log('Successfully extracted detailed analysis content');
    return htmlOutput;

  } else {
    console.log('No dedicated detailed analysis section found, generating from other sections...');
    
    // Fallback: Create a detailed analysis from other sections in the report
    let htmlOutput = '';
    
    // Extract tier information
    const tierMatch = markdown.match(/### Overall Tier:\s*([^\n]+)/i);
    if (tierMatch && tierMatch[1]) {
      htmlOutput += `
        <div class="dimension-block no-break">
          <h4 class="dimension-title">AI Maturity Assessment</h4>
          <div class="dimension-intro">
            <p><strong>Current AI Maturity Tier: ${simpleMarkdownToHTML(tierMatch[1].trim(), true)}</strong></p>
          </div>`;
      
      // Try to include tier descriptions if available
      const tierDescriptionMatch = markdown.match(/### (Dabbler|Enabler|Leader) Tier Organizations[^\n]*\n([\s\S]*?)(?=###|\n## |$)/i);
      if (tierDescriptionMatch && tierDescriptionMatch[2]) {
        const tierDescription = tierDescriptionMatch[2].trim();
        htmlOutput += `
          <div class="content-box">
            <h5>Characteristics of Your Tier</h5>
            ${simpleMarkdownToHTML(tierDescription)}
          </div>`;
      }
      
      htmlOutput += '</div>';
    }
    
    // Add standard dimensions with available information
    const dimensions = [
      {
        title: 'Data Quality & Readiness',
        intro: 'Assessment of your organization\'s data infrastructure and practices.',
        patterns: [/data quality/i, /data integration/i, /data readiness/i, /product data/i]
      },
      {
        title: 'AI Strategy & Implementation',
        intro: 'Evaluation of your AI strategy and execution capabilities.',
        patterns: [/strategy/i, /implementation/i, /roadmap/i, /planning/i]
      },
      {
        title: 'Technology & Tools',
        intro: 'Analysis of your current technology stack and tool utilization.',
        patterns: [/technology/i, /tools/i, /infrastructure/i, /platform/i]
      },
      {
        title: 'Team & Organizational Readiness',
        intro: 'Assessment of team capabilities and organizational structure.',
        patterns: [/team/i, /skills/i, /training/i, /organization/i]
      }
    ];

    dimensions.forEach(dimension => {
      htmlOutput += `
        <div class="dimension-block no-break">
          <h4 class="dimension-title">${dimension.title}</h4>
          <div class="dimension-intro">
            <p>${dimension.intro}</p>
          </div>`;

      // Extract relevant strengths
      const strengthsMatch = markdown.match(/\*\*Strengths:\*\*\s*([\s\S]*?)(?=\n\n\*\*Weaknesses:|$)/i);
      if (strengthsMatch && strengthsMatch[1]) {
        const relevantStrengths: { title: string; content: string }[] = [];
        const strengthItems = strengthsMatch[1].trim().split(/\n(?=\d+\.\s+\*\*)/);
        
        strengthItems.forEach(item => {
          if (dimension.patterns.some(pattern => item.match(pattern))) {
            const itemMatch = item.match(/^\d+\.\s+\*\*([^:]+):\*\*\s*-\s*([\s\S]*)/);
            if (itemMatch) {
              relevantStrengths.push({
                title: itemMatch[1].trim(),
                content: itemMatch[2].trim()
              });
            }
          }
        });

        if (relevantStrengths.length > 0) {
          relevantStrengths.forEach(strength => {
            htmlOutput += `
              <div class="strength-item no-break">
                <h5>${simpleMarkdownToHTML(strength.title, true)}</h5>
                ${simpleMarkdownToHTML(strength.content)}
              </div>`;
          });
        }
      }

      // Extract relevant weaknesses
      const weaknessesMatch = markdown.match(/\*\*Weaknesses:\*\*\s*([\s\S]*?)(?=\n\n\d+\.\s|\n##|$)/i);
      if (weaknessesMatch && weaknessesMatch[1]) {
        const relevantWeaknesses: { title: string; content: string }[] = [];
        const weaknessItems = weaknessesMatch[1].trim().split(/\n(?=\d+\.\s+\*\*)/);
        
        weaknessItems.forEach(item => {
          if (dimension.patterns.some(pattern => item.match(pattern))) {
            const itemMatch = item.match(/^\d+\.\s+\*\*([^:]+):\*\*\s*-\s*([\s\S]*)/);
            if (itemMatch) {
              relevantWeaknesses.push({
                title: itemMatch[1].trim(),
                content: itemMatch[2].trim()
              });
            }
          }
        });

        if (relevantWeaknesses.length > 0) {
          htmlOutput += '<div class="content-box no-break">';
          htmlOutput += '<h5 class="text-secondary">Challenges</h5>';
          relevantWeaknesses.forEach(weakness => {
            htmlOutput += `
              <div class="weakness-item">
                <h5>${simpleMarkdownToHTML(weakness.title, true)}</h5>
                ${simpleMarkdownToHTML(weakness.content)}
              </div>`;
          });
          htmlOutput += '</div>';
        }
      }

      htmlOutput += '</div>'; // Close dimension-block
    });

    console.log('Generated detailed analysis from available sections');
    return htmlOutput || '<p>Could not generate detailed analysis from the available content.</p>';
  }
}


async function generatePresentationHTML(reportData: any): Promise<string> {
  console.log('Starting PDF generation process...');
  console.log('Report Data Overview:', {
    hasUserInfo: !!reportData.UserInformation,
    hasScoreInfo: !!reportData.ScoreInformation,
    markdownLength: reportData.FullReportMarkdown?.length || 0,
    qaHistoryLength: reportData.QuestionAnswerHistory?.length || 0
  });

  const templatePath = path.join(process.cwd(), 'app', 'api', 'generate-presentation-weasyprint-report', 'template-full-width.html');
  let templateHtml = '';
  try {
    templateHtml = fs.readFileSync(templatePath, 'utf8');
    console.log('Successfully loaded template HTML');
  } catch (err) {
    console.error('Error reading HTML template file:', err);
    throw new Error('Could not read HTML template for PDF generation.');
  }

  const markdown = reportData.FullReportMarkdown || '';
  if (!markdown) {
    console.warn('No markdown content found in report data!');
  }

  console.log('Extracting content sections...');

  // Extract all content first with debug logging
  console.log('Extracting strengths...');
  const strengths = extractStrengthsHTML(markdown);
  console.log('Strengths extraction complete');

  console.log('Extracting challenges...');
  const challenges = extractChallengesHTML(markdown);
  console.log('Challenges extraction complete');

  console.log('Extracting action plan...');
  const actionPlan = extractActionPlanHTML(markdown);
  console.log('Action plan extraction complete');

  console.log('Extracting QA content...');
  const qaContent = extractQAContentHTML(reportData.QuestionAnswerHistory || []);
  console.log('QA content extraction complete');

  console.log('Extracting learning path...');
  const learningPath = extractLearningPathHTML(markdown);
  console.log('Learning path extraction complete');

  console.log('Extracting detailed analysis...');
  const detailedAnalysis = extractDetailedAnalysisHTML(markdown);
  console.log('Detailed analysis extraction complete');

  // Split content into parts with validation
  console.log('Splitting content into parts...');
  
  const actionPlanParts = splitContentIntoParts(actionPlan, 3);
  console.log('Action plan parts:', {
    totalParts: actionPlanParts.length,
    part1Length: actionPlanParts[0]?.length || 0,
    part2Length: actionPlanParts[1]?.length || 0,
    part3Length: actionPlanParts[2]?.length || 0
  });

  const qaContentParts = splitContentIntoParts(qaContent, 2);
  console.log('QA content parts:', {
    totalParts: qaContentParts.length,
    part1Length: qaContentParts[0]?.length || 0,
    part2Length: qaContentParts[1]?.length || 0
  });

  const learningPathParts = splitContentIntoParts(learningPath, 2);
  console.log('Learning path parts:', {
    totalParts: learningPathParts.length,
    part1Length: learningPathParts[0]?.length || 0,
    part2Length: learningPathParts[1]?.length || 0
  });

  const detailedAnalysisParts = splitContentIntoParts(detailedAnalysis, 4);
  console.log('Detailed analysis parts:', {
    totalParts: detailedAnalysisParts.length,
    part1Length: detailedAnalysisParts[0]?.length || 0,
    part2Length: detailedAnalysisParts[1]?.length || 0,
    part3Length: detailedAnalysisParts[2]?.length || 0,
    part4Length: detailedAnalysisParts[3]?.length || 0
  });

  // Prepare template data with validation
  const data: { [key: string]: string } = {
    CompanyName: reportData.UserInformation.CompanyName || 'N/A',
    UserName: reportData.UserInformation.UserName || 'N/A',
    Industry: reportData.UserInformation.Industry || 'N/A',
    UserEmail: reportData.UserInformation.Email || 'N/A',
    ReportDate: reportData.ReportDate,
    ReportID: reportData.ScoreInformation.ReportID || 'N/A',
    AITier: reportData.ScoreInformation.AITier || 'N/A',
    FinalScore: reportData.ScoreInformation.FinalScore || 'N/A',
    STRENGTHS_CONTENT: strengths || '<p>No strengths content available.</p>',
    CHALLENGES_CONTENT: challenges || '<p>No challenges content available.</p>',
    ACTION_PLAN_CONTENT_PART_1: actionPlanParts[0] || '<p>No action plan content available for part 1.</p>',
    ACTION_PLAN_CONTENT_PART_2: actionPlanParts[1] || '',
    ACTION_PLAN_CONTENT_PART_3: actionPlanParts[2] || '',
    QA_CONTENT_PART_1: qaContentParts[0] || '<p>No Q&A content available for part 1.</p>',
    QA_CONTENT_PART_2: qaContentParts[1] || '',
    LEARNING_PATH_CONTENT_PART_1: learningPathParts[0] || '<p>No learning path content available for part 1.</p>',
    LEARNING_PATH_CONTENT_PART_2: learningPathParts[1] || '',
    DETAILED_ANALYSIS_CONTENT_PART_1: detailedAnalysisParts[0] || '<p>No detailed analysis content available for part 1.</p>',
    DETAILED_ANALYSIS_CONTENT_PART_2: detailedAnalysisParts[1] || '',
    DETAILED_ANALYSIS_CONTENT_PART_3: detailedAnalysisParts[2] || '',
    DETAILED_ANALYSIS_CONTENT_PART_4: detailedAnalysisParts[3] || ''
  };

  console.log('Template data prepared:', {
    hasCompanyName: !!data.CompanyName && data.CompanyName !== 'N/A',
    hasUserName: !!data.UserName && data.UserName !== 'N/A',
    hasIndustry: !!data.Industry && data.Industry !== 'N/A',
    hasEmail: !!data.UserEmail && data.UserEmail !== 'N/A',
    hasAITier: !!data.AITier && data.AITier !== 'N/A',
    hasFinalScore: !!data.FinalScore && data.FinalScore !== 'N/A',
    hasStrengths: data.STRENGTHS_CONTENT.length > 50,
    hasChallenges: data.CHALLENGES_CONTENT.length > 50,
    hasActionPlan: data.ACTION_PLAN_CONTENT_PART_1.length > 50,
    hasQA: data.QA_CONTENT_PART_1.length > 50,
    hasLearningPath: data.LEARNING_PATH_CONTENT_PART_1.length > 50,
    hasDetailedAnalysis: data.DETAILED_ANALYSIS_CONTENT_PART_1.length > 50
  });

  // Replace template variables
  let html = templateHtml;
  for (const key in data) {
    const value = String(data[key] === undefined || data[key] === null ? '' : data[key]);
    // Triple-stash for HTML content
    html = html.replace(new RegExp(`{{{${key}}}}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    // Double-stash for plain text
    html = html.replace(new RegExp(`{{${key}}}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
  }

  // Save debug HTML
  const debugHtmlPath = path.join(process.cwd(), 'debug_presentation.html');
  fs.writeFileSync(debugHtmlPath, html, 'utf8');
  console.log(`Debug HTML saved to: ${debugHtmlPath}`);

  return html;
}

// Helper function to split content into parts
function splitContentIntoParts(content: string, numParts: number): string[] {
  if (!content) return Array(numParts).fill('');
  
  // For table content (QA sections)
  if (content.includes('<tr')) {
    const rows = content.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
    const rowsPerPart = Math.ceil(rows.length / numParts);
    return Array.from({ length: numParts }, (_, i) => {
      const start = i * rowsPerPart;
      const end = Math.min(start + rowsPerPart, rows.length);
      return rows.slice(start, end).join('\n');
    });
  }

  // For div-based content (action plan, learning path, detailed analysis)
  const divs = content.match(/<div[^>]*>[\s\S]*?<\/div>/g) || [];
  const divsPerPart = Math.ceil(divs.length / numParts);
  return Array.from({ length: numParts }, (_, i) => {
    const start = i * divsPerPart;
    const end = Math.min(start + divsPerPart, divs.length);
    return divs.slice(start, end).join('\n');
  });
}
