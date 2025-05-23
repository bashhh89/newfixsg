/**
 * HTML Generator for AI Efficiency Scorecard (WeasyPrint Version)
 * Simplified approach that builds the HTML template block by block
 */

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
 * Process markdown to extract strategic action plan items
 */
function extractStrategicPlan(markdownContent: string): string[] {
  if (!markdownContent) {
    console.log('No markdown content provided to extractStrategicPlan');
    return [];
  }
  
  console.log('Extracting strategic plan from markdown content...');
  
  // Find the strategic plan section
  const strategicPlanRegex = /## Strategic Action Plan\s*([\s\S]*?)(?=##|$)/i;
  const match = markdownContent.match(strategicPlanRegex);
  
  if (!match || !match[1]) {
    console.log('No Strategic Action Plan section found');
    return [];
  }
  
  const planContent = match[1].trim();
  console.log('Found Strategic Action Plan section with content length:', planContent.length);
  
  // Split the content by numbered items (1., 2., etc.)
  const items: string[] = [];
  const lines = planContent.split('\n');
  
  let currentItem = '';
  let collectingItem = false;
  
  for (const line of lines) {
    // Check if this line starts a new numbered item
    if (/^\d+\./.test(line.trim())) {
      // If we were collecting a previous item, save it
      if (collectingItem && currentItem.trim()) {
        items.push(currentItem.trim());
      }
      
      // Start collecting a new item
      currentItem = line.trim();
      collectingItem = true;
    } 
    // If we're collecting an item and this is a continuation line
    else if (collectingItem && line.trim()) {
      currentItem += ' ' + line.trim();
    }
  }
  
  // Don't forget to add the last item
  if (collectingItem && currentItem.trim()) {
    items.push(currentItem.trim());
  }
  
  console.log(`Found ${items.length} strategic plan items`);
  
  // Format the items for better display
  return items.map(item => {
    // Try to extract the title if it's in bold format: "1. **Title:** Description"
    const boldTitleMatch = item.match(/^\d+\.\s+\*\*([^:]+):\*\*\s*(.*)/);
    if (boldTitleMatch) {
      return `<strong>${boldTitleMatch[1]}</strong>: ${boldTitleMatch[2]}`;
    }
    
    // Try to extract the title if it's in regular format: "1. Title: Description"
    const regularTitleMatch = item.match(/^\d+\.\s+([^:]+):\s*(.*)/);
    if (regularTitleMatch) {
      return `<strong>${regularTitleMatch[1]}</strong>: ${regularTitleMatch[2]}`;
    }
    
    // Otherwise just return the item as is
    return item;
  });
}

/**
 * Extract strengths from markdown content
 */
