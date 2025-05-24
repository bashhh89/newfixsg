/**
 * API route handler for generating presentation-style HTML (for preview)
 */

import { NextResponse } from 'next/server';
import { generateHTMLPreview, ScoreCardData } from '../../../lib/pdf-generation/unified-html-generator';

/**
 * POST /api/generate-presentation-html
 */
export async function POST(request: Request) {
  console.log('PRESENTATION_HTML: Starting HTML generation request...');

  try {
    const bodyData = await request.json();
    console.log('PRESENTATION_HTML: Request body data received');
    
    // Convert to ScoreCardData format
    const scoreCardData: ScoreCardData = {
      UserInformation: {
        UserName: bodyData.UserInformation?.UserName || 'N/A',
        CompanyName: bodyData.UserInformation?.CompanyName || 'N/A',
        Industry: bodyData.UserInformation?.Industry || 'N/A',
        Email: bodyData.UserInformation?.Email || 'N/A'
      },
      ScoreInformation: {
        AITier: bodyData.ScoreInformation?.AITier || 'N/A',
        FinalScore: bodyData.ScoreInformation?.FinalScore || null,
        ReportID: bodyData.ScoreInformation?.ReportID || 'N/A'
      },
      QuestionAnswerHistory: bodyData.QuestionAnswerHistory || [],
      FullReportMarkdown: bodyData.FullReportMarkdown || ''
    };

    console.log('PRESENTATION_HTML: Generating HTML using unified system...');
    
    // Generate HTML with presentation style
    const result = generateHTMLPreview(scoreCardData, {
      includeQA: true,
      includeDetailedAnalysis: true,
      style: 'presentation'
    });

    if (result.success && result.html) {
      console.log('PRESENTATION_HTML: HTML generated successfully');
      console.log(`PRESENTATION_HTML: HTML length: ${result.html.length} characters`);
      
      return new NextResponse(result.html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      });

    } else {
      console.error('PRESENTATION_HTML: HTML generation failed:', result.error);
      return NextResponse.json(
        { 
          error: 'HTML generation failed', 
          details: result.error,
          warnings: result.warnings 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('PRESENTATION_HTML: Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'HTML generation failed', 
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
