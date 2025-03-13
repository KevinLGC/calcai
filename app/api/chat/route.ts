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
      const response = await fetch('https://api.deepinfra.com/v1/inference/Qwen/QwQ-32B-Preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          input: {
            messages: messages.map((msg: any) => ({
              role: msg.role,
              content: msg.content,
            }))
          },
          stream: false
        }),
      })

      console.log('Qwen API Response Status:', response.status)
      const data = await response.json()
      console.log('Qwen API Response Data:', JSON.stringify(data, null, 2))

      if (!response.ok) {
        console.error('DeepInfra API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        })
        return NextResponse.json(
          { error: `API Error: ${data.error || JSON.stringify(data)}` },
          { status: response.status }
        )
      }

      if (!data.results?.[0]?.text) {
        console.error('Invalid API response:', data)
        return NextResponse.json(
          { error: `Invalid response format from API: ${JSON.stringify(data)}` },
          { status: 500 }
        )
      }

      return NextResponse.json({
        content: data.results[0].text,
        role: 'assistant'
      })
    } catch (fetchError) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to connect to Qwen API. Please check your internet connection.' },
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