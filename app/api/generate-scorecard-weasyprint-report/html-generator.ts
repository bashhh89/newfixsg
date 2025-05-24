/**
 * HTML Generator for AI Efficiency Scorecard (WeasyPrint Version)
 * Updated to use the unified PDF generation system
 */

import { generateScorecardPDF, generateHTMLPreview, ScoreCardData } from '../../../lib/pdf-generation';

// Legacy interface for backward compatibility
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
 * Convert legacy ScorecardData to new ScoreCardData format
 */
function convertToNewFormat(data: ScorecardData): ScoreCardData {
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
 * Generate the complete HTML for the scorecard PDF using the unified system
 */
export async function generateScorecardHTML(data: ScorecardData): Promise<string> {
  console.log('LEGACY_HTML_GENERATOR: Converting to new format and generating HTML');
  
  try {
    // Convert to new format
    const convertedData = convertToNewFormat(data);
    
    // Use the new unified HTML preview generator
    const result = generateHTMLPreview(convertedData, {
      includeQA: true,
      includeDetailedAnalysis: true,
      style: 'standard'
    });
    
    if (result.success && result.html) {
      console.log('LEGACY_HTML_GENERATOR: HTML generation successful');
      if (result.warnings && result.warnings.length > 0) {
        console.warn('LEGACY_HTML_GENERATOR: Warnings:', result.warnings);
      }
      return result.html;
    } else {
      console.error('LEGACY_HTML_GENERATOR: HTML generation failed:', result.error);
      throw new Error(result.error || 'Failed to generate HTML');
    }
  } catch (error: any) {
    console.error('LEGACY_HTML_GENERATOR: Unexpected error:', error);
    throw new Error(`HTML generation failed: ${error.message}`);
  }
}

/**
 * Generate PDF using the unified system (new function)
 */
export async function generateScorecardPDFBuffer(
  data: ScorecardData,
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
  console.log('LEGACY_HTML_GENERATOR: Generating PDF using unified system');
  
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
      console.log('LEGACY_HTML_GENERATOR: PDF generation successful');
      return {
        success: true,
        pdfBuffer: result.pdfBuffer,
        filename: result.filename,
        warnings: result.warnings
      };
    } else {
      console.error('LEGACY_HTML_GENERATOR: PDF generation failed:', result.error);
      return {
        success: false,
        error: result.error,
        warnings: result.warnings
      };
    }
  } catch (error: any) {
    console.error('LEGACY_HTML_GENERATOR: Unexpected error:', error);
    return {
      success: false,
      error: `PDF generation failed: ${error.message}`
    };
  }
}

// Legacy functions for backward compatibility (deprecated)
export function extractStrategicPlan(markdownContent: string): string[] {
  console.warn('LEGACY_HTML_GENERATOR: extractStrategicPlan is deprecated. Use unified system instead.');
  return [];
}

export function extractStrengths(markdownContent: string): string[] {
  console.warn('LEGACY_HTML_GENERATOR: extractStrengths is deprecated. Use unified system instead.');
  return [];
}

export function extractWeaknesses(markdownContent: string): string[] {
  console.warn('LEGACY_HTML_GENERATOR: extractWeaknesses is deprecated. Use unified system instead.');
  return [];
}
