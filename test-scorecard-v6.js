const fetch = require('node-fetch');

async function testScorecardV6() {
  const testData = {
    "report_title": "AI Efficiency Scorecard",
    "report_subject_name": "Test Company",
    "report_description": "Test report",
    "section1_title": "Strengths",
    "section1_items": [
      {
        "title": "Test Strength",
        "description": "Test description"
      }
    ]
  };

  try {
    const response = await fetch('http://localhost:3006/api/generate-scorecard-report-v6', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      const html = await response.text();
      console.log('✅ Scorecard V6 endpoint working!');
      console.log(`📄 Generated HTML length: ${html.length} characters`);
      
      // Save to file
      const fs = require('fs');
      fs.writeFileSync('test-scorecard-v6-output.html', html);
      console.log('💾 HTML saved to test-scorecard-v6-output.html');
    } else {
      console.log('❌ Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testScorecardV6();
