import { NextRequest, NextResponse } from 'next/server';
import { detectLanguage } from '../../../lib/language-detection';
import { generateChatResponse } from '../../../lib/openai';
import { createSystemPrompt } from '../../../lib/system-prompt';
import productsData from '../../../data/products.json';

export async function POST(request: NextRequest) {
  try {
    const { message, language } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.' },
        { status: 500 }
      );
    }

    // Use provided language or detect from message
    const detectedLanguage = language || detectLanguage(message);
    
    console.log('=== CHAT API REQUEST ===');
    console.log('Message:', message);
    console.log('Provided Language:', language);
    console.log('Final Language:', detectedLanguage);
    console.log('=======================');
    
    // Format products data for the system prompt
    const catalogData = JSON.stringify(productsData, null, 2);
    
    // Create system prompt with detected language and product catalog
    const systemPrompt = createSystemPrompt(detectedLanguage, catalogData);
    
    try {
      // Generate response using OpenAI
      const stream = await generateChatResponse(message, systemPrompt, detectedLanguage);
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Accept-Charset': 'utf-8',
        },
      });
    } catch (openAIError) {
      console.error('OpenAI API error:', openAIError);
      
      // Fallback to a helpful error message
      const encoder = new TextEncoder();
      const errorStream = new ReadableStream({
        async start(controller) {
          const errorMessage = detectedLanguage === 'es' 
            ? 'Lo siento, estoy teniendo problemas técnicos. Por favor, intenta de nuevo.'
            : detectedLanguage === 'fr'
            ? 'Désolé, je rencontre des problèmes techniques. Veuillez réessayer.'
            : 'I\'m sorry, I\'m experiencing technical difficulties. Please try again.';
          
          const data = JSON.stringify({
            content: errorMessage,
            language: detectedLanguage,
            done: false
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          
          const finalData = JSON.stringify({
            content: '',
            language: detectedLanguage,
            done: true
          });
          controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
          controller.close();
        }
      });
      
      return new Response(errorStream, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Accept-Charset': 'utf-8',
        },
      });
    }

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process your request', details: String(error) },
      { status: 500 }
    );
  }
}