/**
 * Unified PDF Generation System
 * Main entry point that combines all PDF generation components
 */

import { extractAllSections, parseMarkdownToHTML } from './unified-markdown-parser';
import { generateUnifiedHTML, ScoreCardData, AnswerHistoryEntry } from './unified-html-generator';

import { generatePDF, PDFOptions, PDFGenerationResult, validateHTMLContent } from './pdf-service';
import { generateFindings, insertKeyFindings } from '../findings-generator';


export interface PDFGenerationOptions {
  includeQA?: boolean;
  includeDetailedAnalysis?: boolean;
  style?: 'standard' | 'presentation';
  pdfOptions?: PDFOptions;
}

// Create a compatible interface for findings generator
interface FindingsAnswerHistoryEntry {
  question: string;
  answer: string;
  phaseName?: string;
  answerType?: string;
  options?: string[];
  index?: number;
}


export interface PDFGenerationResponse {
  success: boolean;
  pdfBuffer?: ArrayBuffer;
  filename?: string;
  error?: string;
  details?: string;
  warnings?: string[];
  metadata?: {
    htmlLength: number;
    processingTime: number;
    sectionsFound: string[];
  };
}

/**
 * Main function to generate PDF from scorecard data
 */
export async function generateScorecardPDF(
  reportData: ScoreCardData,
  options: PDFGenerationOptions = {}
): Promise<PDFGenerationResponse> {
  const startTime = Date.now();
  
  console.log('UNIFIED_PDF: Starting PDF generation process');
  console.log('UNIFIED_PDF: Options:', options);
  
  const {
    includeQA = true,
    includeDetailedAnalysis = true,
    style = 'standard',
    pdfOptions = {}
  } = options;

  try {
    // Step 1: Validate input data
    const validationResult = validateReportData(reportData);
    if (!validationResult.isValid) {
      return {
        success: false,
        error: 'Invalid report data',
        details: validationResult.errors.join('; ')
      };
    }

    // Step 2: Enhance markdown with findings if needed
    let enhancedMarkdown = reportData.FullReportMarkdown || '';
    
    if (reportData.QuestionAnswerHistory && reportData.QuestionAnswerHistory.length > 0) {
      console.log('UNIFIED_PDF: Generating findings from Q&A history');
      // Convert to compatible format for findings generator
      const compatibleHistory: FindingsAnswerHistoryEntry[] = reportData.QuestionAnswerHistory.map(item => ({
        question: item.question,
        answer: item.answer,
        phaseName: item.phaseName,
        answerType: item.answerType,
        options: item.options || undefined,
        index: item.index
      }));
      const findings = generateFindings(compatibleHistory);
      enhancedMarkdown = insertKeyFindings(enhancedMarkdown, findings);
    }


    // Step 3: Parse markdown content
    console.log('UNIFIED_PDF: Parsing markdown content');
    const parsedReport = extractAllSections(enhancedMarkdown);
    
    // Step 4: Generate HTML
    console.log('UNIFIED_PDF: Generating HTML content');
    const htmlContent = generateUnifiedHTML(reportData, parsedReport, {
      includeQA,
      includeDetailedAnalysis,
      style
    });

    // Step 5: Validate HTML
    console.log('UNIFIED_PDF: Validating HTML content');
    const htmlValidation = validateHTMLContent(htmlContent);
    if (!htmlValidation.isValid) {
      return {
        success: false,
        error: 'Invalid HTML content generated',
        details: htmlValidation.errors.join('; '),
        warnings: htmlValidation.warnings
      };
    }

    // Step 6: Generate PDF
    console.log('UNIFIED_PDF: Generating PDF');
    const pdfResult = await generatePDF(
      htmlContent,
      pdfOptions,
      {
        companyName: reportData.UserInformation.CompanyName,
        userName: reportData.UserInformation.UserName,
        reportDate: new Date().toISOString().split('T')[0]
      }
    );

    const processingTime = Date.now() - startTime;
    
    if (pdfResult.success) {
      console.log(`UNIFIED_PDF: PDF generation completed successfully in ${processingTime}ms`);
      
      // Collect metadata about what was processed
      const sectionsFound = [];
      if (parsedReport.sections.strengths.htmlContent) sectionsFound.push('Strengths');
      if (parsedReport.sections.weaknesses.htmlContent) sectionsFound.push('Weaknesses');
      if (parsedReport.sections.strategicPlan.htmlContent) sectionsFound.push('Strategic Plan');
      if (parsedReport.sections.learningPath.htmlContent) sectionsFound.push('Learning Path');
      if (parsedReport.sections.resources.htmlContent) sectionsFound.push('Resources');
      if (parsedReport.sections.benchmarks.htmlContent) sectionsFound.push('Benchmarks');
      if (parsedReport.sections.detailedAnalysis.htmlContent) sectionsFound.push('Detailed Analysis');
      sectionsFound.push(...parsedReport.dynamicSections.map(s => s.title));
      
      return {
        success: true,
        pdfBuffer: pdfResult.pdfBuffer,
        filename: pdfResult.filename,
        warnings: htmlValidation.warnings,
        metadata: {
          htmlLength: htmlContent.length,
          processingTime,
          sectionsFound
        }
      };
    } else {
      console.error('UNIFIED_PDF: PDF generation failed:', pdfResult.error);
      return {
        success: false,
        error: pdfResult.error,
        details: pdfResult.details,
        warnings: htmlValidation.warnings
      };
    }

  } catch (error: any) {
    console.error('UNIFIED_PDF: Unexpected error during PDF generation:', error);
    return {
      success: false,
      error: 'Unexpected error during PDF generation',
      details: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Generate HTML preview (for debugging)
 */
export function generateHTMLPreview(
  reportData: ScoreCardData,
  options: PDFGenerationOptions = {}
): {
  success: boolean;
  html?: string;
  error?: string;
  warnings?: string[];
} {
  console.log('UNIFIED_PDF: Generating HTML preview');
  
  const {
    includeQA = true,
    includeDetailedAnalysis = true,
    style = 'standard'
  } = options;

  try {
    // Validate input data
    const validationResult = validateReportData(reportData);
    if (!validationResult.isValid) {
      return {
        success: false,
        error: `Invalid report data: ${validationResult.errors.join('; ')}`
      };
    }

    // Enhance markdown with findings
    let enhancedMarkdown = reportData.FullReportMarkdown || '';
    
    if (reportData.QuestionAnswerHistory && reportData.QuestionAnswerHistory.length > 0) {
      // Convert to compatible format for findings generator
      const compatibleHistory: FindingsAnswerHistoryEntry[] = reportData.QuestionAnswerHistory.map(item => ({
        question: item.question,
        answer: item.answer,
        phaseName: item.phaseName,
        answerType: item.answerType,
        options: item.options || undefined,
        index: item.index
      }));
      const findings = generateFindings(compatibleHistory);
      enhancedMarkdown = insertKeyFindings(enhancedMarkdown, findings);
    }


    // Parse markdown content
    const parsedReport = extractAllSections(enhancedMarkdown);
    
    // Generate HTML
    const htmlContent = generateUnifiedHTML(reportData, parsedReport, {
      includeQA,
      includeDetailedAnalysis,
      style
    });

    // Validate HTML
    const htmlValidation = validateHTMLContent(htmlContent);
    
    return {
      success: true,
      html: htmlContent,
      warnings: htmlValidation.warnings
    };

  } catch (error: any) {
    console.error('UNIFIED_PDF: Error generating HTML preview:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Validate report data structure
 */
function validateReportData(reportData: ScoreCardData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required structure
  if (!reportData) {
    errors.push('Report data is missing');
    return { isValid: false, errors, warnings };
  }

  // Validate UserInformation
  if (!reportData.UserInformation) {
    errors.push('UserInformation is missing');
  } else {
    if (!reportData.UserInformation.CompanyName) {
      warnings.push('Company name is missing');
    }
    if (!reportData.UserInformation.UserName) {
      warnings.push('User name is missing');
    }
    if (!reportData.UserInformation.Industry) {
      warnings.push('Industry is missing');
    }
    if (!reportData.UserInformation.Email) {
      warnings.push('Email is missing');
    }
  }

  // Validate ScoreInformation
  if (!reportData.ScoreInformation) {
    errors.push('ScoreInformation is missing');
  } else {
    if (!reportData.ScoreInformation.AITier) {
      warnings.push('AI Tier is missing');
    }
    if (!reportData.ScoreInformation.ReportID) {
      warnings.push('Report ID is missing');
    }
  }

  // Validate content
  if (!reportData.FullReportMarkdown || reportData.FullReportMarkdown.trim().length === 0) {
    warnings.push('Report markdown content is empty or missing');
  }

  // Validate Q&A history
  if (!reportData.QuestionAnswerHistory || !Array.isArray(reportData.QuestionAnswerHistory)) {
    warnings.push('Question/Answer history is missing or invalid');
  } else if (reportData.QuestionAnswerHistory.length === 0) {
    warnings.push('Question/Answer history is empty');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Extract text content from markdown (for search/analysis)
 */
export function extractTextContent(markdown: string): {
  totalWords: number;
  sections: Record<string, number>;
  keyTerms: string[];
} {
  if (!markdown) {
    return { totalWords: 0, sections: {}, keyTerms: [] };
  }

  const parsedReport = extractAllSections(markdown);
  const sections: Record<string, number> = {};
  
  // Count words in each section
  Object.entries(parsedReport.sections).forEach(([key, section]) => {
    if (section.content) {
      sections[key] = countWords(section.content);
    }
  });

  // Count words in dynamic sections
  parsedReport.dynamicSections.forEach(section => {
    sections[section.title] = countWords(section.content);
  });

  // Total word count
  const totalWords = Object.values(sections).reduce((sum, count) => sum + count, 0);

  // Extract key terms (simple implementation)
  const keyTerms = extractKeyTerms(markdown);

  return {
    totalWords,
    sections,
    keyTerms
  };
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Extract key terms from markdown
 */
function extractKeyTerms(markdown: string): string[] {
  if (!markdown) return [];
  
  // Simple key term extraction - look for bold text and headers
  const terms: string[] = [];
  
  // Extract bold text
  const boldMatches = markdown.match(/\*\*([^*]+)\*\*/g);
  if (boldMatches) {
    boldMatches.forEach(match => {
      const term = match.replace(/\*\*/g, '').trim();
      if (term.length > 2 && term.length < 50) {
        terms.push(term);
      }
    });
  }
  
  // Extract headers
  const headerMatches = markdown.match(/^#{1,6}\s+(.+)$/gm);
  if (headerMatches) {
    headerMatches.forEach(match => {
      const term = match.replace(/^#{1,6}\s+/, '').trim();
      if (term.length > 2 && term.length < 50) {
        terms.push(term);
      }
    });
  }
  
  // Remove duplicates and return top terms
  const uniqueTerms = [...new Set(terms)];
  return uniqueTerms.slice(0, 20); // Return top 20 terms
}

// Re-export types and functions for convenience
export type { ScoreCardData, AnswerHistoryEntry } from './unified-html-generator';

export type { PDFOptions, PDFGenerationResult } from './pdf-service';
export type { ParsedReport, ParsedSection } from './unified-markdown-parser';
export { validateHTMLContent, checkServiceHealth } from './pdf-service';
export { parseMarkdownToHTML, extractAllSections } from './unified-markdown-parser';
