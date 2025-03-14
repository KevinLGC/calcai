'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTheme } from 'next-themes'
import { Sun, Moon, Send, Loader2, Trash2, Download, Copy, CheckCircle2 } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to get response from AI. Please try again.",
        variant: "destructive"
      })
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    toast({
      title: "Chat Cleared",
      description: "All messages have been cleared.",
    })
  }

  const downloadChat = () => {
    const chatContent = messages
      .map(msg => `${msg.role.toUpperCase()} (${msg.timestamp?.toLocaleString()}): ${msg.content}`)
      .join('\n\n')
    
    const blob = new Blob([chatContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-history-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Chat Downloaded",
      description: "Chat history has been saved to your downloads.",
    })
  }

  const copyToClipboard = async () => {
    const chatContent = messages
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n')
    
    await navigator.clipboard.writeText(chatContent)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
    
    toast({
      title: "Copied!",
      description: "Chat history has been copied to clipboard.",
    })
  }

  return (
    <div className={cn(
      "flex flex-col h-[calc(100vh-4rem)]",
      "bg-gray-50 dark:bg-gray-900",
      "transition-colors duration-200"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          AI Assistant
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-gray-600 dark:text-gray-400"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearChat}
            className="text-gray-600 dark:text-gray-400"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={downloadChat}
            className="text-gray-600 dark:text-gray-400"
          >
            <Download className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={copyToClipboard}
            className="text-gray-600 dark:text-gray-400"
          >
            {isCopied ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
              <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Send className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Start a Conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                Ask me anything about math, science, or any other topic you'd like to discuss.
              </p>
            </div>
          ) : (
            messages.map((message, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-4",
                    message.role === 'user'
                      ? "bg-purple-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                    "shadow-sm"
                  )}
                >
                  <div className="prose dark:prose-invert">
                    {message.content}
                  </div>
                  {message.timestamp && (
                    <div className={cn(
                      "text-xs mt-2",
                      message.role === 'user' 
                        ? "text-purple-200" 
                        : "text-gray-500 dark:text-gray-400"
                    )}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Textarea
            value={input}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
            placeholder="Type your message..."
            className={cn(
              "flex-1",
              "bg-white dark:bg-gray-800",
              "border-gray-200 dark:border-gray-700",
              "text-gray-900 dark:text-gray-100",
              "placeholder-gray-400 dark:placeholder-gray-500",
              "resize-none"
            )}
            rows={1}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={cn(
              "bg-purple-600 hover:bg-purple-700",
              "text-white",
              "transition-colors",
              "disabled:opacity-50"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 