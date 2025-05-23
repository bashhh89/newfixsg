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
        console.log('[Get Report API] Firebase Admin initialized with service account key.');
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
      console.log('[Get Report API] Firebase Admin initialized with client email and private key.');
    } else {
      throw new Error('Firebase Admin SDK configuration is missing. Required environment variables: NEXT_PUBLIC_FIREBASE_PROJECT_ID and either FIREBASE_SERVICE_ACCOUNT_KEY or both FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY');
    }
    
    db = admin.firestore();
    console.log('[Get Report API] Firebase Admin initialized successfully.');
  } catch (error: any) {
    console.error('[Get Report API] CRITICAL: Firebase Admin initialization error:', error.message);
    // db will remain undefined, and subsequent checks will handle this
  }
} else {
  db = admin.firestore();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reportId = searchParams.get('reportId');

  if (!reportId) {
    return new NextResponse('Error: reportId is required', { status: 400 });
  }

  if (!db) {
    console.error('[Get Report API] Firestore not initialized. Cannot process request.');
    return new NextResponse('Internal Server Error: Database connection not available.', { status: 500 });
  }

  try {
    console.log(`[Get Report API] Attempting to fetch report for reportId: ${reportId}`);

    const reportRef = db.collection('scorecardReports').doc(reportId);
    const reportDoc = await reportRef.get();

    if (!reportDoc.exists) {
      console.error(`[Get Report API] Report ${reportId} not found in Firestore.`);
      return new NextResponse(`Error: Report with ID ${reportId} not found.`, { status: 404 });
    }

    const reportData = reportDoc.data();
    if (!reportData) {
      console.error(`[Get Report API] Report data is empty for ${reportId}.`);
      return new NextResponse(`Error: Report data is empty for ID ${reportId}.`, { status: 404 });
    }

    // Set default report markdown if none exists
    if (!reportData.reportMarkdown) {
      reportData.reportMarkdown = '# Report Content Not Available\n\nCould not find report content.';
    }

    // Ensure questionAnswerHistory is an array
    if (!reportData.questionAnswerHistory) {
      reportData.questionAnswerHistory = [];
    }

    console.log('[Get Report API] Report data retrieved successfully.');

    // Return the report data
    return NextResponse.json({
      reportId,
      ...reportData
    });

  } catch (error: any) {
    console.error(`[Get Report API] Error fetching report ${reportId}:`, error);
    return new NextResponse(`Error fetching report: ${error.message}`, { status: 500 });
  }
} 