import { NextResponse } from 'next/server';
import { GroqProvider } from '@/lib/ai-providers';

// Add GET handler to prevent 404 errors
export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint requires a POST request with a prompt' },
    { status: 404 }
  );
}

export async function POST(req: Request) {
  try {
    // Get request body
    const body = await req.json();
    const { prompt, systemPrompt, maxTokens = 1000 } = body;
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Initialize the Groq provider with environment variables
    const groqProvider = new GroqProvider(
      process.env.GROQ_API_KEY,
      process.env.DEV_AI_MODEL || 'qwen-qwq-32b'
    );

    // Check if Groq is available
    if (!(await groqProvider.isAvailable())) {
      return NextResponse.json(
        { error: 'Groq API is not available or not properly configured' },
        { status: 503 }
      );
    }

    // Generate the completion
    const result = await groqProvider.generateReport(
      systemPrompt || "You are a helpful AI assistant for answering questions accurately.",
      prompt
    );

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Error in Groq API route:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 