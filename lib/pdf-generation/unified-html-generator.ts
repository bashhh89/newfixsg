/**
 * Unified HTML Generator for AI Efficiency Scorecard Reports
 * Generates HTML content with proper brand styling and layout
 */

import { extractAllSections, parseMarkdownToHTML, ParsedReport } from './unified-markdown-parser';

// Define types locally to avoid circular imports
export interface ScoreCardData {
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

export interface AnswerHistoryEntry {
  question: string;
  answer: string;
  phaseName?: string;
  answerType?: string;
  options?: string[];
  index?: number;
  reasoningText?: string;
}


export interface GenerationOptions {
  includeQA?: boolean;
  includeDetailedAnalysis?: boolean;
  style?: 'standard' | 'presentation';
}

export interface HTMLGenerationResult {
  success: boolean;
  html?: string;
  error?: string;
  warnings?: string[];
}

// Brand colors from the application
const BRAND_COLORS = {
  primaryGreen: '#20E28F',    // sg-bright-green
  primaryTeal: '#103138',     // sg-dark-teal
  lightMint: '#F3FDF5',       // sg-light-mint
  white: '#FFFFFF',
  textDark: '#103138',
  textLight: '#6D7278',
  borderColor: '#DDE2E5',
};

const CSS_STYLES = `
  <style>
    @page {
      size: A4;
      margin: 12mm 10mm 12mm 10mm;
    }
    
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      line-height: 1.4;
      color: ${BRAND_COLORS.textDark};
      margin: 0;
      padding: 0;
      background: #f8fafb;
      font-size: 13px;
    }
    
    .container {
      max-width: 100%;
      margin: 0 auto;
      padding: 0;
    }
    
    /* Modern Header with compact design */
    .header {
      background: linear-gradient(135deg, ${BRAND_COLORS.primaryTeal} 0%, ${BRAND_COLORS.primaryGreen} 100%);
      color: ${BRAND_COLORS.white};
      padding: 15px 20px;
      margin-bottom: 15px;
      border-radius: 0 0 12px 12px;
      box-shadow: 0 4px 12px rgba(16, 49, 56, 0.15);
    }
    
    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo {
      max-height: 32px;
      width: auto;
      filter: brightness(0) invert(1);
    }
    
    .header-text h1 {
      margin: 0;
      font-size: 20px;
      font-weight: bold;
      letter-spacing: -0.3px;
    }
    
    .header-text .subtitle {
      margin: 2px 0 0 0;
      font-size: 12px;
      opacity: 0.9;
    }
    
    .report-meta {
      text-align: right;
      font-size: 11px;
      opacity: 0.9;
    }
    
    /* Card-based layout system */
    .cards-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 15px;
    }
    
    .card {
      background: ${BRAND_COLORS.white};
      border-radius: 10px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      border: 1px solid ${BRAND_COLORS.borderColor};
      position: relative;
      overflow: hidden;
    }
    
    .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, ${BRAND_COLORS.primaryGreen} 0%, ${BRAND_COLORS.primaryTeal} 100%);
    }
    
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    
    .card-icon {
      width: 20px;
      height: 20px;
      background: ${BRAND_COLORS.primaryGreen};
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: white;
      font-weight: bold;
    }
    
    .card-title {
      color: ${BRAND_COLORS.primaryTeal};
      font-size: 14px;
      font-weight: 600;
      margin: 0;
    }
    
    /* Company info card */
    .company-card .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .info-label {
      font-weight: 600;
      color: ${BRAND_COLORS.primaryTeal};
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .info-value {
      color: ${BRAND_COLORS.textDark};
      font-size: 12px;
      font-weight: 500;
    }
    
    /* Score card with enhanced design */
    .score-card {
      background: linear-gradient(135deg, ${BRAND_COLORS.primaryTeal} 0%, ${BRAND_COLORS.primaryGreen} 100%);
      color: ${BRAND_COLORS.white};
      text-align: center;
      position: relative;
    }
    
    .score-card::before {
      background: rgba(255,255,255,0.1);
    }
    
    .score-display {
      font-size: 28px;
      font-weight: bold;
      margin: 8px 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .tier-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 12px;
      border-radius: 15px;
      display: inline-block;
      margin-top: 6px;
      font-weight: 600;
      font-size: 11px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    /* Full-width content cards */
    .content-card {
      grid-column: 1 / -1;
      margin-bottom: 12px;
    }
    
    .content-card h2 {
      color: ${BRAND_COLORS.primaryTeal};
      font-size: 16px;
      margin: 0 0 12px 0;
      font-weight: bold;
    }
    
    .content-card h3 {
      color: ${BRAND_COLORS.primaryTeal};
      font-size: 14px;
      margin: 12px 0 8px 0;
      font-weight: 600;
    }
    
    .content-card h4 {
      color: ${BRAND_COLORS.primaryTeal};
      font-size: 13px;
      margin: 10px 0 6px 0;
      font-weight: 600;
    }
    
    .content-card p {
      margin: 0 0 10px 0;
      text-align: justify;
      line-height: 1.5;
      font-size: 12px;
    }
    
    .content-card ul, .content-card ol {
      margin: 10px 0;
      padding-left: 18px;
    }
    
    .content-card li {
      margin-bottom: 4px;
      line-height: 1.4;
      font-size: 12px;
    }
    
    .content-card strong {
      color: ${BRAND_COLORS.primaryTeal};
      font-weight: 600;
    }
    
    /* Strengths and weaknesses in two columns */
    .findings-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 10px;
    }
    
    .findings-column {
      background: ${BRAND_COLORS.lightMint};
      padding: 12px;
      border-radius: 8px;
      border-left: 4px solid ${BRAND_COLORS.primaryGreen};
    }
    
    .findings-column h3 {
      margin: 0 0 8px 0;
      font-size: 13px;
      color: ${BRAND_COLORS.primaryTeal};
    }
    
    .findings-column ul {
      margin: 0;
      padding-left: 15px;
    }
    
    .findings-column li {
      font-size: 11px;
      line-height: 1.4;
      margin-bottom: 3px;
    }
    
    /* Action plan with numbered cards */
    .action-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 10px;
    }
    
    .action-item {
      background: ${BRAND_COLORS.lightMint};
      padding: 12px;
      border-radius: 8px;
      border-left: 4px solid ${BRAND_COLORS.primaryGreen};
      position: relative;
    }
    
    .action-number {
      position: absolute;
      top: -8px;
      left: 12px;
      background: ${BRAND_COLORS.primaryTeal};
      color: white;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
    }
    
    .action-item h4 {
      margin: 8px 0 6px 0;
      font-size: 12px;
      color: ${BRAND_COLORS.primaryTeal};
    }
    
    .action-item ul {
      margin: 0;
      padding-left: 15px;
    }
    
    .action-item li {
      font-size: 10px;
      line-height: 1.3;
      margin-bottom: 2px;
    }
    
    /* Compact Q&A section */
    .qa-card {
      background: ${BRAND_COLORS.lightMint};
      border: 1px solid ${BRAND_COLORS.primaryGreen};
    }
    
    .phase-header {
      background: ${BRAND_COLORS.primaryTeal};
      color: ${BRAND_COLORS.white};
      padding: 8px 12px;
      border-radius: 5px;
      margin: 15px 0 8px 0;
      font-weight: 600;
      font-size: 12px;
    }
    
    .qa-item {
      margin-bottom: 10px;
      padding: 8px;
      background: ${BRAND_COLORS.white};
      border-radius: 5px;
      border-left: 3px solid ${BRAND_COLORS.primaryGreen};
    }
    
    .qa-item:last-child {
      margin-bottom: 0;
    }
    
    .question {
      font-weight: 600;
      color: ${BRAND_COLORS.primaryTeal};
      margin-bottom: 4px;
      font-size: 11px;
    }
    
    .answer {
      color: ${BRAND_COLORS.textDark};
      margin-left: 8px;
      font-size: 10px;
      line-height: 1.4;
    }
    
    /* Compact footer - moved to end */
    .footer {
      text-align: center;
      margin-top: 30px;
      padding: 20px 0;
      border-top: 2px solid ${BRAND_COLORS.primaryGreen};
      color: ${BRAND_COLORS.textLight};
      font-size: 10px;
      background: transparent;
      page-break-inside: avoid;
    }
    
    .footer .brand-info {
      color: ${BRAND_COLORS.primaryTeal};
      font-weight: 600;
      margin-bottom: 8px;
    }

    .footer .logo {
      max-height: 24px;
      width: auto;
      margin-bottom: 8px;
      filter: none;
    }

    
/* Presentation style layout */
    .presentation-style {
      background: #f8fafb;
    }

    .presentation-style .container {
      max-width: 100%;
      margin: 0;
      padding: 0;
    }

    .presentation-style .slide {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: calc(100vh - 40px);
      page-break-after: always;
      margin-bottom: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(16, 49, 56, 0.15);
      overflow: hidden;
    }

    .presentation-style .slide-content {
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .presentation-style .slide-image {
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      min-height: 100%;
      background: linear-gradient(135deg, ${BRAND_COLORS.primaryTeal} 0%, ${BRAND_COLORS.primaryGreen} 100%);
    }

    .presentation-style .slide-title {
      font-size: 36px;
      font-weight: bold;
      color: ${BRAND_COLORS.primaryTeal};
      margin: 0 0 20px 0;
      line-height: 1.2;
    }

    .presentation-style .slide-subtitle {
      font-size: 18px;
      color: ${BRAND_COLORS.textLight};
      margin: 0 0 30px 0;
      line-height: 1.4;
    }

    .presentation-style .welcome-text {
      font-size: 24px;
      color: ${BRAND_COLORS.primaryTeal};
      margin: 20px 0;
      font-weight: 600;
    }

    .presentation-style .company-info {
      background: ${BRAND_COLORS.lightMint};
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }

    .presentation-style .tier-display {
      font-size: 48px;
      font-weight: bold;
      color: ${BRAND_COLORS.primaryGreen};
      text-align: center;
      margin: 20px 0;
    }


    .presentation-style .highlight-box {
      background: ${BRAND_COLORS.lightMint};
      border-left: 4px solid ${BRAND_COLORS.primaryGreen};
      padding: 20px;
      margin-bottom: 15px;
      border-radius: 8px;
    }

    .presentation-style .highlight-box h3 {
      color: ${BRAND_COLORS.primaryTeal};
      font-size: 18px;
      margin: 0 0 10px 0;
    }

    .presentation-style .highlight-box ul {
      margin: 0;
      padding-left: 20px;
    }

    .presentation-style .highlight-box li {
      margin-bottom: 8px;
      font-size: 14px;
      line-height: 1.5;
    }

    .presentation-style .grid-boxes {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 20px 0;
    }

    .presentation-style .box {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid ${BRAND_COLORS.borderColor};
    }

    .presentation-style .box-title {
      font-size: 16px;
      font-weight: bold;
      color: ${BRAND_COLORS.primaryTeal};
      margin: 0 0 10px 0;
    }

    .presentation-style .box-content {
      font-size: 14px;
      line-height: 1.5;
    }

    .presentation-style .action-step {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      margin-bottom: 20px;
    }

    .presentation-style .step-number {
      width: 30px;
      height: 30px;
      background: ${BRAND_COLORS.primaryTeal};
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      flex-shrink: 0;
    }

    .presentation-style .step-content {
      flex: 1;
    }

    .presentation-style .step-title {
      font-size: 16px;
      font-weight: bold;
      color: ${BRAND_COLORS.primaryTeal};
      margin: 0 0 8px 0;
    }

    .presentation-style .step-description {
      font-size: 14px;
      line-height: 1.5;
      color: ${BRAND_COLORS.textDark};
    }

    
    /* Print optimizations */
    @media print {
      body {
        font-size: 11px;
        background: white;
      }
      
      .card {
        page-break-inside: avoid;
        margin-bottom: 8px;
        box-shadow: none;
        border: 1px solid #ddd;
      }
      
      .content-card {
        page-break-inside: avoid;
      }
      
      .qa-card {
        page-break-inside: avoid;
      }
      
      .phase-header {
        page-break-after: avoid;
      }
      
      .qa-item {
        page-break-inside: avoid;
      }
      
      .action-grid {
        page-break-inside: avoid;
      }
      
      .findings-grid {
        page-break-inside: avoid;
      }
    }
    
    /* Utility classes */
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .font-semibold { font-weight: 600; }
    .mb-0 { margin-bottom: 0; }
    .mb-1 { margin-bottom: 6px; }
    .mb-2 { margin-bottom: 10px; }
    .mt-0 { margin-top: 0; }
    .mt-1 { margin-top: 6px; }
    .mt-2 { margin-top: 10px; }
  </style>
`;


/**
 * Generate HTML using unified system (main function)
 */
export function generateUnifiedHTML(
  data: ScoreCardData,
  parsedReport: ParsedReport,
  options: GenerationOptions = {}
): string {
  console.log('UNIFIED_HTML: Starting HTML generation with options:', options);
  
  // Determine style class
  const styleClass = options.style === 'presentation' ? 'presentation-style' : '';

  // Generate all sections
  const headerSection = generateHeaderSection();
  const companyInfoSection = generateCompanyInfoSection(data);
  const scoreSection = generateScoreSection(data);
  const contentSections = generateContentSections(parsedReport, options, data);

  const qaSection = generateQASection(data, options);
  const footerSection = generateFooterSection(data);

  // Combine all sections
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI Efficiency Scorecard Report - ${data.UserInformation?.CompanyName || 'Report'}</title>
      ${CSS_STYLES}
    </head>
    <body class="${styleClass}">
      <div class="container">
        ${headerSection}
        ${companyInfoSection}
        ${scoreSection}
        ${contentSections}
        ${qaSection}
        ${footerSection}
      </div>
    </body>
    </html>
  `;

  console.log('UNIFIED_HTML: HTML generation completed successfully');
  return htmlContent;
}

/**
 * Generates HTML content for scorecard reports (new interface)
 */
export function generateHTMLPreview(
  data: ScoreCardData,
  options: GenerationOptions = {}
): HTMLGenerationResult {
  try {
    console.log('UNIFIED_HTML: Starting HTML generation with options:', options);
    
    const warnings: string[] = [];
    
    // Validate input data
    if (!data) {
      return {
        success: false,
        error: 'No data provided for HTML generation'
      };
    }

    // Parse markdown content
    const parsedReport = extractAllSections(data.FullReportMarkdown || '');
    console.log('UNIFIED_HTML: Parsed sections found');


    // Generate HTML using unified system
    const htmlContent = generateUnifiedHTML(data, parsedReport, options);

    
    return {
      success: true,
      html: htmlContent,
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error: any) {
    console.error('UNIFIED_HTML: Error generating HTML:', error);
    return {
      success: false,
      error: `HTML generation failed: ${error.message}`
    };
  }
}

// Helper functions for generating sections
function generateHeaderSection(): string {
  return `
    <div class="header">
      <div class="header-content">
        <div class="logo-section">
          <img src="/footer-logo.svg" alt="Social Garden AI Scorecard" class="logo" />
          <div class="header-text">
            <h1>AI Efficiency Scorecard</h1>
            <p class="subtitle">Comprehensive AI Maturity Assessment</p>
          </div>
        </div>
        <div class="report-meta">
          <div>Generated: ${new Date().toLocaleDateString()}</div>
          <div>Confidential Report</div>
        </div>
      </div>
    </div>
  `;
}



function generateCompanyInfoSection(data: ScoreCardData): string {
  // Ensure we use the actual user name, not "User"
  const userName = data.UserInformation?.UserName && data.UserInformation.UserName !== 'User' 
    ? data.UserInformation.UserName 
    : data.UserInformation?.UserName || 'Not specified';
  
  const companyName = data.UserInformation?.CompanyName && data.UserInformation.CompanyName !== 'Company' 
    ? data.UserInformation.CompanyName 
    : data.UserInformation?.CompanyName || 'Not specified';

  return `
    <div class="cards-container">
      <div class="card company-card">
        <div class="card-header">
          <div class="card-icon">🏢</div>
          <h3 class="card-title">Organization Overview</h3>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Company</span>
            <span class="info-value">${companyName}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Contact</span>
            <span class="info-value">${userName}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Industry</span>
            <span class="info-value">${data.UserInformation?.Industry || 'Not specified'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Report ID</span>
            <span class="info-value">${data.ScoreInformation?.ReportID || 'N/A'}</span>
          </div>
        </div>
      </div>
      
      <div class="card score-card">
        <div class="card-header">
          <div class="card-icon">📊</div>
          <h3 class="card-title">Assessment Results</h3>
        </div>
        ${data.ScoreInformation?.FinalScore !== null && data.ScoreInformation?.FinalScore !== undefined ? 
          `<div class="score-display">${data.ScoreInformation.FinalScore}/100</div>` : 
          '<div class="score-display">Complete</div>'
        }
        <div class="tier-badge">${data.ScoreInformation?.AITier || 'Assessment Complete'}</div>
      </div>
    </div>
  `;
}


function generateScoreSection(data: ScoreCardData): string {
  return ''; // Now integrated into company info section
}


function generateContentSections(parsedReport: ParsedReport, options: GenerationOptions, data: ScoreCardData): string {
  if (options.style !== 'presentation') {
    // Use existing card-based layout for standard style
    let contentSections = '';
    
    // Add introduction if available
    if (parsedReport.introText) {
      contentSections += `
        <div class="card content-card">
          <div class="card-header">
            <div class="card-icon">📋</div>
            <h3 class="card-title">Executive Summary</h3>
          </div>
          ${parsedReport.introText}
        </div>
      `;
    }
  
    // Add key findings with two-column layout
    if (parsedReport.sections.strengths.htmlContent || parsedReport.sections.weaknesses.htmlContent) {
      contentSections += `
        <div class="card content-card">
          <div class="card-header">
            <div class="card-icon">🎯</div>
            <h3 class="card-title">Key Findings</h3>
          </div>
          <div class="findings-grid">
            ${parsedReport.sections.strengths.htmlContent ? `
              <div class="findings-column">
                <h3>✅ Strengths</h3>
                ${parsedReport.sections.strengths.htmlContent}
              </div>
            ` : ''}
            ${parsedReport.sections.weaknesses.htmlContent ? `
              <div class="findings-column">
                <h3>⚠️ Areas for Improvement</h3>
                ${parsedReport.sections.weaknesses.htmlContent}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }
  
    // Add strategic plan with action items layout
    if (options.includeDetailedAnalysis && parsedReport.sections.strategicPlan.htmlContent) {
      // Parse action items from strategic plan
      const actionItems = parseActionItems(parsedReport.sections.strategicPlan.htmlContent);
      
      contentSections += `
        <div class="card content-card">
          <div class="card-header">
            <div class="card-icon">🚀</div>
            <h3 class="card-title">Strategic Action Plan</h3>
          </div>
          ${actionItems.length > 0 ? `
            <div class="action-grid">
              ${actionItems.map((item, index) => `
                <div class="action-item">
                  <div class="action-number">${index + 1}</div>
                  <h4>${item.title}</h4>
                  <ul>
                    ${item.points.map(point => `<li>${point}</li>`).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          ` : parsedReport.sections.strategicPlan.htmlContent}
        </div>
      `;
    }
  
    // Add resources if available and detailed analysis is requested
    if (options.includeDetailedAnalysis && parsedReport.sections.resources.htmlContent) {
      contentSections += `
        <div class="card content-card">
          <div class="card-header">
            <div class="card-icon">📚</div>
            <h3 class="card-title">Recommended Resources</h3>
          </div>
          ${parsedReport.sections.resources.htmlContent}
        </div>
      `;
    }
  
    // Add learning path if available
    if (options.includeDetailedAnalysis && parsedReport.sections.learningPath.htmlContent) {
      contentSections += `
        <div class="card content-card">
          <div class="card-header">
            <div class="card-icon">🎓</div>
            <h3 class="card-title">Your Personalized AI Learning Path</h3>
          </div>
          ${parsedReport.sections.learningPath.htmlContent}
        </div>
      `;
    }
  
    // Add benchmarks if available
    if (options.includeDetailedAnalysis && parsedReport.sections.benchmarks.htmlContent) {
      contentSections += `
        <div class="card content-card">
          <div class="card-header">
            <div class="card-icon">📊</div>
            <h3 class="card-title">Industry Benchmarks</h3>
          </div>
          ${parsedReport.sections.benchmarks.htmlContent}
        </div>
      `;
    }
  
    // Add other sections if detailed analysis is requested
    if (options.includeDetailedAnalysis) {
      Object.entries(parsedReport.sections).forEach(([key, section]) => {
        if (!['strengths', 'weaknesses', 'strategicPlan', 'resources', 'learningPath', 'benchmarks'].includes(key) && section.htmlContent) {
          contentSections += `
            <div class="card content-card">
              <div class="card-header">
                <div class="card-icon">📄</div>
                <h3 class="card-title">${section.title}</h3>
              </div>
              ${section.htmlContent}
            </div>
          `;
        }
      });

      // Add dynamic sections
      parsedReport.dynamicSections.forEach(section => {
        if (section.htmlContent) {
          contentSections += `
            <div class="card content-card">
              <div class="card-header">
                <div class="card-icon">📄</div>
                <h3 class="card-title">${section.title}</h3>
              </div>
              ${section.htmlContent}
            </div>
          `;
        }
      });
    }

  
    return contentSections;
  } else {
    // Presentation style: generate slide-like sections with side-by-side layout
    let slidesHTML = '';

    // Get real user name and company name
    const realUserName = data.UserInformation?.UserName && data.UserInformation.UserName !== 'User' 
      ? data.UserInformation.UserName 
      : 'User';
    const realCompanyName = data.UserInformation?.CompanyName && data.UserInformation.CompanyName !== 'Company' 
      ? data.UserInformation.CompanyName 
      : 'Your Organization';

    // Title slide with real user data
    slidesHTML += `
      <section class="slide">
        <div class="slide-content">
          <h1 class="slide-title">AI Efficiency Scorecard</h1>
          <div class="welcome-text">Welcome ${realUserName}</div>
          <div class="company-info">
            <h3>Company: ${realCompanyName}</h3>
            <p>Industry: ${data.UserInformation?.Industry || 'Not specified'}</p>
            <p>AI Maturity Tier: <strong>${data.ScoreInformation?.AITier || 'Assessment Complete'}</strong></p>
          </div>
          <div class="tier-display">${data.ScoreInformation?.AITier || 'Complete'}</div>
        </div>
        <div class="slide-image"></div>
      </section>
    `;








    // Key strengths slide
    if (parsedReport.sections.strengths.htmlContent) {
      // Extract bullet points from strengths htmlContent (assumed to be <ul><li>...</li></ul>)
      const strengthsList = parsedReport.sections.strengths.htmlContent;
      slidesHTML += `
        <section class="slide">
          <div class="slide-content">
            <h2 class="slide-title">Key Strengths in AI Adoption</h2>
            <div class="highlight-box">
              ${strengthsList}
            </div>
          </div>
          <div class="slide-image" style="background-image: url('/images/ai-strengths-bg.jpg');"></div>
        </section>
      `;
    }

    // Challenges slide
    if (parsedReport.sections.weaknesses.htmlContent) {
      const weaknessesList = parsedReport.sections.weaknesses.htmlContent;
      slidesHTML += `
        <section class="slide">
          <div class="slide-content">
            <h2 class="slide-title">Challenges and Weaknesses</h2>
            <div class="grid-boxes">
              ${weaknessesList}
            </div>
          </div>
          <div class="slide-image" style="background-image: url('/images/ai-challenges-bg.jpg');"></div>

        </section>
      `;
    }

    // Strategic action plan slide with complete content
    if (options.includeDetailedAnalysis && parsedReport.sections.strategicPlan.htmlContent) {
      const actionItems = parseActionItems(parsedReport.sections.strategicPlan.htmlContent);
      slidesHTML += `
        <section class="slide">
          <div class="slide-content">
            <h2 class="slide-title">Strategic Action Plan for ${realCompanyName}</h2>
            <p class="slide-subtitle">Recommended next steps to advance your AI maturity</p>
            ${actionItems.length > 0 ? actionItems.map((item, index) => `
              <div class="action-step">
                <div class="step-number">${index + 1}</div>
                <div class="step-content">
                  <h3 class="step-title">${item.title}</h3>
                  <p class="step-description">${item.points.join('; ')}</p>
                </div>
              </div>
            `).join('') : `
              <div class="highlight-box">
                ${parsedReport.sections.strategicPlan.htmlContent}
              </div>
            `}
          </div>
          <div class="slide-image"></div>
        </section>
      `;
    }


      // Add slides for dynamic sections with real data
      if (options.includeDetailedAnalysis) {
        parsedReport.dynamicSections.forEach(section => {
          if (section.htmlContent) {
            slidesHTML += `
              <section class="slide">
                <div class="slide-content">
                  <h2 class="slide-title">${section.title}</h2>
                  <p class="slide-subtitle">Insights for ${realCompanyName}</p>
                  <div class="highlight-box">
                    ${section.htmlContent}
                  </div>
                </div>
                <div class="slide-image"></div>
              </section>
            `;
          }
        });

        // Add slides for other sections with real data
        Object.entries(parsedReport.sections).forEach(([key, section]) => {
          if (!['strengths', 'weaknesses', 'strategicPlan'].includes(key) && section.htmlContent) {
            slidesHTML += `
              <section class="slide">
                <div class="slide-content">
                  <h2 class="slide-title">${section.title}</h2>
                  <p class="slide-subtitle">Recommendations for ${realCompanyName}</p>
                  <div class="highlight-box">
                    ${section.htmlContent}
                  </div>
                </div>
                <div class="slide-image"></div>
              </section>
            `;
          }
        });
      }


    return slidesHTML;

  }
}


// Helper function to parse action items from strategic plan content
function parseActionItems(htmlContent: string): Array<{title: string, points: string[]}> {
  const actionItems: Array<{title: string, points: string[]}> = [];
  
  // Try to extract numbered items from the content
  const listMatches = htmlContent.match(/<ol>([\s\S]*?)<\/ol>/g);
  if (listMatches) {
    listMatches.forEach(listMatch => {
      const items = listMatch.match(/<li>([\s\S]*?)<\/li>/g);
      if (items) {
        items.forEach((item, index) => {
          const cleanItem = item.replace(/<\/?li>/g, '').trim();
          const titleMatch = cleanItem.match(/^(.*?):/);
          const title = titleMatch ? titleMatch[1].trim() : `Action ${index + 1}`;
          
          // Extract bullet points if any
          const bulletMatches = cleanItem.match(/<ul>([\s\S]*?)<\/ul>/);
          let points: string[] = [];
          
          if (bulletMatches) {
            const bulletItems = bulletMatches[0].match(/<li>([\s\S]*?)<\/li>/g);
            if (bulletItems) {
              points = bulletItems.map(bullet => bullet.replace(/<\/?li>/g, '').trim());
            }
          } else {
            // If no bullets, use the content after the colon
            const contentAfterColon = cleanItem.replace(/^.*?:/, '').trim();
            if (contentAfterColon) {
              points = [contentAfterColon];
            }
          }
          
          if (points.length > 0) {
            actionItems.push({ title, points });
          }
        });
      }
    });
  }
  
  return actionItems;
}


function generateQASection(data: ScoreCardData, options: GenerationOptions): string {
  if (!options.includeQA || !data.QuestionAnswerHistory || data.QuestionAnswerHistory.length === 0) {
    return '';
  }

  console.log('UNIFIED_HTML: Including Q&A section with', data.QuestionAnswerHistory.length, 'items');
  
  // Group questions by phase
  const groupedQA: Record<string, AnswerHistoryEntry[]> = {};
  data.QuestionAnswerHistory.forEach((qa: AnswerHistoryEntry) => {
    const phase = qa.phaseName || 'General Assessment';
    if (!groupedQA[phase]) {
      groupedQA[phase] = [];
    }
    groupedQA[phase].push(qa);
  });

  let qaSection = `
    <div class="card qa-card content-card">
      <div class="card-header">
        <div class="card-icon">❓</div>
        <h3 class="card-title">Assessment Questions & Responses</h3>
      </div>
      <p>Below are the questions from your assessment and your responses:</p>
  `;

  Object.entries(groupedQA).forEach(([phase, questions]) => {
    qaSection += `<div class="phase-header">${phase}</div>`;
    
    questions.forEach((qa, index) => {
      qaSection += `
        <div class="qa-item">
          <div class="question">Q${index + 1}: ${qa.question}</div>
          <div class="answer">${typeof qa.answer === 'string' ? qa.answer : JSON.stringify(qa.answer)}</div>
        </div>
      `;
    });
  });

  qaSection += '</div>';
  return qaSection;
}


function generateFooterSection(data: ScoreCardData): string {
  const realUserName = data.UserInformation?.UserName && data.UserInformation.UserName !== 'User' 
    ? data.UserInformation.UserName 
    : 'User';
  
  return `
    <div class="footer">
      <img src="/footer-logo.svg" alt="Social Garden" class="logo" />
      <div class="brand-info">Social Garden AI Efficiency Scorecard</div>
      <p>Confidential Report for ${realUserName} | Generated on ${new Date().toLocaleDateString()}</p>
      ${data.ScoreInformation?.ReportID ? `<p>Report ID: ${data.ScoreInformation.ReportID}</p>` : ''}
    </div>
  `;
}


/**
 * Legacy compatibility function for existing generators
 */
export async function generateScorecardHTML(
  data: any,
  options: GenerationOptions = {}
): Promise<string> {
  console.log('UNIFIED_HTML: Legacy generateScorecardHTML called, converting to unified format');
  
  // Convert legacy data format to unified format
  const convertedData: ScoreCardData = {
    UserInformation: {
      UserName: data.UserInformation?.UserName || data.userName || data.name || 'N/A',
      CompanyName: data.UserInformation?.CompanyName || data.companyName || data.company || 'N/A',
      Industry: data.UserInformation?.Industry || data.industry || 'N/A',
      Email: data.UserInformation?.Email || data.email || data.userEmail || 'N/A'
    },
    ScoreInformation: {
      AITier: data.ScoreInformation?.AITier || data.tier || data.aiTier || 'N/A',
      FinalScore: data.ScoreInformation?.FinalScore ?? data.score ?? data.finalScore ?? null,
      ReportID: data.ScoreInformation?.ReportID || data.reportId || data.id || 'N/A'
    },
    QuestionAnswerHistory: data.QuestionAnswerHistory || data.questionAnswerHistory || data.answers || [],
    FullReportMarkdown: data.FullReportMarkdown || data.reportMarkdown || data.markdown || ''
  };

  const result = generateHTMLPreview(convertedData, options);
  
  if (result.success && result.html) {
    return result.html;
  } else {
    throw new Error(result.error || 'HTML generation failed');
  }
}
