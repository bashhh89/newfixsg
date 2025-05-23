/**
 * Test script for the WeasyPrint PDF generation
 * This script tests the WeasyPrint PDF generation by sending a request to the API endpoint
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Sample data for testing
const testData = {
  UserInformation: {
    Industry: 'Property/Real Estate',
    UserName: 'User',
    CompanyName: 'test',
    Email: 'saleem@home.qandu.io'
  },
  ScoreInformation: {
    AITier: 'Dabbler',
    FinalScore: 2,
    ReportID: 'RrlkORTVBVeY4gTShGOW'
  },
  QuestionAnswerHistory: [
    {
      question: 'How would you describe your organization\'s current use of AI tools?',
      answer: 'We are just beginning to explore AI tools',
      phaseName: 'Current AI Usage',
      answerType: 'radio'
    },
    {
      question: 'What is your organization\'s primary goal for implementing AI?',
      answer: 'Improve operational efficiency',
      phaseName: 'AI Strategy',
      answerType: 'radio'
    },
    {
      question: 'How would you rate your organization\'s data quality?',
      answer: '2',
      phaseName: 'Data Readiness',
      answerType: 'scale'
    }
  ],
  FullReportMarkdown: `
## Overall Tier: Dabbler

As a Dabbler, your organization is beginning to experiment with AI but has not yet developed a comprehensive strategy or implemented AI solutions at scale. You're in the early stages of exploring how AI might benefit your business.

### What This Means for Your Business

At this tier, you have the opportunity to learn from early adopters while avoiding their mistakes. Focus on building awareness, identifying specific use cases, and developing the foundational capabilities needed for successful AI implementation.

## Key Findings

**Strengths:**
- Initiative in AI Exploration: Your organization has taken the first steps in exploring AI technologies, showing a willingness to innovate.
- Awareness of AI Potential: There is a basic understanding of how AI might benefit your business operations.
- Early Utilization of Basic Tools: You've begun experimenting with entry-level AI tools for simple tasks.

**Weaknesses:**
- Lack of Skilled Personnel: There's a shortage of team members with AI expertise.
- High Costs of Implementation: Budget constraints are limiting AI adoption.
- Absence of Strategic Direction: No clear roadmap exists for AI integration across the organization.
- Data Quality Issues: Current data collection and management practices may not support advanced AI applications.

### Building on Your Strengths

Your initiative in exploring AI technologies provides a foundation to build upon. By leveraging your awareness of AI's potential and experience with basic tools, you can gradually expand your capabilities and develop more sophisticated applications tailored to your business needs.

### Addressing These Challenges

To overcome these challenges, consider investing in training for existing staff, starting with small, high-impact AI projects to demonstrate ROI, developing a clear AI strategy aligned with business goals, and implementing data governance practices to improve data quality and accessibility.

## Strategic Action Plan

1. Develop AI Literacy and Skills
   - Implement basic AI training for leadership team
   - Identify and upskill potential AI champions within your organization
   - Consider partnering with AI consultants for knowledge transfer

2. Establish Data Readiness
   - Conduct a data audit to assess quality and accessibility
   - Implement basic data governance practices
   - Begin centralizing and structuring key business data

3. Start with Focused AI Projects
   - Identify 2-3 high-impact, low-complexity use cases
   - Implement pre-built AI solutions that require minimal customization
   - Document outcomes and learnings from initial projects

4. Create a Basic AI Strategy
   - Align AI initiatives with specific business objectives
   - Develop a 12-month roadmap for AI implementation
   - Establish metrics to measure AI project success

5. Build Necessary Infrastructure
   - Evaluate current technology stack for AI compatibility
   - Implement necessary security measures for AI systems
   - Consider cloud-based AI services to minimize upfront investment

## Illustrative Benchmarks

The following benchmarks illustrate typical characteristics of organizations at different AI maturity tiers. Your organization is currently at the Dabbler level with a score of 2/100.

### Dabbler Tier Organizations
- Experimenting with basic AI tools on an ad hoc basis
- No formal AI strategy or dedicated resources
- Limited understanding of AI capabilities across the organization
- Minimal data infrastructure to support AI initiatives
- Few if any successful AI implementations

### Enabler Tier Organizations
- Established AI strategy aligned with business objectives
- Dedicated resources for AI initiatives
- Growing AI literacy across multiple departments
- Improved data infrastructure and governance
- Several successful AI implementations delivering business value

### Leader Tier Organizations
- Comprehensive AI strategy integrated with overall business strategy
- Specialized AI teams and widespread AI literacy
- Advanced data infrastructure optimized for AI applications
- Numerous successful AI implementations across the organization
- Continuous innovation and refinement of AI capabilities

### Current Standing vs. Next Tier

To advance from Dabbler to Enabler tier, focus on developing a formal AI strategy, improving data quality and accessibility, building AI literacy across your organization, and implementing several successful AI projects that demonstrate clear business value.

## Your Personalized AI Learning Path

Based on your assessment results and AI maturity tier, we've created a personalized learning path to help you advance your organization's AI capabilities.

Resource 1: AI for Everyone (Coursera)
1. This non-technical course will help your leadership team understand AI fundamentals and potential business applications.
2. https://www.coursera.org/learn/ai-for-everyone

Resource 2: Data Strategy Fundamentals
1. Learn how to develop a data strategy that supports AI initiatives.
2. Focus on data quality, governance, and accessibility.
3. https://www.datacamp.com/courses/data-strategy-fundamentals

Resource 3: AI Use Cases in Property/Real Estate
1. Explore specific applications of AI in your industry.
2. Identify high-value opportunities for your organization.
3. https://www.proptech.com/ai-applications

Resource 4: Introduction to AI Tools for Business
1. Hands-on introduction to user-friendly AI tools that require minimal technical expertise.
2. Learn how to implement these tools in your daily operations.
3. https://www.udemy.com/course/ai-tools-for-business

Resource 5: Building Your First AI Project
1. Step-by-step guide to implementing a small-scale AI project.
2. Includes templates for project planning and evaluation.
3. https://www.coursera.org/projects/building-ai-projects

## Contact Information

For more information about your AI Scorecard:

Address: 123 AI Innovation Street, Melbourne VIC 3000, Australia
Email: ai-scorecard@socialgarden.com.au
Web: www.socialgarden.com.au/ai-scorecard
Phone: +61 3 9111 2222

### Next Steps

We recommend scheduling a follow-up consultation to discuss your results in detail and develop a customized implementation plan. Our team of AI experts can provide guidance on prioritizing initiatives, selecting appropriate tools, and measuring outcomes.

This report concludes here.
  `
};

// Function to test the WeasyPrint PDF generation
async function testWeasyPrintPDF() {
  try {
    console.log('Starting WeasyPrint PDF test...');
    
    // Start the Next.js development server if not already running
    console.log('Ensure your Next.js development server is running on port 3006');
    
    // Prepare the request options
    const options = {
      hostname: 'localhost',
      port: 3006,
      path: '/api/generate-scorecard-weasyprint-report',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    // Create the request
    const req = http.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers)}`);
      
      const chunks = [];
      
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          const buffer = Buffer.concat(chunks);
          const outputPath = path.join(__dirname, 'test-weasyprint-output.pdf');
          
          fs.writeFileSync(outputPath, buffer);
          console.log(`PDF successfully generated and saved to ${outputPath}`);
        } else {
          console.error('Error response:', Buffer.concat(chunks).toString());
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Error:', error);
    });
    
    // Write the test data to the request body
    req.write(JSON.stringify(testData));
    req.end();
    
    console.log('Request sent, waiting for response...');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testWeasyPrintPDF(); 