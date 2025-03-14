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

      if (!response.ok) {
        const errorText = await response.text();
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

      const data = await response.json();

      if (!data?.choices?.[0]?.message?.content) {
        return NextResponse.json(
          { error: 'Invalid response format' },
          { status: 500 }
        );
      }

      // Extract and clean the content
      let content = data.choices[0].message.content;

      // Function to clean markdown-style formatting
      const cleanMarkdown = (text: string): string => {
        return text
          .replace(/\*\*/g, '') // Remove bold markers
          .replace(/\#\#\#/g, '') // Remove heading markers
          .replace(/^\s*[-•]\s*/gm, '') // Clean list markers
          .replace(/`/g, '') // Remove code markers
          .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single
          .replace(/\|\|/g, '') // Remove spoiler tags
          .replace(/~~/g, '') // Remove strikethrough
          .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Clean markdown links
          .replace(/!\[[^\]]*\]\([^)]*\)/g, ''); // Clean markdown images
      };

      // Remove internal reasoning and meta patterns
      content = content
        .replace(/\{[^}]*\}/g, '') // Remove JSON-like structures
        .replace(/\\"reasoning\\":[^}]*(?=})/g, '') // Remove reasoning field
        .replace(/Send\|+/g, '') // Remove Send markers
        .replace(/\\n/g, '\n') // Preserve intentional line breaks
        .replace(/^(Okay,|Well,|I think|Let me|I will|I can|Here's|Sure|Let's see|First,|As an AI|Based on|From what I understand)\s*/i, '')
        .replace(/^To respond,\s*/i, '')
        .replace(/^To answer,\s*/i, '')
        .replace(/^Analyzing this,\s*/i, '')
        .replace(/\s*\(.*?\)/g, '') // Remove parenthetical comments
        .replace(/\[[^\]]*\]/g, '') // Remove square bracket comments
        .replace(/\{[^}]*\}/g, '') // Remove curly brace comments
        .replace(/\\"/g, '"') // Fix escaped quotes
        .replace(/"{2,}/g, '"') // Fix multiple quotes
        .replace(/\\+/g, '') // Remove backslashes
        .trim();

      // Clean markdown formatting
      content = cleanMarkdown(content);

      // Format lists and paragraphs properly
      content = content
        .split('\n')
        .map((line: string): string => line.trim())
        .filter((line: string): boolean => line.length > 0)
        .join('\n');

      // Remove any remaining meta-commentary phrases
      content = content
        .replace(/^Let me help you with that\.\s*/i, '')
        .replace(/^I understand\.\s*/i, '')
        .replace(/^I apologize\.\s*/i, '')
        .replace(/^I'd be happy to help\.\s*/i, '')
        .trim();

      // If content is empty after cleaning, provide a default response
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