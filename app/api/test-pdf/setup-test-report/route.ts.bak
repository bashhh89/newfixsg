import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Ensure this route is always dynamically rendered
export const dynamic = 'force-dynamic';

// Initialize Firebase Admin if not already initialized
let db: admin.firestore.Firestore;
if (!admin.apps.length) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    // Initialize with service account key if available
    if (serviceAccountKey) {
      try {
        const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString('utf8');
        const serviceAccount = JSON.parse(decodedKey);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('[Setup Test Report API] Firebase Admin initialized with service account key.');
      } catch (error: any) {
        throw new Error(`Failed to decode service account key: ${error.message}`);
      }
    } 
    // Otherwise initialize with client email and private key
    else if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
      console.log('[Setup Test Report API] Firebase Admin initialized with client email and private key.');
    } else {
      throw new Error('Firebase Admin SDK configuration is missing. Required environment variables: NEXT_PUBLIC_FIREBASE_PROJECT_ID and either FIREBASE_SERVICE_ACCOUNT_KEY or both FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY');
    }
    
    db = admin.firestore();
    console.log('[Setup Test Report API] Firebase Admin initialized successfully.');
  } catch (error: any) {
    console.error('[Setup Test Report API] CRITICAL: Firebase Admin initialization error:', error.message);
    // db will remain undefined, and subsequent checks will handle this
  }
} else {
  db = admin.firestore();
}

export async function GET(req: NextRequest) {
  if (!db) {
    console.error('[Setup Test Report API] Firestore not initialized. Cannot process request.');
    return new NextResponse('Internal Server Error: Database connection not available.', { status: 500 });
  }

  try {
    console.log('[Setup Test Report API] Setting up test report...');
    
    // Create a simple test report data
    const testReportData = {
      reportMarkdown: '# Test Report\n\nThis is a test report generated to verify PDF functionality.\n\n## Key Findings\n\n- Finding 1\n- Finding 2\n- Finding 3\n\n## Recommendations\n\n1. First recommendation\n2. Second recommendation\n3. Third recommendation',
      questionAnswerHistory: [
        {
          question: 'Test Question 1?',
          answer: 'Test Answer 1',
          reasoning: 'Test reasoning'
        },
        {
          question: 'Test Question 2?',
          answer: 'Test Answer 2'
        }
      ],
      leadName: 'Test User',
      leadCompany: 'Test Company',
      industry: 'Technology',
      userAITier: 'Leader',
      finalScore: 85,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save the test report to Firestore
    await db.collection('scorecardReports').doc('test-123').set(testReportData);

    console.log('[Setup Test Report API] Test report created successfully.');

    return NextResponse.json({
      success: true,
      message: 'Test report created successfully',
      reportId: 'test-123'
    });

  } catch (error: any) {
    console.error(`[Setup Test Report API] Error creating test report:`, error);
    return new NextResponse(`Error creating test report: ${error.message}`, { status: 500 });
  }
} 