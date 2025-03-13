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
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      // Log the request we're sending
      const requestBody = {
        model: 'qwen/qwq-32b:free',
        messages: messages.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        temperature: 0.3,
        max_tokens: 500,
        stream: false
      };

      console.log('Sending request to OpenRouter:', requestBody);

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://calcai-five.vercel.app/',
          'X-Title': 'CalcAI',
          'User-Agent': 'CalcAI/1.0.0'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Log response status and headers
      console.log('OpenRouter Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter Error Response:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          return NextResponse.json(
            { error: errorJson.error?.message || 'API Error' },
            { status: response.status }
          );
        } catch {
          return NextResponse.json(
            { error: `API Error: ${errorText.slice(0, 100)}` },
            { status: response.status }
          );
        }
      }

      const rawText = await response.text();
      console.log('Raw API Response:', rawText);

      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        console.error('Failed to parse API response:', e);
        return NextResponse.json(
          { error: 'Invalid JSON response from API' },
          { status: 500 }
        );
      }

      console.log('Parsed API Response:', data);

      // Check response structure
      if (!data || typeof data !== 'object') {
        return NextResponse.json(
          { error: 'Invalid response structure' },
          { status: 500 }
        );
      }

      // Extract message content with fallbacks
      let content = '';
      
      if (data.choices?.[0]?.message?.content) {
        content = data.choices[0].message.content;
      } else if (data.choices?.[0]?.text) {
        content = data.choices[0].text;
      } else if (data.choices?.[0]?.message) {
        content = JSON.stringify(data.choices[0].message);
      }

      if (!content) {
        console.error('No content in response:', data);
        return NextResponse.json(
          { error: 'No content in API response' },
          { status: 500 }
        );
      }

      // Clean up the content
      content = content
        .replace(/^(Okay,|Well,|I think|Let me|I will|I can|Here's|Sure)\s*/i, '')
        .replace(/\s*\(.*?\)/g, '')
        .replace(/\[[^\]]*\]/g, '')
        .replace(/^The user asked about\s*/i, '')
        .replace(/^To answer your question,\s*/i, '')
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
        console.error('Request error:', error);
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
    console.error('Request parsing error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
} 