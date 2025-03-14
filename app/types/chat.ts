export interface ChatMessage {
  id?: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export interface Session {
  id: string
  user_id: string
  created_at: string
  title: string
  last_message?: string
} 