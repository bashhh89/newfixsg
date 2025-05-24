// Test to generate and check presentation HTML properly
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

async function testPresentationStyle() {
  console.log('Testing Presentation Style HTML Generation...\n');

  try {
    // Test presentation HTML endpoint
    console.log('=== Generating Presentation Style HTML ===');
    const presentationResponse = await fetch('http://localhost:3006/api/generate-presentation-html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    if (presentationResponse.ok) {
      const presentationHtml = await presentationResponse.text();
      require('fs').writeFileSync('test-presentation-proper.html', presentationHtml);
      console.log('✅ Presentation HTML saved to: test-presentation-proper.html');
      console.log(`   HTML length: ${presentationHtml.length} characters`);
      
      // Analyze presentation content
      console.log('\n=== Presentation Content Analysis ===');
      console.log(`✅ Contains presentation-style class: ${presentationHtml.includes('presentation-style')}`);
      console.log(`✅ Contains slide sections: ${presentationHtml.includes('class="slide"')}`);
      console.log(`✅ Contains slide content: ${presentationHtml.includes('slide-content')}`);
      console.log(`✅ Contains slide images: ${presentationHtml.includes('slide-image')}`);
      console.log(`✅ Contains user name: ${presentationHtml.includes('John Smith')}`);
      console.log(`✅ Contains company name: ${presentationHtml.includes('Tech Innovations Inc')}`);
      
      // Count slides
      const slideMatches = presentationHtml.match(/class="slide"/g);
      console.log(`📊 Number of slides: ${slideMatches ? slideMatches.length : 0}`);
      
      // Check for specific slide content
      console.log(`✅ Contains strengths slide: ${presentationHtml.includes('Key Strengths in AI Adoption')}`);
      console.log(`✅ Contains challenges slide: ${presentationHtml.includes('Challenges and Weaknesses')}`);
      console.log(`✅ Contains action plan slide: ${presentationHtml.includes('Strategic Action Plan Overview')}`);
      
      // Check for missing content
      console.log('\n=== Content Completeness Check ===');
      console.log(`✅ Contains Executive Summary: ${presentationHtml.includes('Executive Summary')}`);
      console.log(`✅ Contains Strategic Action Plan: ${presentationHtml.includes('Strategic Action Plan')}`);
      console.log(`✅ Contains Q&A section: ${presentationHtml.includes('Assessment Questions')}`);
      console.log(`✅ Contains Resources: ${presentationHtml.includes('Recommended Resources')}`);
      console.log(`✅ Contains Learning Path: ${presentationHtml.includes('Learning Path')}`);
      console.log(`✅ Contains Industry Benchmarks: ${presentationHtml.includes('Industry Benchmarks')}`);
      
      // Check CSS styles
      console.log('\n=== Style Check ===');
      console.log(`✅ Contains presentation CSS: ${presentationHtml.includes('.presentation-style')}`);
      console.log(`✅ Contains slide CSS: ${presentationHtml.includes('.slide {')}`);
      console.log(`✅ Contains brand colors: ${presentationHtml.includes('#20E28F')}`);
      
    } else {
      console.log('❌ Presentation HTML failed:', presentationResponse.status);
      const errorText = await presentationResponse.text();
      console.log('Error details:', errorText);
    }

    console.log('\n=== How to Check the Presentation Style ===');
    console.log('1. Open test-presentation-proper.html in your browser');
    console.log('2. You should see slide-like sections with:');
    console.log('   - Title slide with user/company info');
    console.log('   - Key strengths slide');
    console.log('   - Challenges slide');
    console.log('   - Strategic action plan slide');
    console.log('3. Each slide should have a two-column layout');
    console.log('4. Left side: content, Right side: colored background');
    console.log('\nTo open the file:');
    console.log('- start test-presentation-proper.html');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPresentationStyle();
