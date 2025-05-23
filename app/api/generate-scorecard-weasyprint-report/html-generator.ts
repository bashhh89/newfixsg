/**
 * HTML Generator for AI Efficiency Scorecard (WeasyPrint Version)
 * This utility generates a complete HTML document with embedded styling
 * for conversion to PDF via the WeasyPrint service.
 *
 * SIMPLIFIED VERSION: This version eliminates the problematic markdown parsing
 * and uses a more direct approach to generate the HTML.
 */

import {
  generateHeaderHTML,
  generateInfoSectionHTML,
  generateOverallTierHTML,
  generateKeyFindingsHTML,
  generateStrategicPlanHTML,
  generateAssessmentResponsesHTML,
  generateFooterHTML,
  ScorecardData, // Import the interface as well
  AnswerHistoryEntry // Import the interface as well
} from '@/lib/html-generation/scorecardPDFTemplates';


/**
 * Extracts key sections from the markdown content using a simplified approach
 */
function extractSections(markdownContent: string): Record<string, string> {
  const sections: Record<string, string> = {
    overall: '',
    keyFindings: '',
    strengths: '',
    weaknesses: '',
    strategicPlan: '',
    resources: ''
  };
  
  // Extract the overall tier section
  const overallMatch = markdownContent.match(/## Overall Tier:?([\s\S]*?)(?=##|$)/i);
  if (overallMatch) {
    sections.overall = overallMatch[1].trim();
  }
  
  // Extract key findings section
  const keyFindingsMatch = markdownContent.match(/## Key Findings([\s\S]*?)(?=##|$)/i);
  if (keyFindingsMatch) {
    sections.keyFindings = keyFindingsMatch[1].trim();
    
    // Extract strengths and weaknesses
    const strengthsMatch = keyFindingsMatch[1].match(/\*\*Strengths:\*\*([\s\S]*?)(?=\*\*Weaknesses|$)/i);
    if (strengthsMatch) {
      sections.strengths = strengthsMatch[1].trim();
    }
    
    const weaknessesMatch = keyFindingsMatch[1].match(/\*\*Weaknesses:\*\*([\s\S]*?)(?=##|$)/i);
    if (weaknessesMatch) {
      sections.weaknesses = weaknessesMatch[1].trim();
    }
  }
  
  // Extract strategic action plan
  const strategicPlanMatch = markdownContent.match(/## Strategic Action Plan([\s\S]*?)(?=##|$)/i);
  if (strategicPlanMatch) {
    sections.strategicPlan = strategicPlanMatch[1].trim();
  }

  // Extract resources section
  const resourcesMatch = markdownContent.match(/## Getting Started & Resources([\s\S]*?)(?=##|$)/i);
  if (resourcesMatch) {
    sections.resources = resourcesMatch[1].trim();
  }
  
  return sections;
}

/**
 * Formats the answer based on answer type
 */
function formatAnswer(item: AnswerHistoryEntry): string {
  if (item.answerType === 'checkbox' || item.answerType === 'radio') {
    if (typeof item.answer === 'string' && item.answer.includes('|')) {
      return item.answer.split('|').map(a => a.trim()).join(', ');
    }
  }
  
  return item.answer;
}

/**
 * Safely convert markdown text to HTML with minimal processing
 * This is a simplified version that avoids the problematic parsing issues
 */
function safeMarkdownToHTML(text: string): string {
  if (!text) return '';

  // Replace problematic characters
  let html = text
    .replace(/</g, '<')
    .replace(/>/g, '>');

  // Handle basic formatting
  html = html
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="report-link">$1</a>');

  // Handle line breaks - convert to paragraphs
  const paragraphs = html.split('\n\n').filter(p => p.trim() !== '');
  html = paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');

  // Remove any standalone # characters
  html = html.replace(/<p>#<\/p>/g, '');
html = html.replace(/<p>[^<]*?#[^<]*?<\/p>/g, (match: string) => {
  return match.replace(/#/g, '');
});

  return html;
}

/**
 * Group questions by their phase name
 */
function groupQuestionsByPhase(questionAnswerHistory: AnswerHistoryEntry[]): Record<string, AnswerHistoryEntry[]> {
  const grouped: Record<string, AnswerHistoryEntry[]> = {};

  questionAnswerHistory.forEach((item, index) => {
    const phase = item.phaseName || 'Uncategorized';
    if (!grouped[phase]) {
      grouped[phase] = [];
    }
    // Add index for reference
    const itemWithIndex = { ...item, index };
    grouped[phase].push(itemWithIndex);
  });

  return grouped;
}

/**
 * Generate a simple HTML for the scorecard
 */
export async function generateScorecardHTML(data: ScorecardData): Promise<string> {
  const { UserInformation, ScoreInformation, QuestionAnswerHistory, FullReportMarkdown } = data;

  // Extract sections from markdown
  const sections = extractSections(FullReportMarkdown);

  // Group Q&A items by phase
  const groupedQA = groupQuestionsByPhase(QuestionAnswerHistory);

  // Generate HTML using the new template functions
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Efficiency Scorecard - ${UserInformation.UserName}</title>
  <style>
    /* Base Styles */
    @page {
      size: A4;
      margin: 2cm;
    }

    body {
      font-family: 'Arial', sans-serif;
      color: #333;
      line-height: 1.5;
      margin: 0;
      padding: 0;
      font-size: 11pt;
    }

    h1, h2, h3, h4, h5, h6 {
      margin-top: 1em;
      margin-bottom: 0.5em;
      page-break-after: avoid;
      color: #103138;
    }

    h1 {
      font-size: 24pt;
      text-align: center;
      margin-top: 0;
    }

    h2 {
      font-size: 18pt;
      border-bottom: 1px solid #ddd;
      padding-bottom: 0.3em;
    }

    h3 {
      font-size: 14pt;
    }

    p {
      margin-bottom: 0.8em;
    }

    .header {
      text-align: center;
      margin-bottom: 2em;
      padding-bottom: 1em;
      border-bottom: 2px solid #103138;
    }

    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2em;
      flex-wrap: wrap;
    }

    .info-card {
      border: 1px solid #ddd;
      padding: 1em;
      border-radius: 5px;
      width: 48%;
      box-sizing: border-box;
    }

    .section {
      margin-bottom: 2em;
      page-break-inside: avoid;
    }

    .section-title {
      background-color: #103138;
      color: white;
      padding: 0.5em;
      border-radius: 5px 5px 0 0;
    }

    .section-content {
      padding: 1em;
      border: 1px solid #ddd;
      border-top: none;
      border-radius: 0 0 5px 5px;
    }

    .qa-item {
      margin-bottom: 1em;
      padding-bottom: 1em;
      border-bottom: 1px solid #eee;
    }

    .qa-question {
      font-weight: bold;
    }

    .qa-answer {
      margin-top: 0.5em;
    }

    .footer {
      text-align: center;
      margin-top: 2em;
      padding-top: 1em;
      border-top: 1px solid #ddd;
      font-size: 9pt;
      color: #666;
    }

    .report-link {
      color: #0066cc;
      text-decoration: underline;
    }

    .tier-badge {
      display: inline-block;
      padding: 4px 12px;
      background-color: #103138;
      color: white;
      font-weight: bold;
      border-radius: 20px;
      font-size: 10pt;
    }

    .strengths-section {
      background-color: #f0fff0;
      padding: 1em;
      border-left: 4px solid #20E28F;
      margin-bottom: 1em;
    }

    .weaknesses-section {
      background-color: #fff0f0;
      padding: 1em;
      border-left: 4px solid #FE7F01;
      margin-bottom: 1em;
    }
  </style>
</head>
<body>
  ${generateHeaderHTML(data)}
  ${generateInfoSectionHTML(data)}
  ${generateOverallTierHTML(sections)}
  ${generateKeyFindingsHTML(sections)}
  ${generateStrategicPlanHTML(sections)}
  ${generateAssessmentResponsesHTML(QuestionAnswerHistory)}
  ${generateFooterHTML(data)}
</body>
</html>`;
}
