import { OpenAI } from 'openai';
import { API_CONFIG } from '@/lib/constants';
import { SYSTEM_PROMPT, formatProductsForAI } from './prompt';

// Note: In production, this should be server-side only
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true, // Only for demo - use API routes in production
});

export interface StreamingOptions {
  onChunk: (chunk: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export async function streamChat(
  message: string,
  language: string,
  products: any[],
  options: StreamingOptions
) {
  try {
    const stream = await openai.chat.completions.create({
      model: API_CONFIG.OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT(language, formatProductsForAI(products)),
        },
        {
          role: 'user',
          content: message,
        },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
    });

    let buffer = '';
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        buffer += content;
        
        // Emit chunks for smooth streaming
        if (buffer.length >= API_CONFIG.STREAM_CHUNK_SIZE) {
          options.onChunk(buffer);
          buffer = '';
        }
      }
    }

    // Emit any remaining content
    if (buffer) {
      options.onChunk(buffer);
    }

    options.onComplete();
  } catch (error) {
    options.onError(error as Error);
  }
}