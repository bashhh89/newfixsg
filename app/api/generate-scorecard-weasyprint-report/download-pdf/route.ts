/**
 * API Route: /api/generate-scorecard-weasyprint-report/download-pdf
 * Downloads a PDF report using a report ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateScorecardHTML, ScorecardData } from '../html-generator';
import { convertHTMLToPDF } from '../pdf-generator';
import { db } from '@/lib/firebase'; // Import db from firebase config
import { getDoc, doc } from 'firebase/firestore'; // Import firestore functions

// Function to fetch report data from Firestore
async function fetchReportData(reportId: string): Promise<ScorecardData> {
  try {
    console.log(`Fetching report data for ID: ${reportId} from Firestore`);
    
    const reportRef = doc(db, 'scorecardReports', reportId);
    const reportSnapshot = await getDoc(reportRef);
    
    if (!reportSnapshot.exists()) {
      throw new Error(`No report found in Firestore with ID: ${reportId}`);
    }
    
    const reportData = reportSnapshot.data();
    console.log("Fetched Firestore report data:", reportData);

    // Extract data with fallbacks, prioritizing lead form field names
    const userInformation = {
      UserName: reportData.leadName || reportData.userName || reportData.UserInformation?.UserName || 'User',
      CompanyName: reportData.leadCompany || reportData.companyName || reportData.UserInformation?.CompanyName || 'Company',
      Industry: reportData.industry || reportData.UserInformation?.Industry || 'Industry',
      Email: reportData.leadEmail || reportData.email || reportData.UserInformation?.Email || 'user@example.com'
    };

    const scoreInformation = reportData.ScoreInformation || {
      AITier: reportData.tier || reportData.userAITier || reportData.aiTier || 'Dabbler',
      FinalScore: reportData.finalScore !== undefined ? reportData.finalScore : null,
      ReportID: reportId
    };

    const questionAnswerHistory = reportData.QuestionAnswerHistory || reportData.answers || [];
    const fullReportMarkdown = reportData.FullReportMarkdown || reportData.markdown || reportData.reportMarkdown || '';

    // Debug the markdown content
    console.log("Markdown content length:", fullReportMarkdown.length);
    console.log("Markdown first 100 chars:", fullReportMarkdown.substring(0, 100));
    console.log("Contains 'Strategic Action Plan':", fullReportMarkdown.includes('Strategic Action Plan'));
    console.log("Contains '## Strategic Action Plan':", fullReportMarkdown.includes('## Strategic Action Plan'));
    
    // If the Strategic Action Plan section exists, log it
    const strategicPlanMatch = fullReportMarkdown.match(/## Strategic Action Plan\s*([\s\S]*?)(?=##|$)/i);
    if (strategicPlanMatch) {
      console.log("Strategic Plan section found:", strategicPlanMatch[1].substring(0, 100) + "...");
    } else {
      console.log("Strategic Plan section NOT found in markdown");
    }

    return {
      UserInformation: userInformation,
      ScoreInformation: scoreInformation,
      QuestionAnswerHistory: questionAnswerHistory,
      FullReportMarkdown: fullReportMarkdown
    };

  } catch (error) {
    console.error("Error fetching report data:", error);
    throw new Error(`Failed to fetch report data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * API route handler for downloading PDF by report ID
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  console.log('Received request to download WeasyPrint PDF report (GET)');
  
  try {
    // Get report ID from query parameters
    const searchParams = request.nextUrl.searchParams;
    const reportId = searchParams.get('reportId');
    
    if (!reportId) {
      console.error('No report ID provided');
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch report data
    const reportData = await fetchReportData(reportId);
    
    // Generate HTML from report data
    console.log('Generating HTML from report data...');
    const html = await generateScorecardHTML(reportData);
    
    // Convert HTML to PDF
    console.log('Converting HTML to PDF using WeasyPrint...');
    const pdfBuffer = await convertHTMLToPDF(html);
    
    console.log('PDF generation successful');
    
    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ai-scorecard-${reportId}.pdf"`,
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * API route handler for generating PDF from direct data submission
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('Received POST request to generate WeasyPrint PDF report (POST)');
  
  try {
    // Parse the request body to get report data
    const requestData = await request.json();
    
    if (!requestData) {
      console.error('No report data provided in request body');
      return NextResponse.json(
        { error: 'Report data is required' },
        { status: 400 }
      );
    }
    
    // Extract reportId from the request body
    const reportId = requestData.reportId || requestData.ScoreInformation?.ReportID;

    if (!reportId) {
       console.error('No report ID provided in POST request body');
       return NextResponse.json(
         { error: 'Report ID is required in request body' },
         { status: 400 }
       );
    }

    // Fetch the full report data from Firestore using the reportId
    const reportData = await fetchReportData(reportId);

    // Generate HTML from report data
    console.log('Generating HTML from fetched report data...');
    const html = await generateScorecardHTML(reportData);
    
    // Convert HTML to PDF
    console.log('Converting HTML to PDF using WeasyPrint...');
    const pdfBuffer = await convertHTMLToPDF(html);
    
    console.log('PDF generation successful');
    
    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="ai-scorecard-report.pdf"',
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
