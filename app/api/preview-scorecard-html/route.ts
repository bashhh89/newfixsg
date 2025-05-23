import { NextResponse } from 'next/server';
import { saveHTMLPreview } from '../generate-scorecard-weasyprint-report/preview-html';
import { ScorecardData } from '../generate-scorecard-weasyprint-report/html-generator';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json() as ScorecardData;
    
    // Save HTML preview
    const previewPath = await saveHTMLPreview(data);
    const fileName = path.basename(previewPath);
    
    return NextResponse.json({ 
      success: true, 
      message: 'HTML preview generated successfully',
      previewPath: fileName,
      previewUrl: `/${fileName}`
    });
  } catch (error) {
    console.error('Error generating HTML preview:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// For testing purposes, also allow GET requests with sample data
export async function GET() {
  try {
    // Create sample data for testing
    const sampleData: ScorecardData = {
      UserInformation: {
        UserName: "John Doe",
        CompanyName: "Test Company",
        Industry: "Technology",
        Email: "john@example.com"
      },
      ScoreInformation: {
        AITier: "Dabbler",
        FinalScore: 45,
        ReportID: "TEST-123"
      },
      QuestionAnswerHistory: [
        {
          question: "How would you describe your organization's current AI adoption?",
          answer: "We're exploring some basic AI tools but haven't integrated them into our workflow yet.",
          phaseName: "AI Strategy",
          answerType: "text"
        },
        {
          question: "Rate your team's comfort level with AI tools",
          answer: "3",
          phaseName: "AI Strategy",
          answerType: "scale"
        }
      ],
      FullReportMarkdown: `# AI Efficiency Scorecard Report: Technology Industry
## Overall Tier: Dabbler
## Final Score: 45/100

## Key Findings

### Your Strengths
- You have started exploring AI tools and have basic awareness of their potential
- Your team shows interest in learning more about AI applications
- You have identified some specific use cases where AI could help

### Focus Areas
- Develop a formal AI strategy aligned with business goals
- Invest in training to build team capabilities
- Start with small, measurable AI projects to demonstrate value

## Strategic Action Plan

1. **Develop a Unified AI Strategy:** Organize a cross-departmental workshop to align AI goals with business objectives.
2. **Build Team Capabilities:** Implement a structured training program focusing on practical AI applications.
3. **Start with Quick Wins:** Identify 2-3 high-impact, low-complexity use cases for initial AI implementation.
4. **Establish Governance Framework:** Create basic guidelines for AI project selection and evaluation.
5. **Measure and Communicate Value:** Develop simple metrics to track ROI and share successes across the organization.

## Detailed Analysis

Your organization is currently at the Dabbler tier of AI maturity, which means you're in the early stages of exploring how AI can benefit your business. This is a critical foundation-building phase where strategic direction and initial successes will set the tone for future AI adoption.`
    };

    // Save HTML preview
    const previewPath = await saveHTMLPreview(sampleData);
    const fileName = path.basename(previewPath);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sample HTML preview generated successfully',
      previewPath: fileName,
      previewUrl: `/${fileName}`
    });
  } catch (error) {
    console.error('Error generating sample HTML preview:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 