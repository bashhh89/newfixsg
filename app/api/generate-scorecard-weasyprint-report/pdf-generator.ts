/**
 * PDF Generator for AI Efficiency Scorecard (WeasyPrint Version)
 * This utility converts HTML to PDF using the WeasyPrint service.
 */

interface PDFOptions {
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  format?: string;
  landscape?: boolean;
}

/**
 * Converts HTML to PDF using WeasyPrint service
 */
export async function convertHTMLToPDF(html: string, options: PDFOptions = {}): Promise<Buffer> {
  try {
    // WeasyPrint service configuration
    const WEASYPRINT_SERVICE_URL = process.env.WEASYPRINT_SERVICE_URL || "http://localhost:5001/generate-pdf";
    const WEASYPRINT_TIMEOUT = 120000; // 120 seconds timeout (increased from 60 seconds)
    
    const defaultOptions = {
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm"
      },
      format: "A4",
      landscape: false
    };
    
    // Merge default options with provided options
    const pdfOptions = {
      ...defaultOptions,
      ...options
    };
    
    console.log("Sending request to WeasyPrint service...");
    
    // Set up timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WEASYPRINT_TIMEOUT);
    
    // Make request to WeasyPrint service
    const weasyPrintResponse = await fetch(WEASYPRINT_SERVICE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        html_content: html,
        pdf_options: pdfOptions
      }),
      signal: controller.signal
    });
    
    // Clear timeout
    clearTimeout(timeoutId);
    
    if (!weasyPrintResponse.ok) {
      let errorDetails = "";
      try {
        const errorData = await weasyPrintResponse.json();
        errorDetails = JSON.stringify(errorData);
      } catch {
        errorDetails = await weasyPrintResponse.text();
      }
      
      console.error(`WeasyPrint service error: ${weasyPrintResponse.status} - ${errorDetails}`);
      throw new Error(`WeasyPrint service error: ${weasyPrintResponse.status}`);
    }
    
    // Get PDF as buffer
    const pdfBuffer = await weasyPrintResponse.arrayBuffer();
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("Error converting HTML to PDF:", error);
    
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("WeasyPrint service request timed out");
    }
    
    throw error;
  }
} 