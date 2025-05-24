// Simple test to generate HTML files using the API endpoints
const testData = {
  "UserInformation": {
    "UserName": "John Smith",
    "CompanyName": "Tech Innovations Inc",
    "Industry": "Technology",
    "Email": "john.smith@techinnovations.com"
  },
  "ScoreInformation": {
    "AITier": "AI Explorer",
    "FinalScore": 75,
    "ReportID": "TEST-2024-001"
  },
  "QuestionAnswerHistory": [
    {
      "question": "How would you rate your current AI adoption level?",
      "answer": "Moderate - we use some AI tools",
      "phaseName": "Current State Assessment",
      "answerType": "multiple_choice"
    },
    {
      "question": "What are your main challenges with AI implementation?",
      "answer": "Lack of technical expertise and budget constraints",
      "phaseName": "Challenges Assessment",
      "answerType": "text"
    },
    {
      "question": "Which AI tools does your organization currently use?",
      "answer": "ChatGPT, automated email responses, basic analytics",
      "phaseName": "Technology Assessment",
      "answerType": "text"
    }
  ],
  "FullReportMarkdown": `# AI Efficiency Scorecard Report

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

## Recommended Resources
- AI training platforms and certification courses
- Industry best practices documentation and frameworks
- Vendor evaluation frameworks and RFP templates

## Your Personalized AI Learning Path
Based on your assessment, we recommend starting with foundational AI concepts before moving to implementation.

## Industry Benchmarks
Companies in your industry typically score between 60-80 in AI maturity.`
};

async function generateTestFiles() {
  console.log('Generating test HTML files using API endpoints...\n');

  try {
    // Test standard style
    console.log('=== Generating Standard Style ===');
    const standardResponse = await fetch('http://localhost:3006/api/generate-scorecard-report-v6', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    if (standardResponse.ok) {
      const standardHtml = await standardResponse.text();
      require('fs').writeFileSync('test-standard-output.html', standardHtml);
      console.log('✅ Standard style saved to: test-standard-output.html');
      console.log(`   HTML length: ${standardHtml.length} characters`);
      
      // Check content
      console.log(`   Contains company name: ${standardHtml.includes('Tech Innovations Inc')}`);
      console.log(`   Contains score: ${standardHtml.includes('75')}`);
      console.log(`   Contains Q&A: ${standardHtml.includes('Assessment Questions')}`);
    } else {
      console.log('❌ Standard style failed:', standardResponse.status);
    }

    // Test presentation style
    console.log('\n=== Generating Presentation Style ===');
    const presentationResponse = await fetch('http://localhost:3006/api/generate-presentation-weasyprint-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    if (presentationResponse.ok) {
      const presentationHtml = await presentationResponse.text();
      require('fs').writeFileSync('test-presentation-output.html', presentationHtml);
      console.log('✅ Presentation style saved to: test-presentation-output.html');
      console.log(`   HTML length: ${presentationHtml.length} characters`);
      
      // Analyze presentation content
      console.log('\n=== Presentation Content Analysis ===');
      console.log(`   Contains presentation-style class: ${presentationHtml.includes('presentation-style')}`);
      console.log(`   Contains slide sections: ${presentationHtml.includes('class="slide"')}`);
      console.log(`   Contains slide content: ${presentationHtml.includes('slide-content')}`);
      console.log(`   Contains user name: ${presentationHtml.includes('John Smith')}`);
      
      // Count slides
      const slideMatches = presentationHtml.match(/class="slide"/g);
      console.log(`   Number of slides: ${slideMatches ? slideMatches.length : 0}`);
      
      // Check for specific slide content
      console.log(`   Contains strengths slide: ${presentationHtml.includes('Key Strengths')}`);
      console.log(`   Contains challenges slide: ${presentationHtml.includes('Challenges')}`);
      console.log(`   Contains action plan slide: ${presentationHtml.includes('Strategic Action Plan')}`);
      
    } else {
      console.log('❌ Presentation style failed:', presentationResponse.status);
    }

    console.log('\n=== Files Generated ===');
    console.log('You can now open these files in your browser:');
    console.log('1. test-standard-output.html - Standard card-based layout');
    console.log('2. test-presentation-output.html - Presentation slide layout');
    console.log('\nTo view them:');
    console.log('- start test-standard-output.html');
    console.log('- start test-presentation-output.html');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

generateTestFiles();
