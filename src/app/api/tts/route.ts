import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const OPENAI_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, language } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    // Choose voice based on language
    const getVoiceForLanguage = (lang: string): string => {
      const voiceMap: { [key: string]: string } = {
        'en': 'alloy',
        'es': 'nova',
        'fr': 'echo',
        'de': 'fable',
        'it': 'onyx',
        'pt': 'shimmer',
        'zh': 'alloy',
        'ja': 'echo',
        'ko': 'nova',
        'ar': 'fable',
        'hi': 'onyx',
        'ru': 'shimmer',
        'th': 'alloy'
      };
      
      return voiceMap[lang] || 'alloy';
    };

    try {
      // For development: Mock TTS response since OpenAI quota exceeded
      // In production, this would use OpenAI TTS
      
      // Return mock success to trigger browser TTS fallback
      return NextResponse.json({
        success: false,
        error: 'Mock TTS - using browser fallback',
        fallbackToBrowser: true
      }, { status: 500 });

    } catch (ttsError) {
      console.error('TTS generation failed:', ttsError);
      
      return NextResponse.json({
        success: false,
        error: 'Text-to-speech failed',
        fallbackToBrowser: true
      }, { status: 500 });
    }

  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate speech', 
        details: String(error) 
      },
      { status: 500 }
    );
  }
}