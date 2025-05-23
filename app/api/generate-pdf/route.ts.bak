import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
// Import React PDF renderer
import ReactPDF from '@react-pdf/renderer';
import ScorecardPDFDocument from '../../../components/ui/pdf-download/ScorecardPDFDocument';
// Import React for JSX support
import React from 'react';
// Note: If you get type declaration errors for markdown-it, consider installing @types/markdown-it
import MarkdownIt from 'markdown-it';

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
        console.log('[PDF API] Firebase Admin initialized with service account key.');
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
      console.log('[PDF API] Firebase Admin initialized with client email and private key.');
    } else {
      throw new Error('Firebase Admin SDK configuration is missing. Required environment variables: NEXT_PUBLIC_FIREBASE_PROJECT_ID and either FIREBASE_SERVICE_ACCOUNT_KEY or both FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY');
    }
    
    db = admin.firestore();
    console.log('[PDF API] Firebase Admin initialized successfully.');
  } catch (error: any) {
    console.error('[PDF API] CRITICAL: Firebase Admin initialization error:', error.message);
    // db will remain undefined, and subsequent checks will handle this
  }
} else {
  db = admin.firestore();
}

const md = new MarkdownIt({
  html: true, // Allow HTML tags in Markdown
  linkify: true, // Autoconvert URL-like text to links
  typographer: true, // Enable some language-neutral replacement + quotes beautification
});


function formatQuestionAnswerHistoryAsHtml(qaHistory: any[]): string {
  if (!qaHistory || qaHistory.length === 0) {
    return '<p>No question and answer history available.</p>';
  }
  let html = '<div class="qna-section">';
  html += '<h2>Full Assessment Q&A History</h2>';
  
  // Add deduplication logic to prevent consecutive identical entries
  const deduplicatedHistory = [];
  for (let i = 0; i < qaHistory.length; i++) {
    // Skip if this entry is identical to the previous one
    if (i > 0 && 
        qaHistory[i].question === qaHistory[i-1].question && 
        JSON.stringify(qaHistory[i].answer) === JSON.stringify(qaHistory[i-1].answer)) {
      console.log(`[PDF API] Skipping duplicate Q&A entry at index ${i}: ${qaHistory[i].question.substring(0, 30)}...`);
      continue;
    }
    deduplicatedHistory.push(qaHistory[i]);
  }
  
  deduplicatedHistory.forEach((item, index) => {
    const question = item.question || 'N/A';
    let answer = item.answer || 'Not answered';
    if (Array.isArray(answer)) {
      answer = answer.join(', ');
    } else if (typeof answer === 'object' && answer !== null) {
      answer = JSON.stringify(answer, null, 2);
      answer = `<pre>${answer}</pre>`; // Format JSON nicely
    }
    const reasoning = item.reasoning || item.thinking || '';
    const questionType = item.type || '';

    html += `
      <div class="qna-item">
        <p class="question"><strong>Q${index + 1}: ${question}</strong> ${questionType ? `<em class="question-type">(${questionType})</em>` : ''}</p>
        <div class="answer"><strong>A:</strong> ${answer}</div>
        ${reasoning ? `<div class="reasoning"><strong>Context/Reasoning:</strong> ${reasoning}</div>` : ''}
      </div>
    `;
  });
  html += '</div>';
  return html;
}


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reportId = searchParams.get('reportId');

  if (!reportId) {
    return NextResponse.json({ 
      success: false, 
      message: 'Error: reportId is required'
    }, { status: 400 });
  }

  if (!db) {
    console.error('[PDF API] Firestore not initialized. Cannot process request.');
    return NextResponse.json({ 
      success: false, 
      message: 'Internal Server Error: Database connection not available.'
    }, { status: 500 });
  }

  try {
    console.log(`[PDF API] Checking if report exists: ${reportId}`);

    const reportRef = db.collection('scorecardReports').doc(reportId);
    const reportDoc = await reportRef.get();

    if (!reportDoc.exists) {
      console.error(`[PDF API] Report ${reportId} not found in Firestore.`);
      return NextResponse.json({ 
        success: false, 
        message: `Error: Report with ID ${reportId} not found.`
      }, { status: 404 });
    }

    // Report exists, redirect to client-side PDF generation page
    console.log(`[PDF API] Report exists, redirecting to client PDF viewer: ${reportId}`);
    
    // Return a redirect to the client-side PDF generation page
    const url = new URL(`/scorecard/pdf-view`, req.nextUrl.origin);
    url.searchParams.set('reportId', reportId);
    
    return NextResponse.redirect(url.toString());
  } catch (error: any) {
    console.error(`[PDF API] Error checking report ${reportId}:`, error);
    return NextResponse.json({ 
      success: false, 
      message: `Internal Server Error: ${error.message}`
    }, { status: 500 });
  }
} 