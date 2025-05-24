/**
 * HTML Generator for AI Efficiency Scorecard (V6)
 * Updated to use the unified PDF generation system
 */

import { generateScorecardPDF, generateHTMLPreview, ScoreCardData } from '../../../lib/pdf-generation';

// Legacy interface for backward compatibility
interface AnswerHistoryEntry {
  question: string;
  answer: string;
  phaseName?: string;
  reasoningText?: string;
  answerType?: string;
  options?: string[] | null;
  index?: number;
  answerSource?: string;
}

interface ScoreCardData_Legacy {
  UserInformation: {
    Industry: string;
    UserName: string;
    CompanyName: string;
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
 * Convert legacy ScoreCardData to new ScoreCardData format
 */
function convertToNewFormat(data: ScoreCardData_Legacy): ScoreCardData {
  return {
    UserInformation: data.UserInformation,
    ScoreInformation: data.ScoreInformation,
    QuestionAnswerHistory: data.QuestionAnswerHistory.map(item => ({
      question: item.question,
      answer: item.answer,
      phaseName: item.phaseName,
      reasoningText: item.reasoningText,
      answerType: item.answerType,
      options: item.options || undefined,
      index: item.index,
      answerSource: item.answerSource
    })),
    FullReportMarkdown: data.FullReportMarkdown
  };
}

/**
 * Main function to generate HTML from ScoreCardData using the unified system
 */
async function generateScorecardHTML(reportData: ScoreCardData_Legacy): Promise<string> {
  console.log('V6_HTML_GENERATOR: Converting to new format and generating HTML');
  
  try {
    // Validate the input data
    if (!reportData) {
      throw new Error('Report data is required');
    }

    // Convert to new format
    const convertedData = convertToNewFormat(reportData);
    
    // Use the new unified HTML preview generator
    const result = generateHTMLPreview(convertedData, {
      includeQA: true,
      includeDetailedAnalysis: true,
      style: 'standard'
    });
    
    if (result.success && result.html) {
      console.log('V6_HTML_GENERATOR: HTML generation successful');
      if (result.warnings && result.warnings.length > 0) {
        console.warn('V6_HTML_GENERATOR: Warnings:', result.warnings);
      }
      return result.html;
    } else {
      console.error('V6_HTML_GENERATOR: HTML generation failed:', result.error);
      throw new Error(result.error || 'Failed to generate HTML');
    }
  } catch (error: any) {
    console.error('V6_HTML_GENERATOR: Unexpected error:', error);
    
    // Return a simple error HTML page
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error Generating Report</title>
  <style>
    body { font-family: sans-serif; color: #333; margin: 20px; }
    h1 { color: red; }
  </style>
</head>
<body>
  <h1>Error Generating Report</h1>
  <p>An error occurred while generating the HTML report. Please try again later or contact support.</p>
  <p>Details: ${error.message}</p>
</body>
</html>`;
  }
}

/**
 * Generate PDF using the unified system (new function)
 */
export async function generateScorecardPDFBuffer(
  data: ScoreCardData_Legacy,
  options: {
    includeQA?: boolean;
    includeDetailedAnalysis?: boolean;
    style?: 'standard' | 'presentation';
  } = {}
): Promise<{
  success: boolean;
  pdfBuffer?: ArrayBuffer;
  filename?: string;
  error?: string;
  warnings?: string[];
}> {
  console.log('V6_HTML_GENERATOR: Generating PDF using unified system');
  
  try {
    // Convert to new format
    const convertedData = convertToNewFormat(data);
    
    // Use the new unified PDF generator
    const result = await generateScorecardPDF(convertedData, {
      includeQA: options.includeQA ?? true,
      includeDetailedAnalysis: options.includeDetailedAnalysis ?? true,
      style: options.style ?? 'standard'
    });
    
    if (result.success) {
      console.log('V6_HTML_GENERATOR: PDF generation successful');
      return {
        success: true,
        pdfBuffer: result.pdfBuffer,
        filename: result.filename,
        warnings: result.warnings
      };
    } else {
      console.error('V6_HTML_GENERATOR: PDF generation failed:', result.error);
      return {
        success: false,
        error: result.error,
        warnings: result.warnings
      };
    }
  } catch (error: any) {
    console.error('V6_HTML_GENERATOR: Unexpected error:', error);
    return {
      success: false,
      error: `PDF generation failed: ${error.message}`
    };
  }
}

// Legacy functions for backward compatibility (deprecated)
export function parseMarkdown(markdown: string): string {
  console.warn('V6_HTML_GENERATOR: parseMarkdown is deprecated. Use unified system instead.');
  return markdown;
}

export function extractSections(markdownContent: string): Record<string, string> {
  console.warn('V6_HTML_GENERATOR: extractSections is deprecated. Use unified system instead.');
  return {};
}

export function extractDynamicSections(markdownContent: string): any[] {
  console.warn('V6_HTML_GENERATOR: extractDynamicSections is deprecated. Use unified system instead.');
  return [];
}

export function groupQuestionsByPhase(questionAnswerHistory: AnswerHistoryEntry[]): any[] {
  console.warn('V6_HTML_GENERATOR: groupQuestionsByPhase is deprecated. Use unified system instead.');
  return [];
}

// Export the main function for backward compatibility
export { generateScorecardHTML };
