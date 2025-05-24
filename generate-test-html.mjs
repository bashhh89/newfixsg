/**
 * Generate test HTML files to check presentation style and content
 */

import { generateHTMLPreview } from './lib/pdf-generation/unified-html-generator.ts';
import fs from 'fs';

// Comprehensive test data
const testData = {
  UserInformation: {
    UserName: "John Smith",
    CompanyName: "Tech Innovations Inc",
    Industry: "Technology",
    Email: "john.smith@techinnovations.com"
  },
  ScoreInformation: {
    AITier: "AI Explorer",
    FinalScore: 75,
    ReportID: "TEST-2024-001"
  },
  QuestionAnswerHistory: [
    {
      question: "How would you rate your current AI adoption level?",
      answer: "Moderate - we use some AI tools",
      phaseName: "Current State Assessment",
      answerType: "multiple_choice"
    },
    {
      question: "What are your main challenges with AI implementation?",
      answer: "Lack of technical expertise and budget constraints",
      phaseName: "Challenges Assessment",
      answerType: "text"
    },
    {
      question: "Which AI tools does your organization currently use?",
      answer: "ChatGPT, automated email responses, basic analytics",
      phaseName: "Technology Assessment",
      answerType: "text"
    }
  ],
  FullReportMarkdown: `
# AI Efficiency Scorecard Report

## Executive Summary
Your organization shows promising potential for AI adoption with a current score of 75/100. You demonstrate strong foundational elements but have clear opportunities for advancement.

## Key Strengths
- Strong leadership commitment to digital transformation
- Existing data infrastructure foundation
- Team willingness to learn new technologies
- Good understanding of business processes
- Adequate budget allocation for technology initiatives

## Areas for Improvement
- Limited AI expertise within the team
- Need for better data governance processes
- Insufficient integration between existing systems
- Lack of formal AI strategy documentation
- Missing performance measurement frameworks

## Strategic Action Plan
1. **Skill Development Initiative**: Invest in comprehensive AI training for key team members
   - Enroll 3-5 employees in AI certification programs
   - Establish internal AI knowledge sharing sessions
   - Create mentorship programs with AI experts
2. **Infrastructure Enhancement**: Upgrade data management systems
   - Implement proper data governance framework
   - Invest in cloud-based AI platforms
   - Establish data quality monitoring processes
3. **Budget Planning**: Allocate dedicated AI budget
   - Set aside 10-15% of IT budget for AI initiatives
   - Consider phased implementation approach
   - Plan for ongoing training and maintenance costs
4. **Strategy Documentation**: Create formal AI roadmap
   - Define clear AI objectives and KPIs
   - Establish governance committees
   - Document risk management procedures

## Recommended Resources
- AI training platforms and certification courses
- Industry best practices documentation and frameworks
- Vendor evaluation frameworks and RFP templates
- AI ethics and governance guidelines
- Performance measurement tools and dashboards

## Your Personalized AI Learning Path
Based on your assessment, we recommend starting with foundational AI concepts before moving to implementation:

### Phase 1: Foundation (Months 1-3)
- Complete AI fundamentals course
- Understand machine learning basics
- Learn about data preparation and quality

### Phase 2: Application (Months 4-6)
- Explore specific AI tools for your industry
- Practice with low-risk pilot projects
- Develop internal use cases

### Phase 3: Integration (Months 7-12)
- Implement enterprise-wide solutions
- Establish governance frameworks
- Scale successful pilot projects

## Industry Benchmarks
Companies in your industry typically score between 60-80 in AI maturity. Your score of 75 places you in the upper tier, indicating good progress with room for strategic advancement.

### Comparative Analysis
- **Technology Adoption**: Above average (78/100)
- **Data Readiness**: Average (72/100)
- **Team Skills**: Below average (68/100)
- **Strategy & Governance**: Above average (80/100)
  `
};

console.log('Generating test HTML files...\n');

// Generate Standard Style
console.log('=== Generating Standard Style ===');
const standardResult = generateHTMLPreview(testData, {
  includeQA: true,
  includeDetailedAnalysis: true,
  style: 'standard'
});

if (standardResult.success) {
  fs.writeFileSync('test-standard-output.html', standardResult.html);
  console.log('✅ Standard style saved to: test-standard-output.html');
  console.log(`   HTML length: ${standardResult.html.length} characters`);
} else {
  console.log('❌ Standard style failed:', standardResult.error);
}

// Generate Presentation Style
console.log('\n=== Generating Presentation Style ===');
const presentationResult = generateHTMLPreview(testData, {
  includeQA: true,
  includeDetailedAnalysis: true,
  style: 'presentation'
});

if (presentationResult.success) {
  fs.writeFileSync('test-presentation-output.html', presentationResult.html);
  console.log('✅ Presentation style saved to: test-presentation-output.html');
  console.log(`   HTML length: ${presentationResult.html.length} characters`);
  
  // Analyze presentation content
  const html = presentationResult.html;
  console.log('\n=== Presentation Content Analysis ===');
  console.log(`✅ Contains presentation-style class: ${html.includes('presentation-style')}`);
  console.log(`✅ Contains slide sections: ${html.includes('class="slide"')}`);
  console.log(`✅ Contains slide content: ${html.includes('slide-content')}`);
  console.log(`✅ Contains slide images: ${html.includes('slide-image')}`);
  console.log(`✅ Contains user name: ${html.includes('John Smith')}`);
  console.log(`✅ Contains company name: ${html.includes('Tech Innovations Inc')}`);
  
  // Count slides
  const slideMatches = html.match(/class="slide"/g);
  console.log(`📊 Number of slides: ${slideMatches ? slideMatches.length : 0}`);
  
  // Check for specific slide content
  console.log(`✅ Contains strengths slide: ${html.includes('Key Strengths in AI Adoption')}`);
  console.log(`✅ Contains challenges slide: ${html.includes('Challenges and Weaknesses')}`);
  console.log(`✅ Contains action plan slide: ${html.includes('Strategic Action Plan Overview')}`);
  
} else {
  console.log('❌ Presentation style failed:', presentationResult.error);
}

console.log('\n=== Files Generated ===');
console.log('You can now open these files in your browser to check the output:');
console.log('1. test-standard-output.html - Standard card-based layout');
console.log('2. test-presentation-output.html - Presentation slide layout');
console.log('\nTo view them, you can use:');
console.log('- start test-standard-output.html');
console.log('- start test-presentation-output.html');
