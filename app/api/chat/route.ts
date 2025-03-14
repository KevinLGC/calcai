import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Ensure API key is set
    const apiKey = process.env.QWEN_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    // Get the last message
    const lastMessage = messages[messages.length - 1]

    // For now, return a simple response
    // TODO: Implement actual AI integration
    return NextResponse.json({
      content: `I received your message: "${lastMessage.content}". API integration coming soon.`
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 