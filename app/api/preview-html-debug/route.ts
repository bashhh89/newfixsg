import { NextResponse } from 'next/server';
import { generateScorecardHTML, ScorecardData } from '../generate-scorecard-weasyprint-report/html-generator';

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

    // Generate the HTML content
    const htmlContent = await generateScorecardHTML(sampleData);
    
    // Modify font paths for local viewing
    const modifiedHtml = htmlContent.replace(
      /url\('\/public\/fonts\/([^']+)'\)/g, 
      "url('../../../public/fonts/$1')"
    );
    
    // Return the HTML directly
    return new Response(modifiedHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error generating HTML preview:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}