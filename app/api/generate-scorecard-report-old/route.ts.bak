// File: app/api/generate-scorecard-report/route.ts
// Purpose: Server-side PDF generation for AI Efficiency Scorecard.

import { NextResponse, NextRequest } from 'next/server';
import PdfPrinter from 'pdfmake';
import path from 'path';
import fs from 'fs';
import { generateScorecardDocumentDefinition } from '../../../lib/pdf-generation/scorecard-pdf-v2.js';

// --- THIS IS YOUR SCORECARD_DEBUG_DATA ---
// This full data object will be used for generating the PDF.
const SCORECARD_DEBUG_DATA = {
    UserInformation: { Industry: "Property/Real Estate", UserName: "Ahmad Basheer", CompanyName: "QanDu.io", Email: "ahmadbasheerr@gmail.com" },
    ScoreInformation: { AITier: "Enabler", FinalScore: null, ReportID: "4zrPq2Jmh53iSEjGPImk" },
    QuestionAnswerHistory: [
        { "reasoningText": "Sample reasoning text", "phaseName": "Strategy & Goals", "answerType": "scale", "options": ["1", "2", "3", "4", "5"], "question": "How effectively is your real estate agency utilizing AI tools?", "answer": "4", "answerSource": "Pollinations Fallback" },
        { "reasoningText": "Sample reasoning text", "phaseName": "Monitoring & Optimization", "answerType": "scale", "options": ["1", "2", "3", "4", "5"], "question": "How satisfied are your employees with the current AI tools?", "answer": "3", "answerSource": "Pollinations Fallback" },
        { "reasoningText": "Sample reasoning text", "phaseName": "Monitoring & Optimization", "answerType": "text", "options": null, "answerSource": "Pollinations Fallback", "question": "What processes are in place for collecting feedback?", "answer": "Quarterly surveys and team meetings."}
    ],
    FullReportMarkdown: `# AI Efficiency Scorecard for Ahmad Basheer, Marketing Manager in Property/Real Estate

## Overall Tier: Enabler

## Key Findings

**Strengths:**
1. **Proactive AI Integration in Property Management:** Your agency is actively working on integrating AI for predictive maintenance, tenant communication, and leasing decisions.
2. **Diverse AI Application Across Operations:** AI tools are utilized in marketing, client relationship management, and business analytics.
3. **Regular Data Management Practices:** Evaluating and updating data management practices quarterly ensures that the data infrastructure is robust and up-to-date.

**Weaknesses:**
1. **Challenges in AI Back-Office Integration:** Difficulties with cost, integration, skilled personnel, and data privacy may hinder the full potential of AI-driven automation.
2. **Limited AI Maturity in CRM Systems:** A moderate maturity level in AI-driven CRM systems suggests opportunities for enhancing client interaction.

## Strategic Action Plan

1. **Enhance Back-Office AI Integration:**
   - Conduct a cost-benefit analysis to prioritize AI investments based on potential ROI and operational impact.
   - Develop a phased integration plan with clear milestones to systematically address system compatibility issues.

2. **Improve Data Quality and Integration:**
   - Standardize data collection and management processes across the agency to ensure consistency.
   - Implement advanced data integration solutions to unify disparate data sources into a centralized platform.

## Getting Started & Resources

### Sample AI Goal-Setting Meeting Agenda
1. **Introduction to Current AI Usage and Goals:**
   - Review existing AI applications and their outcomes.
   - Set clear objectives for AI integration in the upcoming quarter.

### Example Prompts for Property/Real Estate Marketing Managers
- **PROMPT:** "Generate a targeted marketing campaign strategy for luxury real estate properties in urban areas."
  - **USE CASE:** To create effective marketing campaigns that appeal to high-net-worth individuals looking for luxury properties.

This report concludes here.`
};
// --- END OF SCORECARD_DEBUG_DATA ---

const projectRoot = process.cwd();

const pjsRegularPath = path.resolve(projectRoot, 'PlusJakartaSans-Regular.ttf');
const pjsBoldPath = path.resolve(projectRoot, 'PlusJakartaSans-Bold.ttf');
// Assuming Roboto fonts are in a 'fonts' subdirectory in the project root
const robotoFolderPath = path.resolve(projectRoot, 'fonts');
const robotoRegularPath = path.resolve(robotoFolderPath, 'Roboto-Regular.ttf');
const robotoMediumPath = path.resolve(robotoFolderPath, 'Roboto-Medium.ttf');
const robotoItalicPath = path.resolve(robotoFolderPath, 'Roboto-Italic.ttf');
const robotoMediumItalicPath = path.resolve(robotoFolderPath, 'Roboto-MediumItalic.ttf');

