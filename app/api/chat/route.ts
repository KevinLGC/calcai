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

    if (!process.env.QWEN_API_KEY) {
      console.error('QWEN_API_KEY is not set')
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.qwen.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: 0.7,
        max_tokens: 800,
        top_p: 0.95,
        stream: false,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      console.error('Qwen API Error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to get response from Qwen API' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid Qwen API response:', data)
      return NextResponse.json(
        { error: 'Invalid response format from Qwen API' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      content: data.choices[0].message.content,
      role: 'assistant'
    })
  } catch (error) {
    console.error('Error in chat route:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
} 