function extractStrengths(markdownContent: string): string[] {
  const strengths: string[] = [];
  
  // Look for "Your Strengths" heading followed by a list (handles both • and - bullet points and variations in spacing)
  const strengthsMatch = markdownContent.match(/Your Strengths\s*[\r\n]+([\s\S]*?)(?=Focus Areas|##|$)/i);
  if (strengthsMatch && strengthsMatch[1]) {
    const strengthContent = strengthsMatch[1].trim();
    // Extract bullet points (handles both • and - and leading/trailing whitespace)
    const bulletPoints = strengthContent.split(/[\r\n]+/).filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'));
    return bulletPoints.map(point => renderMarkdown(point.trim().replace(/^[•-]\s*/, '').trim()));
  }

  // Fallback to previous logic if new pattern not found
  const keyFindingsMatch = markdownContent.match(/## Key Findings([\s\S]*?)(?=##|$)/i);
  if (keyFindingsMatch) {
    const strengthsMatchFallback = keyFindingsMatch[1].match(/\*\*Strengths:\*\*([\s\S]*?)(?=\*\*Weaknesses|$)/i);
    if (strengthsMatchFallback) {
      const strengthContent = strengthsMatchFallback[1].trim();
      const bulletPoints = strengthContent.split('\n').filter(line => line.trim().startsWith('-'));
      return bulletPoints.map(point => point.replace(/^-\s*/, '').trim());
    }
  }
  
  return strengths;
}

/**
 * Extract weaknesses (Focus Areas) from markdown content
 */
function extractWeaknesses(markdownContent: string): string[] {
  const weaknesses: string[] = [];
  
  // Look for "Focus Areas" heading followed by a list (handles both • and - bullet points and variations in spacing)
  const focusAreasMatch = markdownContent.match(/Focus Areas\s*[\r\n]+([\s\S]*?)(?=Next Steps|##|$)/i);
   if (focusAreasMatch && focusAreasMatch[1]) {
    const focusAreasContent = focusAreasMatch[1].trim();
    // Extract bullet points (handles both • and - and leading/trailing whitespace)
    const bulletPoints = focusAreasContent.split(/[\r\n]+/).filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'));
    return bulletPoints.map(point => renderMarkdown(point.trim().replace(/^[•-]\s*/, '').trim()));
  }

  // Fallback to previous logic if new pattern not found
  const keyFindingsMatch = markdownContent.match(/## Key Findings([\s\S]*?)(?=##|$)/i);
  if (keyFindingsMatch) {
    const weaknessesMatchFallback = keyFindingsMatch[1].match(/\*\*Weaknesses:\*\*([\s\S]*?)(?=##|$)/i);
    if (weaknessesMatchFallback) {
      const weaknessContent = weaknessesMatchFallback[1].trim();
      const bulletPoints = weaknessContent.split('\n').filter(line => line.trim().startsWith('-'));
      return bulletPoints.map(point => point.replace(/^-\s*/, '').trim());
    }
  }
  
  return weaknesses;
}

/**
 * Format answers based on answerType
 */
function formatAnswer(item: AnswerHistoryEntry): string {
  if (!item.answer) return '';
  
  if (item.answerType === 'scale' && !isNaN(Number(item.answer))) {
    return `<span class="scale-value">${item.answer}</span>`;
  }
  
  if (item.answerType === 'checkbox' || item.answerType === 'radio') {
    if (typeof item.answer === 'string' && item.answer.includes('|')) {
      return item.answer.split('|').map(a => a.trim()).join(', ');
    }
  }
  
  return item.answer;
}

/**
 * Group questions and answers by phase
 */
function groupByPhase(questionAnswerHistory: AnswerHistoryEntry[]): Record<string, AnswerHistoryEntry[]> {
  const grouped: Record<string, AnswerHistoryEntry[]> = {};
  
  questionAnswerHistory.forEach((item, index) => {
    const phase = item.phaseName || 'Uncategorized';
    if (!grouped[phase]) {
      grouped[phase] = [];
    }
    grouped[phase].push({...item, index});
  });
  
  return grouped;
}

/**
 * Helper function to get tier description
 */
const getTierDescription = (tier: string | null): string => {
  if (!tier) return "";
  
  switch(tier.toLowerCase()) {
    case 'leader':
      return "This means your organization has developed mature AI capabilities, with well-established processes for developing, deploying, and managing AI solutions. You have a strong foundation of data infrastructure, AI talent, governance frameworks, and strategic alignment.";
    case 'enabler':
      return "This means your organization has begun to develop significant AI capabilities with some successful implementations. You have established basic data infrastructure and are working toward more systematized approaches to AI development and deployment.";
    case 'dabbler':
      return "This means your organization is in the early stages of AI adoption, with limited formal processes and capabilities. You may have experimented with some AI applications but lack a comprehensive strategy and infrastructure for AI implementation.";
    default:
      return "Your assessment results indicate you're at an early stage of AI adoption. The recommendations in this report will help you establish a solid foundation for AI implementation.";
  }
};

/**
 * Basic Markdown to HTML converter
 */
function renderMarkdown(markdown: string): string {
  if (!markdown) return '';

  // Basic replacements for common markdown elements
  let html = markdown
    // Replace bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Replace italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>');

  // Handle headings (H1 to H6) - process from smallest to largest to avoid issues
  for (let i = 6; i >= 1; i--) {
    const regex = new RegExp(`^#{${i}}\\s+(.*)$`, 'gm');
    html = html.replace(regex, `<h${i}>$1</h${i}>`);
  }

  // Completely rewritten list handling to properly process lists and paragraphs
  const lines = html.split('\n');
  let processedLines = [];
  let inList = false;
  let listType = '';
  let listContent = '';
  let inParagraph = false;
  let paragraphContent = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      if (inParagraph) {
        // End current paragraph
        processedLines.push(`<p>${paragraphContent}</p>`);
        inParagraph = false;
        paragraphContent = '';
      }
      continue;
    }

    // Check if line is a heading
    if (line.match(/^<h[1-6]>.*<\/h[1-6]>$/)) {
      // Close any open paragraph
      if (inParagraph) {
        processedLines.push(`<p>${paragraphContent}</p>`);
        inParagraph = false;
        paragraphContent = '';
      }
      
      // Close any open list
      if (inList) {
        processedLines.push(`</${listType}>`);
        inList = false;
      }
      
      // Add the heading
      processedLines.push(line);
      continue;
    }

    // Check if line is a list item
    const isUnorderedListItem = line.startsWith('- ') || line.startsWith('* ') || line.startsWith('+ ');
    const isOrderedListItem = /^\d+\.\s/.test(line);
    
    if (isUnorderedListItem || isOrderedListItem) {
      // Close any open paragraph
      if (inParagraph) {
        processedLines.push(`<p>${paragraphContent}</p>`);
        inParagraph = false;
        paragraphContent = '';
      }
      
      const newListType = isUnorderedListItem ? 'ul' : 'ol';
      
      // If we're changing list types or starting a new list
      if (!inList || listType !== newListType) {
        if (inList) {
          processedLines.push(`</${listType}>`);
        }
        processedLines.push(`<${newListType}>`);
        inList = true;
        listType = newListType;
      }
      
      // Extract the content after the list marker
      const content = isUnorderedListItem 
        ? line.replace(/^[*+-]\s+/, '') 
        : line.replace(/^\d+\.\s+/, '');
      
      processedLines.push(`<li>${content}</li>`);
    } else {
      // Close any open list
      if (inList) {
        processedLines.push(`</${listType}>`);
        inList = false;
      }
      
      // Handle regular paragraph content
      if (!inParagraph) {
        inParagraph = true;
        paragraphContent = line;
      } else {
        paragraphContent += ' ' + line;
      }
    }
  }
  
  // Close any open elements at the end
  if (inParagraph) {
    processedLines.push(`<p>${paragraphContent}</p>`);
  }
  
  if (inList) {
    processedLines.push(`</${listType}>`);
  }

  return processedLines.join('\n');
}

/**
 * Generate the complete HTML for the scorecard PDF
 */
export async function generateScorecardHTML(data: ScorecardData): Promise<string> {
  const { UserInformation, ScoreInformation, FullReportMarkdown } = data;

  // Define brand colors
  const colors = {
    brightGreen: '#20E28F',
    darkGreen: '#28a745',
    darkTeal: '#103138',
    white: '#FFFFFF',
    lightMint: '#F3FDF5',
    lightGrey: '#f8f9fa',
    borderGrey: '#dee2e6',
    textDark: '#343a40',
    textMuted: '#6c757d',
    textBody: '#495057',
    cardBorder: '#e9ecef',
    scoreBg: '#f1f3f5'
  };

  // Remove the "Strategic Action Plan" section from the markdown for the details section
  const strategicPlanRegex = /## Strategic Action Plan\s*([\s\S]*?)(?=##|$)/i;
  const markdownForDetails = FullReportMarkdown.replace(strategicPlanRegex, '').trim();

  // Extract strengths and weaknesses (used for Focus Areas) from markdown
  const strengths = extractStrengths(FullReportMarkdown);
  const weaknesses = extractWeaknesses(FullReportMarkdown); // Using weaknesses for Focus Areas as per user feedback example

  // Determine tier description
  const tierDescription = getTierDescription(ScoreInformation.AITier);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Efficiency Scorecard - ${UserInformation.UserName}</title>
  <style>
    @font-face {
      font-family: 'Inter';
      src: url('/public/fonts/Inter-Regular.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }

    @font-face {
      font-family: 'Inter';
      src: url('/public/fonts/Inter-Bold.ttf') format('truetype');
      font-weight: bold;
      font-style: normal;
    }

    @page {
      size: A4;
      margin: 1.5cm;
      @bottom-center {
        content: "AI Efficiency Scorecard | Page " counter(page) " of " counter(pages);
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: ${colors.textDark};
        padding-top: 0.5cm;
        border-top: 1pt solid ${colors.lightMint};
      }
    }

    body {
      font-family: 'Inter', sans-serif;
      line-height: 1.6;
      font-size: 10pt;
      color: ${colors.textBody};
      background-color: #f8f8f8;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 21cm;
      margin: 0 auto;
      background-color: ${colors.white};
      padding: 2cm;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    /* Global Typography - Enhanced for better hierarchy */
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Inter', sans-serif;
      color: ${colors.textDark};
      font-weight: bold;
      line-height: 1.3;
      margin-top: 1.5em;
      margin-bottom: 0.8em;
      page-break-after: avoid;
    }

    h1 {
      font-size: 28px;
      margin-top: 0;
      margin-bottom: 8px;
      line-height: 1.2;
      color: ${colors.textDark};
      border-bottom: none;
      padding-bottom: 0;
    }

    h2 {
      font-size: 22px;
      font-weight: 600;
      color: ${colors.textDark};
      margin-top: 30px;
      margin-bottom: 15px;
      padding-bottom: 5px;
      border-bottom: 2px solid ${colors.darkGreen};
    }

    h3 {
      font-size: 16pt;
      margin-top: 1.5em;
      margin-bottom: 0.8em;
      color: ${colors.textDark};
    }

    h4 {
      font-size: 14pt;
      color: ${colors.textDark};
      margin-top: 15px;
      margin-bottom: 8px;
    }

    h5 {
      font-size: 12pt;
      color: ${colors.textDark};
      margin-top: 15px;
      margin-bottom: 8px;
    }

    h6 {
      font-size: 11pt;
      color: ${colors.textDark};
      margin-top: 0.8em;
      margin-bottom: 0.5em;
    }

    p {
      margin-bottom: 1em;
      line-height: 1.6;
      font-family: 'Inter', sans-serif;
    }

    strong {
      font-weight: bold;
    }

    em {
      font-style: italic;
    }

    /* Standardized Card Style */
    .card {
      background-color: ${colors.white};
      border: 1px solid ${colors.cardBorder};
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
      padding: 20px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }

    .card-accent {
      border-left: 5px solid ${colors.darkGreen};
    }

    .card h3, .card h4 {
      margin-top: 0;
      border-bottom: 1px solid ${colors.lightMint};
      padding-bottom: 10px;
      margin-bottom: 15px;
    }

    /* List Styles - Fixed to prevent empty boxes */
    ul, ol {
      margin-bottom: 1em;
      padding-left: 20px;
    }

    li {
      margin-bottom: 8px;
      line-height: 1.6;
      font-family: 'Inter', sans-serif;
      color: ${colors.textBody};
    }

    ul li {
      position: relative;
      padding-left: 1em;
      list-style-type: none;
    }

    ul li::before {
      content: '•';
      color: ${colors.darkGreen};
      font-weight: bold;
      position: absolute;
      left: 0;
    }

    ol li {
      list-style-position: outside;
      padding-left: 0.5em;
    }

    /* Header */
    .main-header {
      background-color: ${colors.lightGrey};
      border: 1px solid ${colors.borderGrey};
      border-left: 5px solid ${colors.darkGreen};
      padding: 20px;
      margin-bottom: 30px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
      text-align: center;
    }

    .main-header p {
      font-size: 16px;
      color: ${colors.textMuted};
      margin-top: 0.5em;
      line-height: 1.6;
    }

    /* Client Info Section */
    .info-section {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 2em;
      padding: 0;
      background-color: transparent;
      border: none;
      box-shadow: none;
    }

    .info-card {
      flex: 1;
      border: 1px solid ${colors.cardBorder};
      border-radius: 8px;
      padding: 20px;
      background-color: ${colors.white};
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
    }

    .info-card h3 {
      margin-top: 0;
      color: ${colors.textDark};
      border-bottom: 1px solid ${colors.lightMint};
      padding-bottom: 10px;
      margin-bottom: 15px;
      font-size: 15pt;
    }

    .info-card p {
      margin-bottom: 0.8em;
      line-height: 1.6;
    }

    .info-card p strong {
      display: inline-block;
      min-width: 100px;
      margin-right: 10px;
    }

    /* Overall Tier Card Container */
    .tier-card-container {
      margin-bottom: 2em;
      padding: 25px;
      background-color: ${colors.white};
      border: 1px solid ${colors.cardBorder};
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
      page-break-inside: avoid;
      text-align: center;
    }

    .tier-card-container h3 {
      margin-top: 0;
      margin-bottom: 15px;
      border-bottom: none;
      padding-bottom: 0;
    }

    /* Overall Tier Section */
    .overall-tier-section {
      margin-bottom: 0;
      padding: 0;
      background-color: transparent;
      border: none;
      box-shadow: none;
      page-break-inside: auto;
    }

    .overall-tier-section .tier-value {
      font-size: 30pt;
      font-weight: bold;
      color: ${colors.darkGreen};
      margin: 10px 0;
      padding: 8px;
      background-color: ${colors.lightMint};
      border-radius: 6px;
      display: inline-block;
      min-width: 180px;
    }

    .overall-tier-section .tier-label {
      font-size: 10pt;
      color: ${colors.textDark};
      margin-top: 8px;
      font-weight: 600;
    }

    /* Assessment Results Section */
    .assessment-results-section {
      margin-bottom: 2em;
      padding: 25px;
      background-color: ${colors.white};
      border: 1px solid ${colors.cardBorder};
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
      page-break-inside: avoid;
    }

    .assessment-results-section h3 {
      margin-top: 0;
      color: ${colors.textDark};
      font-size: 16pt;
      margin-bottom: 15px;
      border-bottom: 1px solid ${colors.lightMint};
      padding-bottom: 8px;
    }

    .assessment-results-section .intro-text {
      margin-bottom: 20px;
      line-height: 1.6;
      font-size: 10pt;
      color: ${colors.textDark};
      padding: 20px;
      background-color: ${colors.white};
      border-radius: 8px;
      border: 1px solid ${colors.cardBorder};
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
      font-style: normal;
      page-break-inside: avoid;
    }

    .assessment-results-section .findings-container {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-top: 1.5em;
    }

    .assessment-results-section .strengths-section,
    .assessment-results-section .focus-areas-section {
      flex: 1;
      padding: 15px;
      border-radius: 8px;
      background-color: ${colors.white};
      border: 1px solid ${colors.cardBorder};
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
    }

    .assessment-results-section .strengths-section h4,
    .assessment-results-section .focus-areas-section h4 {
      color: ${colors.textDark};
      font-size: 12pt;
      margin-top: 0;
      margin-bottom: 10px;
      font-weight: bold;
      text-align: center;
      padding-bottom: 8px;
      border-bottom: 1px solid ${colors.lightMint};
    }

    .assessment-results-section ul {
      padding-left: 20px;
      margin: 0;
    }

    .assessment-results-section li {
      margin-bottom: 8px;
      line-height: 1.6;
      font-family: 'Inter', sans-serif;
      color: ${colors.textBody};
      position: relative;
      padding-left: 1em;
      list-style-type: none;
    }

    .assessment-results-section li::before {
      content: '•';
      color: ${colors.darkGreen};
      font-weight: bold;
      position: absolute;
      left: 0;
    }

    .assessment-results-section .next-steps-summary {
      margin-top: 20px;
      padding: 12px 15px;
      background-color: ${colors.lightMint};
      border-radius: 6px;
      border-left: 4px solid ${colors.darkGreen};
      font-style: italic;
      color: ${colors.textDark};
      font-size: 10pt;
    }

    /* Strategic Action Plan Section */
    .action-plan-section {
      margin-bottom: 2em;
      padding: 25px;
      background-color: ${colors.white};
      border: 1px solid ${colors.cardBorder};
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
      page-break-inside: avoid;
    }

    .action-plan-section h3 {
      margin-top: 0;
      color: ${colors.textDark};
      font-size: 16pt;
      margin-bottom: 15px;
      border-bottom: 1px solid ${colors.lightMint};
      padding-bottom: 8px;
    }

    .section-intro {
      margin-bottom: 15px;
      line-height: 1.6;
      color: ${colors.textDark};
      font-size: 10pt;
    }

    .action-plan-list {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }

    .action-item {
      margin-bottom: 12px;
      padding: 12px;
      background-color: ${colors.lightMint};
      border-radius: 6px;
      border-left: 4px solid ${colors.darkGreen};
      display: flex;
      align-items: flex-start;
    }

    .action-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background-color: ${colors.darkGreen};
      color: ${colors.white};
      border-radius: 50%;
      font-weight: bold;
      font-size: 10pt;
      margin-right: 10px;
      flex-shrink: 0;
    }

    .action-text {
      flex: 1;
      line-height: 1.5;
      font-size: 10pt;
    }

    .empty-plan-message {
      padding: 15px;
      background-color: ${colors.lightMint};
      border-radius: 6px;
      border-left: 4px solid ${colors.darkGreen};
      margin: 15px 0;
      font-size: 10pt;
    }

    .empty-plan-message p {
      margin: 0;
      color: ${colors.textDark};
      font-style: italic;
    }

    /* Footer */
    .footer {
      text-align: center;
      margin-top: 2em;
      padding-top: 1em;
      border-top: 1px solid ${colors.lightMint};
      font-size: 8pt;
      color: ${colors.textDark};
      font-family: 'Inter', sans-serif;
    }

    /* Assessment Q&A Section Styling */
    .qa-section {
      margin-bottom: 2em;
      padding: 25px;
      background-color: ${colors.white};
      border: 1px solid ${colors.cardBorder};
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
      page-break-inside: avoid;
      font-family: 'Inter', sans-serif;
    }

    /* Fixed styling for content blocks within the main markdown section */
    .full-report-markdown-section {
      margin-bottom: 2em;
      padding: 25px;
      background-color: ${colors.white};
      border: 1px solid ${colors.cardBorder};
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
      page-break-inside: avoid;
    }

    .full-report-markdown-section h2 {
      margin-top: 0;
      color: ${colors.textDark};
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 15px;
      padding-bottom: 5px;
      border-bottom: 2px solid ${colors.darkGreen};
    }

    .markdown-content {
      margin-bottom: 1.5em;
    }

    .markdown-content h2,
    .markdown-content h3 {
      font-size: 18px;
      font-weight: 600;
      color: ${colors.textDark};
      margin-top: 25px;
      margin-bottom: 12px;
      padding-bottom: 5px;
      border-bottom: 1px solid ${colors.lightMint};
    }

    .markdown-content h4,
    .markdown-content h5,
    .markdown-content h6 {
      margin-top: 15px;
      margin-bottom: 8px;
      color: ${colors.textDark};
      font-weight: 600;
    }

    .markdown-content p {
      margin-bottom: 1em;
      line-height: 1.6;
      font-size: 10pt;
      color: ${colors.textBody};
    }

    .markdown-content ul,
    .markdown-content ol {
      margin-bottom: 1em;
      padding-left: 20px;
    }

    .markdown-content ul li {
      position: relative;
      padding-left: 1em;
      list-style-type: none;
      margin-bottom: 8px;
      line-height: 1.6;
    }

    .markdown-content ul li::before {
      content: '•';
      color: ${colors.darkGreen};
      font-weight: bold;
      position: absolute;
      left: 0;
    }

    .markdown-content ol li {
      list-style-position: outside;
      margin-bottom: 8px;
      line-height: 1.6;
      padding-left: 0.5em;
    }

    /* Final Score Styling - Make it stand out */
    .final-score {
      background-color: ${colors.scoreBg};
      padding: 8px 12px;
      border-radius: 4px;
      font-weight: bold;
      display: inline-block;
      margin-top: 5px;
      margin-bottom: 15px;
      color: ${colors.textDark};
    }

    /* Key Findings section styling */
    .key-findings-section {
      background-color: ${colors.white};
      border: 1px solid ${colors.cardBorder};
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
      margin-bottom: 20px;
    }

    .key-findings-section h3 {
      color: ${colors.textDark};
      margin-top: 0;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid ${colors.lightMint};
    }

    .key-findings-section h4 {
      color: ${colors.textDark};
      margin-top: 15px;
      margin-bottom: 8px;
      font-weight: bold;
    }

    .qa-section h2 {
      margin-top: 0;
      color: ${colors.textDark};
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 15px;
      padding-bottom: 5px;
      border-bottom: 2px solid ${colors.darkGreen};
    }

    .qa-phase h3 {
      color: ${colors.textDark};
      font-size: 14pt;
      margin-top: 1.5em;
      margin-bottom: 0.8em;
      border-bottom: 1px solid ${colors.lightMint};
      padding-bottom: 5px;
    }

    .qa-item {
      margin-bottom: 1em;
      padding: 12px;
      background-color: ${colors.lightMint};
      border-radius: 6px;
      border-left: 4px solid ${colors.darkGreen};
      line-height: 1.6;
      font-size: 10pt;
    }

    .qa-item p {
      margin: 0;
      line-height: 1.6;
    }

    .qa-item .question {
      font-weight: bold;
      color: ${colors.textDark};
      margin-bottom: 0.4em;
    }

    .qa-item .answer {
      color: ${colors.textDark};
    }

    /* Print-Specific Styles */
    @media print {
      body {
        margin: 0;
        padding: 0;
      }

      .no-break {
        page-break-inside: avoid !important;
      }

      h1, h2, h3, h4 {
        page-break-after: avoid;
        page-break-inside: avoid;
      }

      p {
        orphans: 3;
        widows: 3;
      }
    }
  </style>
</head>
<body>
  <div class="container">
  <!-- Header -->
  <div class="main-header">
    <h1>AI Efficiency Scorecard</h1>
    <p>A comprehensive assessment of AI effectiveness and strategic opportunities</p>
  </div>
  
  <!-- Client Information -->
  <div class="info-section">
    <div class="info-card">
      <h3>Client Information</h3>
      <p><strong>Name:</strong> ${UserInformation.UserName}</p>
      <p><strong>Company:</strong> ${UserInformation.CompanyName}</p>
      <p><strong>Industry:</strong> ${UserInformation.Industry}</p>
      <p><strong>Email:</strong> ${UserInformation.Email}</p>
    </div>
    
    <div class="info-card">
      <h3>Overall Assessment</h3>
      ${ScoreInformation.FinalScore !== null ? `<p><strong>Final Score:</strong> ${ScoreInformation.FinalScore}/100</p>` : ''}
      <p><strong>Report ID:</strong> ${ScoreInformation.ReportID}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
  </div>

  <!-- Overall Tier Section -->
  <div class="tier-card-container">
    <h3>Your AI Maturity Tier</h3>
    <div class="overall-tier-section">
      <div class="tier-value">${ScoreInformation.AITier}</div>
      <div class="tier-label">Overall Assessment Result</div>
    </div>
  </div>

  <!-- Assessment Results Section -->
  <div class="assessment-results-section">
    <h3>Your Assessment Results</h3>
    <div class="intro-text">
      ${UserInformation.UserName}, your organization is at the <strong>${ScoreInformation.AITier}</strong> tier of AI maturity. ${tierDescription}
    </div>

    <div class="findings-container">
      <div class="strengths-section">
        <h4>Your Strengths</h4>
        ${strengths.length > 0 ? `<ul>
          ${strengths.map(strength => `<li>${strength}</li>`).join('\n')}
        </ul>` : '<p>No specific strengths were identified in the assessment.</p>'}
      </div>
      
      <div class="focus-areas-section">
        <h4>Focus Areas</h4>
        ${weaknesses.length > 0 ? `<ul>
          ${weaknesses.map(weakness => `<li>${weakness}</li>`).join('\n')}
        </ul>` : '<p>No specific focus areas were identified in the assessment.</p>'}
      </div>
    </div>

    <div class="next-steps-summary">
      <p>
        Explore your detailed results and recommendations in the sections of this report. We've created a personalized action plan to help advance your AI maturity.
      </p>
    </div>
  </div>

  <!-- Full Report Markdown Section -->
  <div class="full-report-markdown-section">
    <h2>Full Report Details</h2>
    <p class="section-intro">
      Below is the complete content of your AI Efficiency Scorecard report:
    </p>
    <div class="markdown-content">
      ${renderMarkdown(markdownForDetails)
        .replace(/## Final Score: \d+\/100/, match => `<div class="final-score">${match}</div>`)
        .replace(/## Key Findings([\s\S]*?)(?=##|$)/g, match => `<div class="key-findings-section"><h3>Key Findings</h3>${match.replace(/## Key Findings/, '')}</div>`)
        .replace(/### Your Strengths/g, '<h4>Your Strengths</h4>')
        .replace(/### Focus Areas/g, '<h4>Focus Areas</h4>')
        .replace(/### (Sample AI Goal-Setting Meeting Agenda|Example Prompts for Your Team|Illustrative Benchmarks|Personalized AI Learning Path)/g, match => `<div class="key-findings-section"><h3>${match.replace(/### /, '')}</h3>`)
        .replace(/### ([^#]+?)(?=###|##|$)/g, match => `${match}</div>`)
      }
    </div>
  </div>

  <!-- Strategic Action Plan Section -->
  <div class="action-plan-section">
    <h2>Strategic Action Plan</h2>
    <p class="section-intro">
      Based on your assessment results, we recommend the following strategic actions to improve your AI maturity:
    </p>
    
    <!-- Dynamic Strategic Action Plan -->
    ${extractStrategicPlan(FullReportMarkdown).length > 0 ? `
    <ul class="action-plan-list">
      ${extractStrategicPlan(FullReportMarkdown).map((action, index) => `
        <li class="action-item">
          <span class="action-number">${index + 1}</span>
          <span class="action-text">${action}</span>
        </li>
      `).join('\n')}
    </ul>` : `
    <div class="empty-plan-message">
      <p>No strategic action plan items were found in the report markdown.</p>
    </div>`}
  </div>

  <!-- Assessment Q&A Section -->
  <div class="qa-section">
    <h2>Assessment Q&A</h2>
    <p class="section-intro">
      Here are the questions you were asked and your responses during the AI Efficiency Scorecard assessment:
    </p>
    ${Object.entries(groupByPhase(data.QuestionAnswerHistory)).length > 0 ? 
      Object.entries(groupByPhase(data.QuestionAnswerHistory)).map(([phase, questions]) => `
      <div class="qa-phase">
        <h3>${phase}</h3>
        ${questions.map(item => `
          <div class="qa-item">
            <p class="question"><strong>Q:</strong> ${item.question}</p>
            <p class="answer"><strong>A:</strong> ${formatAnswer(item)}</p>
          </div>
        `).join('\n')}
      </div>
    `).join('\n') : `
    <div class="empty-plan-message">
      <p>No question and answer history available for this report.</p>
    </div>`}
  </div>
  
  <!-- Footer -->
  <div class="footer">
    <p>AI Efficiency Scorecard | Generated for ${UserInformation.UserName} at ${UserInformation.CompanyName}</p>
    <p>© ${new Date().getFullYear()} - All Rights Reserved</p>
  </div>
  </div> <!-- Close container -->
</body>
</html>`;
}
