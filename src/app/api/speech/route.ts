import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const OPENAI_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('file') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No audio file provided' 
        },
        { status: 400 }
      );
    }

    // Validate file size (max 25MB for Whisper)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Audio file too large (max 25MB)' 
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['webm', 'mp4', 'wav', 'ogg', 'mpeg', 'm4a'];
    const fileExtension = audioFile.name.split('.').pop()?.toLowerCase();
    const isValidType = allowedTypes.some(type => 
      audioFile.type.includes(type) || fileExtension === type
    );

    if (!isValidType) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid audio format. Supported: webm, mp4, wav, ogg, mpeg, m4a' 
        },
        { status: 400 }
      );
    }

    console.log(`Processing audio file: ${audioFile.name}, size: ${audioFile.size} bytes, type: ${audioFile.type}`);

    try {
      // Use OpenAI Whisper for speech transcription with language auto-detection
      console.log('Sending audio to OpenAI Whisper API...');
      
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        response_format: 'json',
        language: undefined, // Auto-detect language
      });

      console.log('OpenAI Whisper response:', transcription);

      if (!transcription.text || transcription.text.trim() === '') {
        return NextResponse.json(
          { 
            success: false,
            error: 'No speech detected in audio' 
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        text: transcription.text.trim(),
        language: transcription.language || 'en',
        success: true
      });

    } catch (whisperError: any) {
      console.error('Whisper API Error:', whisperError);
      
      // Handle specific OpenAI errors
      if (whisperError.status === 400) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid audio format or corrupted file' 
          },
          { status: 400 }
        );
      } else if (whisperError.status === 429) {
        return NextResponse.json(
          { 
            success: false,
            error: 'API rate limit exceeded. Please try again later.',
            fallbackToWebSpeech: true
          },
          { status: 429 }
        );
      } else if (whisperError.status === 401) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid API key',
            fallbackToWebSpeech: true
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Speech transcription failed', 
          details: whisperError.message || 'Unknown error',
          fallbackToWebSpeech: true
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Speech API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process audio request', 
        details: error instanceof Error ? error.message : 'Unknown error',
        fallbackToWebSpeech: true
      },
      { status: 500 }
    );
  }
}