// File: app/api/generate-scorecard-report-v5/route.ts
// Purpose: NEW server-side PDF generation for AI Efficiency Scorecard using PDFShift API.

import { NextResponse, NextRequest } from 'next/server';
import { generateScorecardHTMLv5 } from '../../../lib/html-generation/scorecard-html-v5';

// PDFShift API key from environment variables
const PDFSHIFT_API_KEY = process.env.PDFSHIFT_API_KEY || '';

// Test data for development and debugging purposes
// This will be replaced with actual data from Firestore in production
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
      "reasoningText": "Sample reasoning text", 
      "phaseName": "Strategy & Goals", 
      "answerType": "scale", 
      "options": ["1", "2", "3", "4", "5"], 
      "question": "How effectively is your real estate agency utilizing AI tools?", 
      "answer": "4", 
      "answerSource": "Pollinations Fallback" 
    },
    { 
      "reasoningText": "Sample reasoning text", 
      "phaseName": "Monitoring & Optimization", 
      "answerType": "scale", 
      "options": ["1", "2", "3", "4", "5"], 
      "question": "How satisfied are your employees with the current AI tools?", 
      "answer": "3", 
      "answerSource": "Pollinations Fallback" 
    },
    { 
      "reasoningText": "Sample reasoning text", 
      "phaseName": "Monitoring & Optimization", 
      "answerType": "text", 
      "options": null, 
      "answerSource": "Pollinations Fallback", 
      "question": "What processes are in place for collecting feedback?", 
      "answer": "Quarterly surveys and team meetings."
    },
    {
      "reasoningText": "The response indicates a moderate level of AI integration in CRM systems, which suggests there's room for improvement in using AI for client interaction and management.",
      "phaseName": "Implementation & Adoption",
      "answerType": "scale",
      "options": ["1", "2", "3", "4", "5"],
      "question": "On a scale of 1-5, how would you rate the AI maturity level in your CRM systems?",
      "answer": "3",
      "answerSource": "User Input"
    },
    {
      "reasoningText": "The agency is primarily focused on listings management and client matching, suggesting a strategic focus on core real estate operations where AI can provide immediate value.",
      "phaseName": "Strategy & Goals",
      "answerType": "checkbox",
      "options": ["Listings management", "Client matching", "Market analysis", "Property valuation", "Back-office automation"],
      "question": "Which areas of your real estate business are you primarily focusing on for AI integration?",
      "answer": "Listings management|Client matching",
      "answerSource": "User Input"
    },
    {
      "reasoningText": "Having multiple team members trained in AI tools indicates a decent level of adoption and capacity building within the organization.",
      "phaseName": "Capability & Skills",
      "answerType": "radio",
      "options": ["No dedicated team members", "One team member with basic training", "Multiple team members trained in AI tools", "Dedicated AI specialist", "Specialized AI team"],
      "question": "What AI capabilities does your team currently have?",
      "answer": "Multiple team members trained in AI tools",
      "answerSource": "User Input"
    },
    {
      "reasoningText": "Regular data evaluation practices ensure that the data infrastructure supporting AI initiatives remains current and effective.",
      "phaseName": "Data & Infrastructure",
      "answerType": "radio",
      "options": ["No regular evaluation", "Annual evaluation", "Quarterly evaluation", "Monthly evaluation", "Continuous evaluation"],
      "question": "How often do you evaluate and update your data management practices?",
      "answer": "Quarterly evaluation",
      "answerSource": "User Input"
    },
    {
      "reasoningText": "The challenges identified suggest that while the agency recognizes the potential value of AI in back-office operations, there are significant hurdles to implementation.",
      "phaseName": "Implementation & Adoption",
      "answerType": "checkbox",
      "options": ["Cost", "Integration with existing systems", "Lack of skilled personnel", "Data privacy concerns", "Regulatory compliance"],
      "question": "What challenges are you facing in implementing AI for back-office operations?",
      "answer": "Cost|Integration with existing systems|Lack of skilled personnel|Data privacy concerns",
      "answerSource": "User Input"
    },
    {
      "reasoningText": "Using AI for predictive maintenance, tenant communication, and leasing decisions shows a diverse application of AI across property management functions.",
      "phaseName": "Implementation & Adoption",
      "answerType": "checkbox",
      "options": ["Predictive maintenance", "Tenant communication", "Leasing decisions", "Building security", "Energy management"],
      "question": "How is your agency using AI in property management?",
      "answer": "Predictive maintenance|Tenant communication|Leasing decisions",
      "answerSource": "User Input"
    },
    {
      "reasoningText": "Multiple AI tools are being used across different functions, indicating a reasonable level of AI adoption in the organization.",
      "phaseName": "Implementation & Adoption",
      "answerType": "checkbox",
      "options": ["Marketing automation", "Client relationship management", "Virtual property tours", "Chatbots", "Business analytics"],
      "question": "Which AI tools are currently being used in your agency?",
      "answer": "Marketing automation|Client relationship management|Business analytics",
      "answerSource": "User Input"
    },
    {
      "reasoningText": "Formal AI training programs demonstrate a commitment to building AI capabilities within the organization.",
      "phaseName": "Capability & Skills",
      "answerType": "radio",
      "options": ["No training", "Informal self-learning", "Occasional workshops", "Regular training sessions", "Formal AI training programs"],
      "question": "What training do you provide for staff to use AI tools?",
      "answer": "Formal AI training programs",
      "answerSource": "User Input"
    },
    {
      "reasoningText": "A medium-term vision suggests strategic thinking about AI's role in the organization, but perhaps not yet a fully developed long-term strategy.",
      "phaseName": "Strategy & Goals",
      "answerType": "radio",
      "options": ["No vision", "Short-term tactical use", "Medium-term vision", "Long-term strategic plan", "Transformative vision"],
      "question": "What is your vision for AI in your real estate agency?",
      "answer": "Medium-term vision",
      "answerSource": "User Input"
    },
    {
      "reasoningText": "Having clear guidelines on AI usage indicates awareness of ethical considerations and corporate responsibility in AI deployment.",
      "phaseName": "Governance & Ethics",
      "answerType": "radio",
      "options": ["No guidelines", "Informal discussions only", "Basic written guidelines", "Comprehensive policies", "Regular policy reviews and updates"],
      "question": "What ethical guidelines do you have for AI usage?",
      "answer": "Comprehensive policies",
      "answerSource": "User Input"
    },
    {
      "reasoningText": "Regular reviews and specific metrics show a structured approach to evaluating AI effectiveness, which is important for continuous improvement.",
      "phaseName": "Monitoring & Optimization",
      "answerType": "radio",
      "options": ["No measurement", "Anecdotal feedback only", "Basic performance tracking", "Regular reviews with specific metrics", "Comprehensive ROI analysis"],
      "question": "How do you measure the impact of AI on your business?",
      "answer": "Regular reviews with specific metrics",
      "answerSource": "User Input"
    },
    {
      "reasoningText": "Planning for moderate increase in AI investment indicates continued commitment to developing AI capabilities without dramatic scaling up.",
      "phaseName": "Strategy & Goals",
      "answerType": "radio",
      "options": ["No planned investment", "Maintaining current level", "Moderate increase", "Significant increase", "Major strategic investment"],
      "question": "What are your plans for AI investment in the next fiscal year?",
      "answer": "Moderate increase",
      "answerSource": "User Input"
    },
    {
      "reasoningText": "Having a centralized data warehouse indicates relatively sophisticated data infrastructure to support AI initiatives.",
      "phaseName": "Data & Infrastructure",
      "answerType": "radio",
      "options": ["Mostly paper records", "Spread across different digital systems", "Basic central database", "Centralized data warehouse", "Advanced data lake architecture"],
      "question": "How is your property and client data currently stored?",
      "answer": "Centralized data warehouse",
      "answerSource": "User Input"
    },
    {
      "reasoningText": "Using AI to identify market opportunities shows strategic application of AI for business growth and competitive advantage.",
      "phaseName": "Strategy & Goals",
      "answerType": "checkbox",
      "options": ["Cost reduction", "Customer experience improvement", "Process efficiency", "Market opportunity identification", "Risk management"],
      "question": "What are your primary objectives for using AI?",
      "answer": "Customer experience improvement|Process efficiency|Market opportunity identification",
      "answerSource": "User Input"
    },
    {
      "reasoningText": "Using a combination of in-house and vendor support provides a balanced approach to AI solution development.",
      "phaseName": "Implementation & Adoption",
      "answerType": "radio",
      "options": ["No development", "Exclusively vendor solutions", "Primarily vendor with some customization", "Combination of in-house and vendor", "Primarily in-house development"],
      "question": "How are AI solutions developed in your organization?",
      "answer": "Combination of in-house and vendor",
      "answerSource": "User Input"
    },
    {
      "reasoningText": "Occasional cross-departmental collaboration indicates emerging integration of AI across the organization, but not yet fully systematic.",
      "phaseName": "Implementation & Adoption",
      "answerType": "radio",
      "options": ["Isolated in IT", "Limited to specific departments", "Occasional cross-departmental collaboration", "Systematic integration across departments", "Organization-wide AI-first approach"],
      "question": "How is AI integrated across different functions in your agency?",
      "answer": "Occasional cross-departmental collaboration",
      "answerSource": "User Input"
    },
    {
      "reasoningText": "Regular small-scale pilot projects suggest an incremental, test-and-learn approach to AI implementation.",
      "phaseName": "Implementation & Adoption",
      "answerType": "radio",
      "options": ["No experimentation", "Ad-hoc trials", "Regular small-scale pilot projects", "Systematic innovation program", "Advanced AI R&D initiatives"],
      "question": "How do you approach experimenting with new AI technologies?",
      "answer": "Regular small-scale pilot projects",
      "answerSource": "User Input"
    }
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