const serverSideFonts = {
    PlusJakartaSans: {
        normal: pjsRegularPath,
        bold: pjsBoldPath,
        italics: robotoItalicPath, // Using Roboto Italic as fallback for Plus Jakarta Sans Italic
        bolditalics: robotoMediumItalicPath // Using Roboto Medium Italic as fallback for Plus Jakarta Sans BoldItalic
    },
    Roboto: { // Define Roboto family itself
        normal: robotoRegularPath,
        bold: robotoMediumPath,
        italics: robotoItalicPath,
        bolditalics: robotoMediumItalicPath
    }
};

// Initialize printer with fonts. This should be done once.
let printer: PdfPrinter | null = null;
try {
    // Basic check if critical font files for PdfPrinter exist
    if (!fs.existsSync(pjsRegularPath) || !fs.existsSync(pjsBoldPath)) {
        console.error('CRITICAL: Plus Jakarta Sans Regular or Bold .ttf file not found in project root. PDF generation will fail.');
    } else if (!fs.existsSync(robotoRegularPath) || !fs.existsSync(robotoItalicPath) || !fs.existsSync(robotoMediumItalicPath) || !fs.existsSync(robotoMediumPath)) {
        console.error('CRITICAL: One or more Roboto .ttf fallback font files not found in /fonts directory. PDF generation might fail or have style issues.');
    } else {
        printer = new PdfPrinter(serverSideFonts);
        console.log('PdfPrinter initialized successfully with custom fonts.');
    }
} catch (e: any) {
    console.error("CRITICAL ERROR: Failed to initialize PdfPrinter. Check font paths and ensure .ttf files are correct.", e.message);
    // Printer will remain null, and requests will fail
}

export async function GET(request: NextRequest) {
    console.log('API Route /api/generate-scorecard-report called.');

    if (!printer) {
        console.error('PdfPrinter not initialized. Cannot generate PDF. This usually indicates missing font files at server startup.');
        return NextResponse.json({ error: 'PDF Generation Error: Server configuration issue with fonts.' }, { status: 500 });
    }

    try {
        // TODO: In a real app, fetch SCORECARD_DEBUG_DATA based on reportId from request.nextUrl.searchParams.get('reportId');
        const reportDataToUse = SCORECARD_DEBUG_DATA;

        if (!reportDataToUse || !reportDataToUse.UserInformation || !reportDataToUse.ScoreInformation || !reportDataToUse.FullReportMarkdown) {
            console.error('API Error: Critical Scorecard data components are missing from the provided data.');
            return NextResponse.json({ error: 'Report data is incomplete or missing.' }, { status: 400 });
        }
            
        const docDefinition = generateScorecardDocumentDefinition(reportDataToUse);
        
        // Cast to 'any' as a temporary workaround if strict TDocumentDefinitions type issues persist with the footer/header.
        // The structure from generateScorecardDocumentDefinition should be valid for pdfmake.
        const pdfDoc = printer.createPdfKitDocument(docDefinition as any);

        const chunks: Buffer[] = [];
        pdfDoc.on('data', (chunk) => chunks.push(chunk));
        
        return new Promise<NextResponse>((resolve, reject) => {
            pdfDoc.on('end', () => {
                try {
                    const pdfBuffer = Buffer.concat(chunks);
                    console.log(`PDF Buffer generated, size: ${pdfBuffer.length} bytes.`);
                    resolve(new NextResponse(pdfBuffer, {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/pdf',
                            'Content-Disposition': `attachment; filename="AI_Efficiency_Scorecard_V2.pdf"`,
                        },
                    }));
                } catch (bufferError: any) {
                    console.error('Error concatenating PDF chunks or creating NextResponse:', bufferError);
                    reject(NextResponse.json({ error: 'Failed to finalize PDF response.', details: bufferError.message }, { status: 500 }));
                }
            });
            pdfDoc.on('error', (err) => {
                console.error('Error during PDF document generation/streaming with pdfmake:', err);
                let detailMessage = err.message;
                if (err.message && err.message.includes("Font '") && err.message.includes("' not found")) {
                     detailMessage = 'A specified font was not found by pdfmake. Ensure all TTF files are correctly placed, paths are accurate in the API route, and the font names in pdfStyles match definitions.';
                }
                reject(NextResponse.json({ error: 'Failed to generate or stream PDF document.', details: detailMessage }, { status: 500 }));
            });
            pdfDoc.end();
        });

    } catch (error: any) {
        console.error('Unhandled error in API route GET handler:', error);
        return NextResponse.json({ error: 'Server error while generating PDF.', details: error.message }, { status: 500 });
    }
} 