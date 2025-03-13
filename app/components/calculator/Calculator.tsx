'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'

export function Calculator() {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [isScientific, setIsScientific] = useState(false)

  const handleNumber = (num: string) => {
    setDisplay(prev => prev === '0' ? num : prev + num)
    setExpression(prev => prev + num)
  }

  const handleOperator = (op: string) => {
    setDisplay('0')
    setExpression(prev => prev + op)
  }

  const handleEquals = () => {
    try {
      const result = eval(expression)
      setDisplay(result.toString())
      setExpression(result.toString())
    } catch (error) {
      setDisplay('Error')
      setExpression('')
    }
  }

  const handleClear = () => {
    setDisplay('0')
    setExpression('')
  }

  const CalcButton = ({ children, onClick, className }: any) => (
    <Button
      variant="ghost"
      className={cn(
        'h-14 text-lg font-medium transition-all hover:scale-105 hover:bg-purple-100 dark:hover:bg-purple-900/30',
        className
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  )

  const buttons = [
    ['7', '8', '9', '/'],
    ['4', '5', '6', '*'],
    ['1', '2', '3', '-'],
    ['0', '.', '=', '+'],
  ]

  const scientificButtons = [
    ['sin', 'cos', 'tan'],
    ['log', 'ln', 'sqrt'],
    ['(', ')', '^'],
  ]

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="relative">
        <div className="h-20 p-4 text-right text-3xl font-mono bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl shadow-inner">
          <div className="text-sm text-gray-500 dark:text-gray-400 h-6 overflow-hidden">
            {expression || '0'}
          </div>
          <div className="text-gray-800 dark:text-white overflow-hidden">
            {display}
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full h-12 font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30"
        onClick={() => setIsScientific(!isScientific)}
      >
        {isScientific ? 'Basic' : 'Scientific'}
      </Button>

      {isScientific && (
        <div className="grid grid-cols-3 gap-2">
          {scientificButtons.map((row, i) => (
            <div key={i} className="contents">
              {row.map((btn) => (
                <CalcButton
                  key={btn}
                  onClick={() => handleOperator(btn)}
                  className="bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                >
                  {btn}
                </CalcButton>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <CalcButton
          onClick={handleClear}
          className="w-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
        >
          Clear
        </CalcButton>

        <div className="grid grid-cols-4 gap-2">
          {buttons.map((row, i) => (
            <div key={i} className="contents">
              {row.map((btn) => (
                <CalcButton
                  key={btn}
                  onClick={() =>
                    btn === '='
                      ? handleEquals()
                      : /[0-9.]/.test(btn)
                      ? handleNumber(btn)
                      : handleOperator(btn)
                  }
                  className={
                    btn === '='
                      ? 'bg-purple-500 hover:bg-purple-600 text-white'
                      : /[0-9.]/.test(btn)
                      ? 'bg-white dark:bg-gray-800'
                      : 'bg-gray-50 dark:bg-gray-700'
                  }
                >
                  {btn}
                </CalcButton>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 