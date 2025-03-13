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
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://calcai-five.vercel.app',
          'X-Title': 'CalcAI'
        },
        body: JSON.stringify({
          model: 'qwen/qwen-72b',
          messages: messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature: 0.7,
          max_tokens: 800,
        }),
      })

      console.log('OpenRouter API Response Status:', response.status)
      const data = await response.json()
      
      // Log the full response data with proper stringification
      console.log('OpenRouter API Response Data:', JSON.stringify(data, null, 2))

      if (!response.ok) {
        const errorMessage = data.error?.message || JSON.stringify(data)
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
        messageContent: data.choices?.[0]?.message?.content
      })

      const message = data.choices?.[0]?.message
      if (!message || typeof message !== 'object') {
        console.error('Invalid message format:', message)
        return NextResponse.json(
          { error: 'Invalid response format from API' },
          { status: 500 }
        )
      }

      // Try to get content from different possible locations in the response
      let content = ''
      if (typeof message === 'object') {
        if (message.content) {
          content = message.content
        } else if (message.text) {
          content = message.text
        } else if (typeof message === 'string') {
          content = message
        }
      }

      // If still no content, try to get it from the raw response
      if (!content && data.choices?.[0]?.text) {
        content = data.choices[0].text
      }
      
      if (!content) {
        console.error('Empty response content. Full response:', JSON.stringify(data, null, 2))
        return NextResponse.json(
          { error: 'Empty response from API. Please try again.' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        content,
        role: 'assistant'
      })
    } catch (fetchError) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to connect to OpenRouter API. Please check your API key and internet connection.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in chat route:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request. Please try again.' },
      { status: 500 }
    )
  }
} 