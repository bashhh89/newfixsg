/**
 * Unified PDF Service
 * Handles WeasyPrint communication with robust error handling and retry logic
 */

export interface PDFOptions {
  pageSize?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  optimize?: boolean;
  compress?: boolean;
}

export interface PDFGenerationResult {
  success: boolean;
  pdfBuffer?: ArrayBuffer;
  error?: string;
  details?: string;
  filename?: string;
}

/**
 * Generate PDF from HTML using WeasyPrint service
 */
export async function generatePDF(
  htmlContent: string,
  options: PDFOptions = {},
  metadata: {
    companyName?: string;
    userName?: string;
    reportDate?: string;
  } = {}
): Promise<PDFGenerationResult> {
  const {
    pageSize = 'A4',
    orientation = 'portrait',
    margins = {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    },
    optimize = true,
    compress = true
  } = options;

  const WEASYPRINT_SERVICE_URL = process.env.WEASYPRINT_SERVICE_URL || 'http://localhost:5001/generate-pdf';
  const WEASYPRINT_TIMEOUT = 120000; // 2 minutes
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  console.log('PDF_SERVICE: Starting PDF generation');
  console.log('PDF_SERVICE: HTML content length:', htmlContent.length);
  console.log('PDF_SERVICE: WeasyPrint URL:', WEASYPRINT_SERVICE_URL);

  // Validate HTML content
  if (!htmlContent || htmlContent.trim().length === 0) {
    return {
      success: false,
      error: 'Empty HTML content provided',
      details: 'HTML content is required for PDF generation'
    };
  }

  // Prepare request payload
  const requestPayload = {
    html_content: htmlContent,
    pdf_options: {
      presentational_hints: true,
      optimize_size: optimize ? ['images', 'fonts'] : [],
      compress,
      pdf_format: {
        page_size: pageSize,
        orientation,
        margin: margins
      },
      stylesheets: [],
      font_config: {
        font_family: 'Inter',
        font_path: './fonts'
      }
    }
  };

  console.log('PDF_SERVICE: Request payload prepared');

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`PDF_SERVICE: Attempt ${attempt} of ${MAX_RETRIES}`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('PDF_SERVICE: Request timeout, aborting...');
        controller.abort();
      }, WEASYPRINT_TIMEOUT);

      const response = await fetch(WEASYPRINT_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`PDF_SERVICE: Response status: ${response.status}`);

      if (response.ok) {
        console.log('PDF_SERVICE: PDF generation successful');
        
        const pdfBuffer = await response.arrayBuffer();
        console.log('PDF_SERVICE: PDF buffer size:', pdfBuffer.byteLength);

        // Generate filename
        const filename = generateFilename(metadata);
        
        return {
          success: true,
          pdfBuffer,
          filename
        };
      } else {
        // Handle HTTP errors
        let errorDetails = '';
        try {
          const errorData = await response.json();
          errorDetails = JSON.stringify(errorData);
        } catch (e) {
          errorDetails = await response.text();
        }

        const error = `HTTP ${response.status}: ${response.statusText}`;
        console.warn(`PDF_SERVICE: Attempt ${attempt} failed - ${error}`);
        console.warn('PDF_SERVICE: Error details:', errorDetails);

        lastError = new Error(`${error} - ${errorDetails}`);

        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          return {
            success: false,
            error,
            details: errorDetails
          };
        }
      }

    } catch (fetchError: any) {
      console.warn(`PDF_SERVICE: Attempt ${attempt} failed with exception:`, fetchError);
      
      lastError = fetchError;

      // Handle specific error types
      if (fetchError.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout',
          details: 'The PDF generation process took too long to complete. Please try again with a smaller report or contact support.'
        };
      }

      if (fetchError.code === 'ECONNREFUSED' || fetchError.code === 'ENOTFOUND') {
        return {
          success: false,
          error: 'Service unavailable',
          details: 'The PDF generation service is currently unavailable. Please try again later or contact support.'
        };
      }
    }

    // Wait before retrying (except on last attempt)
    if (attempt < MAX_RETRIES) {
      console.log(`PDF_SERVICE: Waiting ${RETRY_DELAY}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }

  // All retries failed
  console.error('PDF_SERVICE: All retry attempts failed');
  return {
    success: false,
    error: 'PDF generation failed after multiple attempts',
    details: lastError ? lastError.message : 'Unknown error occurred'
  };
}

/**
 * Generate a filename for the PDF
 */
function generateFilename(metadata: {
  companyName?: string;
  userName?: string;
  reportDate?: string;
}): string {
  const { companyName = 'Company', userName = 'User', reportDate } = metadata;
  
  // Sanitize names for filename
  const sanitizedCompany = sanitizeFilename(companyName);
  const sanitizedUser = sanitizeFilename(userName);
  
  // Use provided date or current date
  const dateStr = reportDate || new Date().toISOString().split('T')[0];
  
  return `${sanitizedUser}_${sanitizedCompany}_ai_scorecard_${dateStr}.pdf`;
}

/**
 * Sanitize string for use in filename
 */
function sanitizeFilename(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase()
    .substring(0, 50); // Limit length
}

/**
 * Validate HTML content for PDF generation
 */
export function validateHTMLContent(html: string): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!html || html.trim().length === 0) {
    errors.push('HTML content is empty');
    return { isValid: false, warnings, errors };
  }

  // Check for basic HTML structure
  if (!html.includes('<html') || !html.includes('</html>')) {
    warnings.push('HTML content may be missing proper document structure');
  }

  if (!html.includes('<head') || !html.includes('</head>')) {
    warnings.push('HTML content may be missing head section');
  }

  if (!html.includes('<body') || !html.includes('</body>')) {
    warnings.push('HTML content may be missing body section');
  }

  // Check for CSS
  if (!html.includes('<style') && !html.includes('stylesheet')) {
    warnings.push('HTML content may be missing CSS styles');
  }

  // Check for very large content
  if (html.length > 5 * 1024 * 1024) { // 5MB
    warnings.push('HTML content is very large and may cause performance issues');
  }

  // Check for potentially problematic content
  if (html.includes('javascript:') || html.includes('<script')) {
    warnings.push('HTML content contains JavaScript which may not render properly in PDF');
  }

  // Check for external resources
  const externalResources = html.match(/src=["']https?:\/\/[^"']+["']/g);
  if (externalResources && externalResources.length > 0) {
    warnings.push(`HTML content references ${externalResources.length} external resources which may not load in PDF`);
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
}

/**
 * Estimate PDF generation time based on content
 */
export function estimateGenerationTime(htmlLength: number, complexity: 'low' | 'medium' | 'high' = 'medium'): number {
  // Base time in seconds
  let baseTime = 5;
  
  // Add time based on content length
  const lengthFactor = Math.ceil(htmlLength / 100000); // 100KB chunks
  baseTime += lengthFactor * 2;
  
  // Adjust for complexity
  const complexityMultiplier = {
    low: 1,
    medium: 1.5,
    high: 2
  };
  
  baseTime *= complexityMultiplier[complexity];
  
  // Cap at reasonable maximum
  return Math.min(baseTime, 60); // Max 60 seconds
}

/**
 * Health check for WeasyPrint service
 */
export async function checkServiceHealth(): Promise<{
  isHealthy: boolean;
  responseTime?: number;
  error?: string;
}> {
  const WEASYPRINT_SERVICE_URL = process.env.WEASYPRINT_SERVICE_URL || 'http://localhost:5001/generate-pdf';
  const healthCheckUrl = WEASYPRINT_SERVICE_URL.replace('/generate-pdf', '/health');
  
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for health check
    
    const response = await fetch(healthCheckUrl, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        isHealthy: true,
        responseTime
      };
    } else {
      return {
        isHealthy: false,
        responseTime,
        error: `Service returned ${response.status}: ${response.statusText}`
      };
    }
  } catch (error: any) {
    return {
      isHealthy: false,
      responseTime: Date.now() - startTime,
      error: error.message || 'Health check failed'
    };
  }
}
