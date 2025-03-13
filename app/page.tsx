import { Calculator } from './components/calculator/Calculator'
import { ImageSolver } from './components/ai/ImageSolver'
import { Chat } from './components/ai/Chat'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 mb-4">
            CalcAI
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your intelligent calculator powered by AI. Solve mathematical problems through text, images, or traditional calculations.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <section className="space-y-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-transform hover:scale-[1.02]">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Calculator</h2>
              <Calculator />
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-transform hover:scale-[1.02]">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Image Solver</h2>
              <ImageSolver />
            </div>
          </section>

          <section className="space-y-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-transform hover:scale-[1.02]">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">AI Chat</h2>
              <Chat />
            </div>
          </section>
        </div>

        <footer className="mt-16 text-center text-gray-600 dark:text-gray-400">
          <p>Developed by Kevin</p>
        </footer>
      </div>
    </main>
  )
}
