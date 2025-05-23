console.log('[PDF-TEST] Route file loaded by Next.js');

import { NextRequest, NextResponse } from 'next/server';
import PdfPrinter from 'pdfmake';
import fs from 'fs';
import path from 'path';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  console.log('[PDF-TEST] GET handler reached');

  try {
    // Load fonts
    const regularFontPath = path.join(process.cwd(), 'public', 'fonts', 'PlusJakartaSans-Regular.ttf');
    const boldFontPath = path.join(process.cwd(), 'public', 'fonts', 'PlusJakartaSans-Bold.ttf');

    // Check if fonts exist
    if (!fs.existsSync(regularFontPath) || !fs.existsSync(boldFontPath)) {
      console.error(`[PDF-TEST] Font files missing: reg=${fs.existsSync(regularFontPath)}, bold=${fs.existsSync(boldFontPath)}`);
      return NextResponse.json(
        { success: false, message: 'Font files not found' },
        { status: 500 }
      );
    }

    // Load font files
    const regularFontBuffer = fs.readFileSync(regularFontPath);
    const boldFontBuffer = fs.readFileSync(boldFontPath);
    
    // Define fonts - using buffers directly
    const fonts = {
      PlusJakartaSans: {
        normal: regularFontBuffer,
        bold: boldFontBuffer,
      },
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Bold.ttf',
      }
    };

    // Create PDF printer
    const printer = new PdfPrinter(fonts);

    // Define a super-simple document
    const docDefinition = {
      content: [
        { text: 'PDF Generation Test', fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        { text: 'This is a basic test document to verify PDF generation works.' },
        { text: 'If you can see this PDF, the route is working correctly!', bold: true, margin: [0, 20, 0, 0] }
      ],
      defaultStyle: {
        font: 'PlusJakartaSans'
      }
    };

    // Generate PDF
    console.log('[PDF-TEST] Creating PDF document');
    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    return new Promise<NextResponse>((resolve) => {
      const chunks = [];
      
      pdfDoc.on('data', (chunk) => {
        console.log('[PDF-TEST] Received chunk of PDF data');
        chunks.push(chunk);
      });
      
      pdfDoc.on('end', () => {
        const result = Buffer.concat(chunks);
        console.log('[PDF-TEST] PDF generated successfully, size:', result.length);
        
        resolve(
          new NextResponse(result, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'attachment; filename="test.pdf"',
              'Content-Length': result.length.toString()
            }
          })
        );
      });
      
      // End the document to flush the output
      pdfDoc.end();
    });
  } catch (error) {
    console.error('[PDF-TEST] Error:', error);
    return NextResponse.json(
      { success: false, message: `Error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 