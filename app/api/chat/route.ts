import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    const apiKey = process.env.QWEN_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://calcai-five.vercel.app/',
          'X-Title': 'CalcAI',
          'User-Agent': 'CalcAI/1.0.0'
        },
        body: JSON.stringify({
          model: 'qwen/qwq-32b:free',
          messages: messages.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          temperature: 0.3,
          max_tokens: 500,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle non-200 responses
      if (!response.ok) {
        return NextResponse.json(
          { error: `API Error: ${response.statusText}` },
          { status: response.status }
        );
      }

      const data = await response.json();

      // Validate response format
      if (!data?.choices?.[0]?.message?.content) {
        return NextResponse.json(
          { error: 'Invalid response format' },
          { status: 500 }
        );
      }

      // Get the response content
      let content = data.choices[0].message.content.trim();

      // Clean up the content
      content = content
        .replace(/^(Okay,|Well,|I think|Let me|I will|I can|Here's|Sure)\s*/i, '')
        .replace(/\s*\(.*?\)/g, '')
        .replace(/\[[^\]]*\]/g, '')
        .trim();

      if (!content) {
        content = "Hi! How can I assist you today?";
      }

      return NextResponse.json({
        content,
        role: 'assistant'
      });

    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return NextResponse.json(
            { error: 'Request timed out' },
            { status: 504 }
          );
        }
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: 'An unexpected error occurred' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
} 