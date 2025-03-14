'use client'

import { Calculator } from './components/calculator/Calculator'
import Chat from './components/chat/Chat'
import { useState } from 'react'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'chat'>('calculator')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-white mb-2">
                CalcAI
              </h1>
              <p className="text-gray-300">Your intelligent calculator powered by AI</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('calculator')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'calculator'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Calculator
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'chat'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                AI Chat
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Calculator Section */}
          <div className={`transition-all duration-300 ${
            activeTab === 'calculator' ? 'block' : 'hidden'
          }`}>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white">Smart Calculator</h2>
                <p className="text-gray-300">Perform calculations with ease</p>
              </div>
              <Calculator />
            </div>
          </div>

          {/* Chat Section */}
          <div className={`transition-all duration-300 ${
            activeTab === 'chat' ? 'block' : 'hidden'
          }`}>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-semibold text-white">AI Assistant</h2>
                <p className="text-gray-300">Get help with complex calculations</p>
              </div>
              <Chat />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 py-6">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-400">
            <p>Developed by Kevin | CalcAI © {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
