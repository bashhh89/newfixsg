// File: app/api/pdf-generator/route.ts
// Full PDF generation implementation with proper template literals

import { NextResponse, NextRequest } from 'next/server';
import PdfPrinter from 'pdfmake';
import path from 'path';
import fs from 'fs';
import { generateScorecardDocumentDefinition } from '../../../lib/pdf-generation/scorecard-pdf-v2.js';

// Sample data with proper template literals
const SCORECARD_DEBUG_DATA = {
  UserInformation: { 
    Industry: "Property/Real Estate", 
    UserName: "Ahmad Basheer", 
    CompanyName: "QanDu.io", 
    Email: "ahmadbasheerr@gmail.com" 
  },
  ScoreInformation: { 
    AITier: "Enabler", 
    FinalScore: null, 
    ReportID: "4zrPq2Jmh53iSEjGPImk" 
  },
  QuestionAnswerHistory: [
    { 
      "reasoningText": "Sample reasoning",
      "phaseName": "Strategy & Goals",
      "answerType": "scale", 
      "options": ["1", "2", "3", "4", "5"], 
      "question": "How effectively are AI tools used?", 
      "answer": "4", 
      "answerSource": "Fallback" 
    }
  ],
  // Using template literals properly
  FullReportMarkdown: `# AI Efficiency Scorecard

## Overall Tier: Enabler

## Key Findings

**Strengths:**
1. **Proactive AI Integration**: Your agency is working on integrating AI.
2. **Diverse AI Application**: AI tools are utilized in marketing.

**Weaknesses:**
1. **Integration Challenges**: System compatibility issues exist.
2. **Limited AI Maturity**: Opportunities for enhancement.

## Strategic Action Plan

1. **Enhance Back-Office Integration:**
   - Conduct cost-benefit analysis
   - Develop phased plan

This report concludes here.`
};

// Font Configuration
const projectRoot = process.cwd();

const pjsRegularPath = path.resolve(projectRoot, 'PlusJakartaSans-Regular.ttf');
const pjsBoldPath = path.resolve(projectRoot, 'PlusJakartaSans-Bold.ttf');
const robotoFolderPath = path.resolve(projectRoot, 'fonts');
const robotoRegularPath = path.resolve(robotoFolderPath, 'Roboto-Regular.ttf');
const robotoMediumPath = path.resolve(robotoFolderPath, 'Roboto-Medium.ttf');
const robotoItalicPath = path.resolve(robotoFolderPath, 'Roboto-Italic.ttf');
const robotoMediumItalicPath = path.resolve(robotoFolderPath, 'Roboto-MediumItalic.ttf');

const serverSideFonts = {
  PlusJakartaSans: {
    normal: pjsRegularPath,
    bold: pjsBoldPath,
    italics: robotoItalicPath,
    bolditalics: robotoMediumItalicPath
  },
  Roboto: {
    normal: robotoRegularPath,
    bold: robotoMediumPath,
    italics: robotoItalicPath,
    bolditalics: robotoMediumItalicPath
  }
};

// Initialize printer with fonts
let printer: PdfPrinter | null = null;
try {
  // Check font files
  const missingFonts: string[] = [];
  if (!fs.existsSync(pjsRegularPath)) missingFonts.push('PlusJakartaSans-Regular.ttf');
  if (!fs.existsSync(pjsBoldPath)) missingFonts.push('PlusJakartaSans-Bold.ttf');
  if (!fs.existsSync(robotoRegularPath)) missingFonts.push('fonts/Roboto-Regular.ttf');
  
  if (missingFonts.length > 0) {
    console.error('Missing font files: ' + missingFonts.join(', '));
  } else {
    printer = new PdfPrinter(serverSideFonts);
    console.log('PdfPrinter initialized successfully with custom fonts');
  }
} catch (e: any) {
  console.error("Failed to initialize PdfPrinter: " + e.message);
}

export async function GET(request: NextRequest) {
  console.log('PDF Generator API route called with full implementation');
  
  const reportId = request.nextUrl.searchParams.get('reportId');
  console.log('Report ID:', reportId);
  
  if (!printer) {
    console.error('PdfPrinter not initialized. Cannot generate PDF.');
    return NextResponse.json({ 
      error: 'PDF Generation Error: Server configuration issue with fonts.' 
    }, { status: 500 });
  }
  
  try {
    // Use the debug data for testing
    const reportDataToUse = SCORECARD_DEBUG_DATA;
    
    if (!reportDataToUse || !reportDataToUse.UserInformation || !reportDataToUse.ScoreInformation || !reportDataToUse.FullReportMarkdown) {
      console.error('API Error: Critical Scorecard data components are missing.');
      return NextResponse.json({ 
        error: 'Report data is incomplete or missing.' 
      }, { status: 400 });
    }
    
    const docDefinition = generateScorecardDocumentDefinition(reportDataToUse);
    
    // Cast to 'any' as a workaround for type issues
    const pdfDoc = printer.createPdfKitDocument(docDefinition as any);
    
    const chunks: Buffer[] = [];
    pdfDoc.on('data', (chunk) => chunks.push(chunk));
    
    return new Promise<NextResponse>((resolve, reject) => {
      pdfDoc.on('end', () => {
        try {
          const pdfBuffer = Buffer.concat(chunks);
          console.log(`PDF Buffer generated, size: ${pdfBuffer.length} bytes`);
          resolve(new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="AI_Efficiency_Scorecard_V2.pdf"`,
            },
          }));
        } catch (bufferError: any) {
          console.error('Error concatenating PDF chunks:', bufferError.message);
          reject(NextResponse.json({ 
            error: 'Failed to finalize PDF response.', 
            details: bufferError.message 
          }, { status: 500 }));
        }
      });
      
      pdfDoc.on('error', (err) => {
        console.error('Error during PDF generation:', err.message);
        let detailMessage = err.message;
        if (err.message && err.message.includes("Font '") && err.message.includes("' not found")) {
          detailMessage = 'A specified font was not found by pdfmake.';
        }
        reject(NextResponse.json({ 
          error: 'Failed to generate PDF document.', 
          details: detailMessage 
        }, { status: 500 }));
      });
      
      pdfDoc.end();
    });
  } catch (error: any) {
    console.error('Unhandled error in API route:', error.message);
    return NextResponse.json({ 
      error: 'Server error while generating PDF.', 
      details: error.message 
    }, { status: 500 });
  }
} 