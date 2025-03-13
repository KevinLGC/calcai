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
      console.error('QWEN_API_KEY environment variable is not set')
      return NextResponse.json(
        { error: 'API key not configured. Please set the QWEN_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://calcai-five.vercel.app',
            'X-Title': 'CalcAI',
            'HTTP-User-Agent': 'CalcAI/1.0.0'
          },
          body: JSON.stringify({
            model: 'qwen/qwq-32b:free',
            messages: messages.map((msg: any) => ({
              role: msg.role === 'user' ? 'user' : 'assistant',
              content: msg.content,
            })),
            temperature: 0.7,
            max_tokens: 800,
            stream: false
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.error('OpenRouter API Error:', {
            status: response.status,
            statusText: response.statusText
          });
          
          // Try to get error details from response
          let errorDetails = '';
          try {
            const errorData = await response.json();
            errorDetails = errorData.error?.message || JSON.stringify(errorData);
          } catch {
            errorDetails = await response.text();
          }

          return NextResponse.json(
            { error: `API Error (${response.status}): ${errorDetails}` },
            { status: response.status }
          );
        }

        const data = await response.json();
        
        // Log the response data
        console.log('OpenRouter API Response:', {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          data: data
        });

        if (!data.choices?.[0]?.message) {
          console.error('Invalid API response format:', data);
          return NextResponse.json(
            { error: 'Invalid response format from API' },
            { status: 500 }
          );
        }

        let content = '';
        const message = data.choices[0].message;

        if (typeof message === 'string') {
          content = message;
        } else if (typeof message === 'object') {
          content = message.content || message.text || '';
        }

        if (!content) {
          console.error('Empty response content:', data);
          return NextResponse.json(
            { error: 'Empty response from API' },
            { status: 500 }
          );
        }

        // Clean up the content
        content = content
          .replace(/\*\*/g, '')
          .replace(/###/g, '')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\times/g, 'times')
          .replace(/\\/g, '')
          .replace(/\s+/g, ' ')
          .replace(/^(?:Okay,|Well,|I think|I should say|Maybe|Let me|I will|I can)\s*/i, '')
          .replace(/(?:\. Let me|\. I will|\. I should|\. I think|\. Maybe).*$/, '.')
          .replace(/^.*?(?:Here's my response:|Here's what I'll say:|I'll respond with:|I'll say:)\s*/i, '')
          .replace(/^(?:the user said|user said|they said|I see that|I notice that)\s+["'].*?["']/i, '')
          .replace(/^(?:the user|user|they)\s+(?:is asking|asked|says|said)\s+.*?\./i, '')
          .replace(/n+$/, '')
          .trim();

        if (!content.trim()) {
          content = "Hi! How can I assist you today?";
        }

        return NextResponse.json({
          content,
          role: 'assistant'
        });

      } catch (fetchError: unknown) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof Error) {
          if (fetchError.name === 'AbortError') {
            return NextResponse.json(
              { error: 'Request timed out. Please try again.' },
              { status: 504 }
            );
          }
          
          console.error('Fetch error:', fetchError);
          return NextResponse.json(
            { error: 'Failed to connect to API: ' + fetchError.message },
            { status: 503 }
          );
        }

        return NextResponse.json(
          { error: 'Failed to connect to API' },
          { status: 503 }
        );
      }

    } catch (error: unknown) {
      console.error('Request processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json(
        { error: 'Failed to process request: ' + errorMessage },
        { status: 500 }
      );
    }
  } catch (parseError: unknown) {
    console.error('JSON parsing error:', parseError);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
} 