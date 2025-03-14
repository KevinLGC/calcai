'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/')
      }
    }
    checkUser()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to CalcAI</h1>
          <p className="text-gray-300">Sign in to access your personal AI assistant</p>
        </div>
        <Auth
          supabaseClient={supabase}
          view="sign_in"
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#8B5CF6',
                  brandAccent: '#7C3AED',
                }
              }
            },
            style: {
              button: {
                background: '#8B5CF6',
                borderRadius: '0.5rem',
                padding: '10px',
                fontSize: '16px'
              },
              anchor: {
                color: '#8B5CF6'
              },
              container: {
                color: 'white'
              },
              divider: {
                background: 'rgba(255,255,255,0.2)'
              },
              label: {
                color: 'white'
              },
              input: {
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '0.5rem',
                padding: '10px',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)'
              }
            }
          }}
          providers={['google']}
          providerScopes={{
            google: 'profile email'
          }}
          redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : ''}
          theme="dark"
          socialLayout="horizontal"
        />
      </div>
    </div>
  )
} 