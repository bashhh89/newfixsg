/**
 * API route handler for generating presentation-style PDF using WeasyPrint service
 * Updated to use the unified PDF generation system
 */

import { NextResponse } from 'next/server';
import { generateScorecardPDF, ScoreCardData } from '../../../lib/pdf-generation';
import { db } from '../../../lib/firebase';
import { getDoc, doc } from 'firebase/firestore';

/**
 * POST /api/generate-presentation-weasyprint-report
 */
export async function POST(request: Request) {
  console.log('PRESENTATION_WEASYPRINT: Starting PDF generation request...');
  let reportData: any;
  let reportId: string | null = null;

  try {
    const url = new URL(request.url);
    reportId = url.searchParams.get('reportId');
    console.log('PRESENTATION_WEASYPRINT: Report ID from URL:', reportId);

    // Initialize with default/fallback structure
    reportData = {
      UserInformation: {
        UserName: 'N/A',
        CompanyName: 'N/A',
        Industry: 'N/A',
        Email: 'N/A',
      },
      ScoreInformation: {
        AITier: 'N/A',
        FinalScore: null,
        ReportID: reportId || 'N/A',
      },
      FullReportMarkdown: '',
      QuestionAnswerHistory: [],
    };

    if (reportId) {
      console.log(`PRESENTATION_WEASYPRINT: Fetching report data from Firestore for reportId: ${reportId}`);
      const reportRef = doc(db, 'scorecardReports', reportId);
      const reportSnapshot = await getDoc(reportRef);

      if (!reportSnapshot.exists()) {
        console.error(`PRESENTATION_WEASYPRINT: No report found in Firestore with ID: ${reportId}`);
        return NextResponse.json(
          { error: `No report found in Firestore with ID: ${reportId}` },
          { status: 404 }
        );
      }

      const firestoreData = reportSnapshot.data();
      console.log('PRESENTATION_WEASYPRINT: Firestore data retrieved:', {
        hasUserInfo: !!firestoreData.UserInformation,
        hasScoreInfo: !!firestoreData.ScoreInformation,
        hasMarkdown: !!firestoreData.reportMarkdown || !!firestoreData.markdown,
        hasQAHistory: !!firestoreData.questionAnswerHistory || !!firestoreData.answers,
        dataKeys: Object.keys(firestoreData)
      });
      
      // Find company name across various field names including lead capture data
      let companyNameValue = 'N/A';
      if (typeof firestoreData === 'object' && firestoreData !== null) {
        if (firestoreData.companyName) companyNameValue = firestoreData.companyName;
        else if (firestoreData.company) companyNameValue = firestoreData.company;
        else if (firestoreData.Company) companyNameValue = firestoreData.Company;
        else if (firestoreData.UserInformation?.CompanyName) companyNameValue = firestoreData.UserInformation.CompanyName;
        else if (firestoreData.leadCompany) companyNameValue = firestoreData.leadCompany;
        else if (firestoreData.scorecardLeadCompany) companyNameValue = firestoreData.scorecardLeadCompany;
        else {
          // Search through all fields for company name
          for (const key in firestoreData) {
            if (typeof firestoreData[key] === 'string' && key.toLowerCase().includes('company')) {
              companyNameValue = firestoreData[key];
              break;
            }
          }
        }
      }

      
      // Map Firestore data to our format with lead capture fallbacks
      reportData.UserInformation = {
        UserName: firestoreData.userName || firestoreData.UserInformation?.UserName || firestoreData.name || firestoreData.leadName || firestoreData.scorecardLeadName || 'N/A',
        CompanyName: companyNameValue,
        Industry: firestoreData.industry || firestoreData.Industry || firestoreData.UserInformation?.Industry || firestoreData.leadIndustry || firestoreData.scorecardLeadIndustry || 'N/A',
        Email: firestoreData.userEmail || firestoreData.email || firestoreData.UserInformation?.Email || firestoreData.leadEmail || firestoreData.scorecardLeadEmail || 'N/A',
      };

      reportData.ScoreInformation = {
        AITier: firestoreData.tier || firestoreData.ScoreInformation?.AITier || 'N/A',
        FinalScore: firestoreData.score || firestoreData.ScoreInformation?.FinalScore || null,
        ReportID: reportId,
      };
      reportData.FullReportMarkdown = firestoreData.reportMarkdown || firestoreData.markdown || '';
      reportData.QuestionAnswerHistory = firestoreData.questionAnswerHistory || firestoreData.answers || [];

    } else {
      console.log('PRESENTATION_WEASYPRINT: No reportId in URL, attempting to read from request body...');
      try {
        const bodyData = await request.json();
        console.log('PRESENTATION_WEASYPRINT: Request body data received');
        
        // Update with body data if available
        if (bodyData.UserInformation) {
          reportData.UserInformation = { ...reportData.UserInformation, ...bodyData.UserInformation };
        }
        if (bodyData.ScoreInformation) {
          reportData.ScoreInformation = { ...reportData.ScoreInformation, ...bodyData.ScoreInformation };
        }
        if (bodyData.FullReportMarkdown) {
          reportData.FullReportMarkdown = bodyData.FullReportMarkdown;
        }
        if (bodyData.QuestionAnswerHistory) {
          reportData.QuestionAnswerHistory = bodyData.QuestionAnswerHistory;
        }
      } catch (bodyError) {
        console.warn('PRESENTATION_WEASYPRINT: Could not parse request body as JSON or body is empty:', bodyError);
      }
    }

    console.log('PRESENTATION_WEASYPRINT: Processed report data:', {
      userName: reportData.UserInformation.UserName,
      companyName: reportData.UserInformation.CompanyName,
      industry: reportData.UserInformation.Industry,
      aiTier: reportData.ScoreInformation.AITier,
      finalScore: reportData.ScoreInformation.FinalScore,
      markdownLength: reportData.FullReportMarkdown.length,
      qaHistoryCount: reportData.QuestionAnswerHistory.length
    });

    // Convert to ScoreCardData format for unified system
    const scoreCardData: ScoreCardData = {
      UserInformation: reportData.UserInformation,
      ScoreInformation: reportData.ScoreInformation,
      QuestionAnswerHistory: reportData.QuestionAnswerHistory.map((item: any) => ({
        question: item.question || '',
        answer: item.answer || '',
        phaseName: item.phaseName,
        reasoningText: item.reasoningText,
        answerType: item.answerType,
        options: item.options,
        index: item.index,
        answerSource: item.answerSource
      })),
      FullReportMarkdown: reportData.FullReportMarkdown
    };

    console.log('PRESENTATION_WEASYPRINT: Generating PDF using unified system...');
    
    // Use the unified PDF generation system with presentation style
    const result = await generateScorecardPDF(scoreCardData, {
      includeQA: true,
      includeDetailedAnalysis: true,
      style: 'presentation'
    });

    if (result.success && result.pdfBuffer) {
      console.log('PRESENTATION_WEASYPRINT: PDF generated successfully');
      
      // Generate filename
      const companyName = reportData.UserInformation.CompanyName || 'Company';
      const userName = reportData.UserInformation.UserName || 'User';
      const sanitizedName = `${userName}_${companyName}`.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const filename = result.filename || `${sanitizedName}_ai_scorecard_presentation_${new Date().toISOString().split('T')[0]}.pdf`;

      if (result.warnings && result.warnings.length > 0) {
        console.warn('PRESENTATION_WEASYPRINT: Warnings during PDF generation:', result.warnings);
      }

      return new NextResponse(result.pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': result.pdfBuffer.byteLength.toString(),
        },
      });

    } else {
      console.error('PRESENTATION_WEASYPRINT: PDF generation failed:', result.error);
      return NextResponse.json(
        { 
          error: 'PDF generation failed', 
          details: result.error,
          warnings: result.warnings 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('PRESENTATION_WEASYPRINT: Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'PDF generation failed', 
        details: error.message || 'Unknown error',
        reportId: reportId 
      },
      { status: 500 }
    );
  }
}
