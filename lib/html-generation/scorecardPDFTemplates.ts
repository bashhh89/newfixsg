// lib/html-generation/scorecardPDFTemplates.ts

export interface AnswerHistoryEntry {
  question: string;
  answer: string;
  phaseName?: string;
  reasoningText?: string;
  answerType?: string;
  options?: string[] | null;
  index?: number;
  answerSource?: string;
}

export interface ScorecardData {
  UserInformation: {
    UserName: string;
    CompanyName: string;
    Industry: string;
    Email: string;
  };
  ScoreInformation: {
    AITier: string;
    FinalScore: number | null;
    ReportID: string;
  };
  QuestionAnswerHistory: AnswerHistoryEntry[];
  FullReportMarkdown: string;
}

/**
 * Safely convert markdown text to HTML with minimal processing
 * This is a simplified version that avoids problematic parsing issues
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
  html = html.replace(/<p>[^<]*?#[^<]*?<\/p>/g, (match) => {
    return match.replace(/#/g, '');
  });

  return html;
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
 * Generates the HTML for the Header section of the Scorecard PDF.
 * @param data - The scorecard data.
 * @returns HTML string for the Header section.
 */
export function generateHeaderHTML(data: ScorecardData): string {
  return `
    <div class="header">
      <h1>AI Efficiency Scorecard</h1>
      <p>A comprehensive assessment of AI effectiveness and strategic opportunities</p>
    </div>
  `;
}

/**
 * Generates the HTML for the Client Information and Assessment Results section.
 * @param data - The scorecard data.
 * @returns HTML string for the Info section.
 */
export function generateInfoSectionHTML(data: ScorecardData): string {
  const { UserInformation, ScoreInformation } = data;
  const { UserName, CompanyName, Industry, Email } = UserInformation;
  const { AITier, FinalScore, ReportID } = ScoreInformation;

  return `
    <div class="info-section">
      <div class="info-card">
        <h3>Client Information</h3>
        <p><strong>Name:</strong> ${UserName}</p>
        <p><strong>Company:</strong> ${CompanyName}</p>
        <p><strong>Industry:</strong> ${Industry}</p>
        <p><strong>Email:</strong> ${Email}</p>
      </div>

      <div class="info-card">
        <h3>Assessment Results</h3>
        <p><strong>AI Tier:</strong> ${AITier} <span class="tier-badge">${AITier}</span></p>
        ${FinalScore !== null ? `<p><strong>Score:</strong> ${FinalScore}</p>` : ''}
        <p><strong>Report ID:</strong> ${ReportID}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>
  `;
}

/**
 * Generates the HTML for the Overall Tier section of the Scorecard PDF.
 * @param sections - Extracted sections from markdown.
 * @returns HTML string for the Overall Tier section.
 */
export function generateOverallTierHTML(sections: Record<string, string>): string {
  return `
    <div class="section">
      <h2 class="section-title">Overall Assessment</h2>
      <div class="section-content">
        ${safeMarkdownToHTML(sections.overall)}
      </div>
    </div>
  `;
}


/**
 * Generates the HTML for the Key Findings section (including Strengths and Weaknesses).
 * @param sections - Extracted sections from markdown.
 * @returns HTML string for the Key Findings section.
 */
export function generateKeyFindingsHTML(sections: Record<string, string>): string {
  return `
    <div class="section">
      <h2 class="section-title">Key Findings</h2>
      <div class="section-content">
        <div class="strengths-section">
          <h3>Strengths</h3>
          ${safeMarkdownToHTML(sections.strengths)}
        </div>

        <div class="weaknesses-section">
          <h3>Weaknesses</h3>
          ${safeMarkdownToHTML(sections.weaknesses)}
        </div>
      </div>
    </div>
  `;
}

/**
 * Generates the HTML for the Strategic Action Plan section.
 * @param sections - Extracted sections from markdown.
 * @returns HTML string for the Strategic Action Plan section.
 */
export function generateStrategicPlanHTML(sections: Record<string, string>): string {
  return `
    <div class="section">
      <h2 class="section-title">Strategic Action Plan</h2>
      <div class="section-content">
        ${safeMarkdownToHTML(sections.strategicPlan)}
      </div>
    </div>
  `;
}

/**
 * Generates the HTML for the Assessment Responses (Q&A) section.
 * @param questionAnswerHistory - The question and answer history.
 * @returns HTML string for the Q&A section.
 */
export function generateAssessmentResponsesHTML(questionAnswerHistory: AnswerHistoryEntry[]): string {
  const groupedQA = groupQuestionsByPhase(questionAnswerHistory);
  return `
    <div class="section">
      <h2 class="section-title">Assessment Responses</h2>
      <div class="section-content">
        ${Object.entries(groupedQA).map(([phase, items]) => `
          <div class="qa-phase">
            <h3>${phase}</h3>

            ${items.map((item, index) => `
              <div class="qa-item">
                <div class="qa-question">Q${item.index !== undefined ? item.index + 1 : index + 1}: ${item.question}</div>
                <div class="qa-answer">${formatAnswer(item)}</div>
                ${item.reasoningText ? `<div class="qa-reasoning"><em>${item.reasoningText}</em></div>` : ''}
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Generates the HTML for the Footer section.
 * @param data - The scorecard data.
 * @returns HTML string for the Footer section.
 */
export function generateFooterHTML(data: ScorecardData): string {
  const { UserInformation } = data;
  return `
    <div class="footer">
      <p>AI Efficiency Scorecard | Generated for ${UserInformation.UserName} at ${UserInformation.CompanyName}</p>
      <p>© ${new Date().getFullYear()} - All Rights Reserved</p>
    </div>
  `;
}