export async function GET(request: NextRequest) {
  console.log('API Route /api/generate-scorecard-report-v5 called.');

  try {
    // Generate HTML content
    console.log('Generating HTML content for PDFShift conversion');
    const htmlString = generateScorecardHTMLv5(SCORECARD_DEBUG_DATA);

    // Get the host from the request headers
    const host = request.headers.get('host') || 'localhost:3006';
    // Determine the protocol (use https if not localhost)
    const protocol = host.includes('localhost') ? 'http' : 'https';
    // Construct the base URL
    const baseUrl = `${protocol}://${host}`;
    
    console.log(`Using base URL: ${baseUrl} for PDFShift conversion`);

    // Call PDFShift API
    console.log('Calling PDFShift API');
    const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PDFSHIFT_API_KEY
      },
      body: JSON.stringify({
        source: htmlString,
        landscape: false,
        use_print: false
      })
    });

    // Check if the response is successful
    if (!response.ok) {
      console.error('PDFShift API returned an error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return NextResponse.json({ error: 'Failed to generate PDF with PDFShift', details: errorText }, { status: 500 });
    }

    // Get the PDF binary data
    const pdfBuffer = await response.arrayBuffer();
    console.log(`PDF successfully generated, size: ${pdfBuffer.byteLength} bytes.`);

    // Return the PDF as a download
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="AI_Scorecard_Report_V5.pdf"',
      },
    });
  } catch (error: any) {
    console.error('Error in the API route:', error);
    return NextResponse.json({ error: 'Server error while generating PDF', details: error.message }, { status: 500 });
  }
} 