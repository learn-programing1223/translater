import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateChatResponse(
  message: string,
  systemPrompt: string,
  language: string
): Promise<ReadableStream> {
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 500,
    });

    // Create a TransformStream to convert OpenAI's stream to our format
    const encoder = new TextEncoder();
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        try {
          const content = chunk.choices[0]?.delta?.content || '';
          
          if (content) {
            const data = JSON.stringify({
              content,
              language,
              done: false
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
          
          // Check if stream is finished
          if (chunk.choices[0]?.finish_reason === 'stop') {
            const finalData = JSON.stringify({
              content: '',
              language,
              done: true
            });
            controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
          }
        } catch (error) {
          console.error('Transform error:', error);
        }
      },
    });

    // Convert the async iterable to a ReadableStream
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const writer = transformStream.writable.getWriter();
            await writer.write(chunk);
            writer.releaseLock();
          }
          
          // Close the transform stream
          const writer = transformStream.writable.getWriter();
          await writer.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    // Return the readable side of the transform stream
    return transformStream.readable;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

export { openai };