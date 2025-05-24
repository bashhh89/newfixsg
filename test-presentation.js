const fetch = require('node-fetch');

async function testPresentationHTML() {
  const testData = {
    UserInformation: {
      Industry: "Technology",
      UserName: "John Doe",
      CompanyName: "Test Company Inc",
      Email: "john@testcompany.com"
    },
    ScoreInformation: {
      AITier: "Enabler",
      FinalScore: 65,
      ReportID: "test-123"
    },
    QuestionAnswerHistory: [
      {
        question: "How would you describe your organization's current AI strategy?",
        answer: "We have some strategic elements but are still developing",
        phaseName: "Strategy & Goals",
        answerType: "radio",
        index: 1,
        answerSource: "Test"
      },
      {
        question: "How frequently does your team use AI tools?",
        answer: "3",
        phaseName: "Technology & Tools",
        answerType: "scale",
        index: 2,
        answerSource: "Test"
      }
    ],
    FullReportMarkdown: `# AI Efficiency Scorecard for Technology Marketing Manager

## Overall Tier: Enabler
Final Score: 65/100

## Key Findings

**Strengths:**
- Strategic development in progress
- Regular use of AI tools

**Weaknesses:**
- Need more formal strategy
- Limited advanced capabilities

## Strategic Action Plan

1. **Develop Formal Strategy:**
   - Create documented AI strategy
   - Align with business goals

2. **Expand Tool Usage:**
   - Explore advanced AI capabilities
   - Train team on new tools

## Getting Started & Resources

### Sample AI Goal-Setting Meeting Agenda
1. Review current AI usage
2. Identify gaps and opportunities
3. Set strategic priorities

### Example Prompts
- "Generate content ideas for our product launch"
- "Analyze customer feedback for insights"

## Your Personalized AI Learning Path

1. **"AI Strategy Development" (Course)**
   - Learn to create comprehensive AI strategies

2. **"Advanced AI Tools" (Workshop)**
   - Hands-on training with cutting-edge AI tools`
  };

  try {
    const response = await fetch('http://localhost:3006/api/generate-presentation-html', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      const html = await response.text();
      console.log('✅ Presentation HTML endpoint working!');
      console.log(`📄 Generated HTML length: ${html.length} characters`);
      
      // Save to file
      const fs = require('fs');
      fs.writeFileSync('test-presentation-output.html', html);
      console.log('💾 HTML saved to test-presentation-output.html');
      
      // Check if it contains expected content
      if (html.includes('presentation-style') && html.includes('slide')) {
        console.log('✅ HTML contains presentation-style layout!');
      } else {
        console.log('⚠️  HTML may not contain presentation layout');
      }
    } else {
      console.log('❌ Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testPresentationHTML();
