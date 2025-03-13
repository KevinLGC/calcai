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
      const timeoutId = setTimeout(() => controller.abort(), 50000); // 50 second timeout

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
      })

      clearTimeout(timeoutId);

      console.log('OpenRouter API Response Status:', response.status)
      console.log('OpenRouter API Response Headers:', Object.fromEntries(response.headers.entries()))
      
      // Handle non-JSON responses
      const responseText = await response.text();
      console.log('Raw API Response:', responseText)
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse API response:', responseText);
        return NextResponse.json(
          { error: 'Invalid response from API: ' + responseText.slice(0, 100) },
          { status: 500 }
        );
      }
      
      // Log the full response data with proper stringification
      console.log('OpenRouter API Response Data:', JSON.stringify(data, null, 2))

      if (!response.ok) {
        const errorMessage = data.error?.message || responseText;
        console.error('OpenRouter API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorMessage,
          fullResponse: data
        })
        return NextResponse.json(
          { error: `API Error: ${errorMessage}` },
          { status: response.status }
        )
      }

      // Log the exact structure we receive
      console.log('Full response structure:', {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length,
        firstChoice: data.choices?.[0],
        messageType: typeof data.choices?.[0]?.message,
        messageContent: data.choices?.[0]?.message?.content,
        rawMessage: data.choices?.[0]?.message
      })

      const message = data.choices?.[0]?.message
      if (!message) {
        console.error('No message in response:', data)
        return NextResponse.json(
          { error: 'No message received from API' },
          { status: 500 }
        )
      }

      // Try to get content from different possible locations in the response
      let content = ''
      
      if (typeof message === 'string') {
        content = message
      } else if (typeof message === 'object') {
        // First try to get direct content
        content = message.content || message.text || ''

        // Remove any meta-commentary about the user's message
        content = content.replace(/^(?:the user said|user said|they said|I see that|I notice that)\s+["'].*?["']/i, '')
        content = content.replace(/^(?:the user|user|they)\s+(?:is asking|asked|says|said)\s+.*?\./i, '')
      }

      // If still no content, try to get it from the raw response
      if (!content) {
        if (data.choices?.[0]?.text) {
          content = data.choices[0].text
        } else if (typeof data.choices?.[0] === 'string') {
          content = data.choices[0]
        }
      }
      
      if (!content) {
        console.error('Empty response content. Full response:', JSON.stringify(data, null, 2))
        return NextResponse.json(
          { error: 'No content found in API response' },
          { status: 500 }
        )
      }

      // Clean up the content by removing unnecessary symbols and internal dialogue
      content = content
        .replace(/\*\*/g, '') // Remove **
        .replace(/###/g, '') // Remove ###
        .replace(/\\\(/g, '(') // Replace \( with (
        .replace(/\\\)/g, ')') // Replace \) with )
        .replace(/\\times/g, 'times') // Replace \times with times
        .replace(/\\/g, '') // Remove any remaining backslashes
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/^(?:Okay,|Well,|I think|I should say|Maybe|Let me|I will|I can)\s*/i, '') // Remove thinking prefixes
        .replace(/(?:\. Let me|\. I will|\. I should|\. I think|\. Maybe).*$/, '.') // Remove internal dialogue
        .replace(/^.*?(?:Here's my response:|Here's what I'll say:|I'll respond with:|I'll say:)\s*/i, '') // Remove response prefixes
        .replace(/n+$/, '') // Remove trailing 'n' characters
        .trim(); // Remove leading/trailing whitespace

      // If content is still empty or just meta-commentary, provide a default response
      if (!content.trim() || content.match(/^(?:the user|user|they|I see|I notice)/i)) {
        content = "Hi! How can I assist you today?";
      }

      return NextResponse.json({
        content,
        role: 'assistant'
      })
    } catch (fetchError) {
      console.error('Fetch error:', fetchError)
      let errorMessage = 'Failed to connect to OpenRouter API';
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.';
        } else {
          errorMessage = `${errorMessage}: ${fetchError.message}`;
        }
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: 504 }
      )
    }
  } catch (error) {
    console.error('Error in chat route:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: `Failed to process chat request: ${errorMessage}` },
      { status: 500 }
    )
  }
} 