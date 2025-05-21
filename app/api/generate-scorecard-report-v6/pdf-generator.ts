import { NextResponse } from 'next/server';

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
 * Converts HTML to PDF using PDFShift API
 * Note: You'll need to replace the API key with your actual PDFShift API key
 */
export async function convertHTMLToPDF(html: string, options: PDFOptions = {}): Promise<Buffer> {
  try {
    // PDFShift API configuration
    const apiKey = process.env.PDFSHIFT_API_KEY;
    
    if (!apiKey) {
      throw new Error('PDFShift API key is not defined in environment variables');
    }
    
    const defaultOptions = {
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      printBackground: true,
      format: 'A4',
      landscape: false
    };
    
    // Merge default options with provided options
    const pdfOptions = {
      ...defaultOptions,
      ...options,
      source: html,
    };
    
    // Make request to PDFShift API
    const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`
      },
      body: JSON.stringify(pdfOptions)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`PDF generation failed: ${errorData.message || response.statusText}`);
    }
    
    // Get PDF as buffer
    const pdfBuffer = await response.arrayBuffer();
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error converting HTML to PDF:', error);
    throw error;
  }
}

/**
 * API route handler for generating PDF from HTML
 */
export async function generatePDF(request: Request): Promise<NextResponse> {
  try {
    const { html } = await request.json();
    
    if (!html) {
      return new NextResponse(JSON.stringify({ error: 'HTML content is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    const pdfBuffer = await convertHTMLToPDF(html);
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="ai-scorecard-report.pdf"',
      },
    });
  } catch (error) {
    console.error('Error in PDF generation API route:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate PDF' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

/**
 * Alternative implementation using Puppeteer (server-side only)
 * Uncomment and install dependencies if preferred over PDFShift
 */
/*
import puppeteer from 'puppeteer';

export async function convertHTMLToPDFWithPuppeteer(html: string, options: PDFOptions = {}): Promise<Buffer> {
  let browser;
  
  try {
    // Launch a headless browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Create a new page
    const page = await browser.newPage();
    
    // Set the HTML content
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: options.format || 'A4',
      printBackground: options.printBackground !== false,
      margin: options.margin || {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      landscape: options.landscape || false
    });
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF with Puppeteer:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
*/ 