import { NextResponse } from 'next/server';
import { PollinationsProvider, GoogleProvider, OpenAIProvider } from '@/lib/ai-providers';

// Add GET handler to prevent 404 errors
export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint requires a POST request with a prompt' },
    { status: 404 }
  );
}

export async function POST(req: Request) {
  try {
    console.log("AUTO-ANSWER: API request received");
    
    // Check environment variables first
    const envStatus = {
      GOOGLE_API_KEY: !!process.env.GOOGLE_API_KEY,
      GOOGLE_GENERATIVE_AI_API_KEY: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      GOOGLE_MODEL: process.env.GOOGLE_MODEL || 'not set, using default',
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      OPENAI_MODEL: process.env.OPENAI_MODEL || 'not set, using default',
      POLLINATIONS_MODEL: process.env.POLLINATIONS_MODEL || 'not set, using default',
    };
    console.log("AUTO-ANSWER: Environment variables status:", envStatus);
    
    // Parse the request body
    const body = await req.json();
    const { prompt, systemPrompt = "You are an AI assistant tasked with providing brief, accurate answers to questions.", maxTokens = 1000 } = body;
    
    console.log(`AUTO-ANSWER: Request body parsed, prompt length: ${prompt?.length || 0}`);
    
    if (!prompt) {
      console.error("AUTO-ANSWER: Missing required 'prompt' parameter");
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    let result;
    let provider = "unknown";
    let debugInfo = {
      pollinationsAvailable: false,
      googlePrimaryAvailable: false,
      googleFallbackAvailable: false,
      openaiAvailable: false,
      errors: []
    };

    // Try Pollinations first (Primary for auto-answers)
    try {
      console.log("AUTO-ANSWER: Attempting to use Pollinations with openai-large model");
      // Use the environment variable if available or default to openai-large
      const pollinationsModel = process.env.POLLINATIONS_MODEL || 'openai-large';
      const pollinationsProvider = new PollinationsProvider(
        'https://text.pollinations.ai/openai',
        pollinationsModel
      );
      
      // Log the model being used
      console.log(`AUTO-ANSWER: Using Pollinations model: ${pollinationsModel}`);
      
      const isAvailable = await pollinationsProvider.isAvailable();
      debugInfo.pollinationsAvailable = isAvailable;
      
      if (isAvailable) {
        console.log("AUTO-ANSWER: Pollinations is available, generating response");
        result = await pollinationsProvider.generateReport(systemPrompt, prompt);
        provider = `Pollinations (${pollinationsModel})`;
        console.log("AUTO-ANSWER: Successfully generated answer using Pollinations");
      } else {
        console.warn("AUTO-ANSWER: Pollinations provider is not available");
      }
    } catch (error: any) {
      debugInfo.errors.push({
        provider: "Pollinations",
        message: error.message,
        stack: error.stack
      });
      console.warn("AUTO-ANSWER: Error using Pollinations provider:", error.message);
    }

    // If Pollinations failed, try Google Gemini (primary model)
    if (!result) {
      try {
        // Check for both possible API key environment variables
        const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (googleApiKey) {
          // Get the model from environment variable or use a default
          const googleModel = process.env.GOOGLE_MODEL || 'gemini-1.5-flash';
          console.log(`AUTO-ANSWER: Attempting to use Google Gemini with ${googleModel} model`);
          
          const googleProvider = new GoogleProvider(
            googleApiKey,
            googleModel
          );
          
          const isAvailable = await googleProvider.isAvailable();
          debugInfo.googlePrimaryAvailable = isAvailable;
          
          if (isAvailable) {
            console.log("AUTO-ANSWER: Google Gemini primary model is available, generating response");
            result = await googleProvider.generateReport(systemPrompt, prompt);
            provider = `Google Gemini (${googleModel})`;
            console.log("AUTO-ANSWER: Successfully generated answer using Google Gemini primary model");
          } else {
            console.warn("AUTO-ANSWER: Google Gemini primary model is not available");
          }
        } else {
          console.warn("AUTO-ANSWER: Google API key not found. Please set GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY environment variable.");
          debugInfo.errors.push({
            provider: "Google Primary",
            message: "API key not found"
          });
        }
      } catch (error: any) {
        debugInfo.errors.push({
          provider: "Google Primary",
          message: error.message,
          stack: error.stack
        });
        console.warn("AUTO-ANSWER: Error using Google Gemini primary model:", error.message);
      }
    }

    // If primary Google Gemini failed, try fallback Google Gemini model
    if (!result) {
      try {
        const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (googleApiKey) {
          // Use a more reliable fallback model
          const fallbackModel = 'gemini-1.0-pro';
          console.log(`AUTO-ANSWER: Attempting to use fallback Google Gemini model ${fallbackModel}`);
          
          const fallbackGoogleProvider = new GoogleProvider(
            googleApiKey,
            fallbackModel
          );
          
          const isAvailable = await fallbackGoogleProvider.isAvailable();
          debugInfo.googleFallbackAvailable = isAvailable;
          
          if (isAvailable) {
            console.log("AUTO-ANSWER: Google Gemini fallback model is available, generating response");
            result = await fallbackGoogleProvider.generateReport(systemPrompt, prompt);
            provider = `Google Gemini (${fallbackModel})`;
            console.log("AUTO-ANSWER: Successfully generated answer using Google Gemini fallback model");
          } else {
            console.warn("AUTO-ANSWER: Google Gemini fallback model is not available");
          }
        } else {
          debugInfo.errors.push({
            provider: "Google Fallback",
            message: "API key not found"
          });
        }
      } catch (error: any) {
        debugInfo.errors.push({
          provider: "Google Fallback",
          message: error.message,
          stack: error.stack
        });
        console.warn("AUTO-ANSWER: Error using Google Gemini fallback model:", error.message);
      }
    }

    // Final fallback to OpenAI if everything else failed
    if (!result) {
      try {
        const openAIApiKey = process.env.OPENAI_API_KEY;
        if (openAIApiKey) {
          // Use the configured model or default to gpt-4o
          const openAIModel = process.env.OPENAI_MODEL || 'gpt-4o';
          console.log(`AUTO-ANSWER: All other providers failed. Attempting to use OpenAI (${openAIModel}) as final fallback`);
          
          const openAIProvider = new OpenAIProvider(
            openAIApiKey,
            openAIModel
          );
          
          const isAvailable = await openAIProvider.isAvailable();
          debugInfo.openaiAvailable = isAvailable;
          
          if (isAvailable) {
            console.log("AUTO-ANSWER: OpenAI is available, generating response as last resort");
            result = await openAIProvider.generateReport(systemPrompt, prompt);
            provider = `OpenAI (${openAIModel})`;
            console.log("AUTO-ANSWER: Successfully generated answer using OpenAI as fallback");
          } else {
            console.warn("AUTO-ANSWER: OpenAI provider is not available");
          }
        } else {
          debugInfo.errors.push({
            provider: "OpenAI Fallback",
            message: "API key not found"
          });
        }
      } catch (error: any) {
        debugInfo.errors.push({
          provider: "OpenAI Fallback",
          message: error.message,
          stack: error.stack
        });
        console.warn("AUTO-ANSWER: Error using OpenAI fallback:", error.message);
      }
    }

    // If all attempts failed, return a clear error indicating API key issues
    if (!result) {
      console.error("AUTO-ANSWER: All configured providers failed to generate an answer", JSON.stringify(debugInfo, null, 2));
      
      // Check if the issue is related to missing API keys
      const isMissingKeys = !process.env.GOOGLE_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.OPENAI_API_KEY;
      const errorMessage = isMissingKeys 
        ? 'Auto-answer providers failed: API keys are missing. Please configure GOOGLE_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, or OPENAI_API_KEY in .env.local file.' 
        : 'All configured AI providers failed to generate an answer';
      
      return NextResponse.json(
        { 
          error: errorMessage,
          debugInfo,
          missingKeys: isMissingKeys
        },
        { status: 500 }
      );
    }

    console.log(`AUTO-ANSWER: Success! Response generated by ${provider}`);
    return NextResponse.json({ 
      result, 
      provider,
      status: 'success' 
    });
    
  } catch (error: any) {
    console.error('Error in auto-answer API route:', error);
    return NextResponse.json(
      { 
        error: error.message || 'An error occurred while processing your request',
        stack: error.stack,
        type: error.constructor.name
      },
      { status: 500 }
    );
  }
} 