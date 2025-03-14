'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

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

  const handleScientific = (func: string) => {
    try {
      let result
      const num = parseFloat(display)
      switch (func) {
        case 'sin':
          result = Math.sin(num)
          break
        case 'cos':
          result = Math.cos(num)
          break
        case 'tan':
          result = Math.tan(num)
          break
        case 'sqrt':
          result = Math.sqrt(num)
          break
        case 'log':
          result = Math.log10(num)
          break
        case 'ln':
          result = Math.log(num)
          break
        default:
          return
      }
      setDisplay(result.toString())
      setExpression(result.toString())
    } catch (error) {
      setDisplay('Error')
      setExpression('')
    }
  }

  const CalcButton = ({ children, onClick, className = '' }: { 
    children: React.ReactNode
    onClick: () => void
    className?: string 
  }) => (
    <Button
      onClick={onClick}
      className={`h-14 text-lg font-medium ${className}`}
      variant="ghost"
    >
      {children}
    </Button>
  )

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Display */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="text-gray-400 text-sm mb-1">{expression || '0'}</div>
        <div className="text-white text-3xl font-bold font-mono">{display}</div>
      </div>

      {/* Mode Toggle */}
      <div className="mb-4">
        <Button
          onClick={() => setIsScientific(!isScientific)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          variant="default"
        >
          {isScientific ? 'Basic Calculator' : 'Scientific Mode'}
        </Button>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-4 gap-2 bg-gray-800/50 rounded-lg p-2">
        {isScientific && (
          <>
            <CalcButton onClick={() => handleScientific('sin')} className="text-purple-400">sin</CalcButton>
            <CalcButton onClick={() => handleScientific('cos')} className="text-purple-400">cos</CalcButton>
            <CalcButton onClick={() => handleScientific('tan')} className="text-purple-400">tan</CalcButton>
            <CalcButton onClick={() => handleScientific('sqrt')} className="text-purple-400">√</CalcButton>
            <CalcButton onClick={() => handleScientific('log')} className="text-purple-400">log</CalcButton>
            <CalcButton onClick={() => handleScientific('ln')} className="text-purple-400">ln</CalcButton>
            <CalcButton onClick={() => handleOperator('**')} className="text-purple-400">^</CalcButton>
            <CalcButton onClick={() => handleOperator('(')} className="text-purple-400">(</CalcButton>
            <CalcButton onClick={() => handleOperator(')')} className="text-purple-400">)</CalcButton>
            <CalcButton onClick={() => handleOperator('Math.PI')} className="text-purple-400">π</CalcButton>
            <CalcButton onClick={() => handleOperator('Math.E')} className="text-purple-400">e</CalcButton>
            <CalcButton onClick={() => handleOperator('!')} className="text-purple-400">!</CalcButton>
          </>
        )}

        <CalcButton onClick={handleClear} className="text-red-400">C</CalcButton>
        <CalcButton onClick={() => handleOperator('/')} className="text-purple-400">÷</CalcButton>
        <CalcButton onClick={() => handleOperator('*')} className="text-purple-400">×</CalcButton>
        <CalcButton onClick={() => handleOperator('-')} className="text-purple-400">−</CalcButton>

        <CalcButton onClick={() => handleNumber('7')}>7</CalcButton>
        <CalcButton onClick={() => handleNumber('8')}>8</CalcButton>
        <CalcButton onClick={() => handleNumber('9')}>9</CalcButton>
        <CalcButton onClick={() => handleOperator('+')} className="text-purple-400">+</CalcButton>

        <CalcButton onClick={() => handleNumber('4')}>4</CalcButton>
        <CalcButton onClick={() => handleNumber('5')}>5</CalcButton>
        <CalcButton onClick={() => handleNumber('6')}>6</CalcButton>
        <CalcButton onClick={() => handleNumber('.')}>.</CalcButton>

        <CalcButton onClick={() => handleNumber('1')}>1</CalcButton>
        <CalcButton onClick={() => handleNumber('2')}>2</CalcButton>
        <CalcButton onClick={() => handleNumber('3')}>3</CalcButton>
        <CalcButton onClick={handleEquals} className="bg-purple-600 hover:bg-purple-700 text-white row-span-2">=</CalcButton>

        <CalcButton onClick={() => handleNumber('0')} className="col-span-2">0</CalcButton>
        <CalcButton onClick={() => handleNumber('00')}>00</CalcButton>
      </div>
    </div>
  )
} 