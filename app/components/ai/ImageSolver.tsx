'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '../ui/button'
import { Loader2, Upload, Image as ImageIcon, X } from 'lucide-react'

export function ImageSolver() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setPreview(URL.createObjectURL(file))
    
    const formData = new FormData()
    formData.append('image', file)

    try {
      setLoading(true)
      const response = await fetch('/api/solve', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process image')
      }

      const data = await response.json()
      setResult(data.result)
    } catch (error) {
      console.error('Error:', error)
      setResult('Failed to process image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 1,
  })

  const clearImage = () => {
    setPreview(null)
    setResult('')
  }

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`relative overflow-hidden transition-all duration-300
          ${preview ? 'h-[300px]' : 'h-[200px]'}
          ${
            isDragActive
              ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-400'
              : 'bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
          }
          border-2 border-dashed rounded-2xl cursor-pointer group`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative h-full">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            <Button
              onClick={(e) => {
                e.stopPropagation()
                clearImage()
              }}
              variant="destructive"
              size="icon"
              className="absolute top-3 right-3 rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <p className="text-white text-center">
                <Upload className="h-8 w-8 mb-2 mx-auto" />
                Click or drag to replace
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6">
            <ImageIcon className="h-12 w-12 mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-300 text-center mb-2">
              {isDragActive ? (
                'Drop the image here'
              ) : (
                'Drag & drop an image here, or click to select'
              )}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center">
              Supports PNG, JPG or JPEG
            </p>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600 dark:text-purple-400" />
          <span className="ml-2 text-purple-600 dark:text-purple-400">Processing your image...</span>
        </div>
      )}

      {result && (
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Solution:</h3>
          <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-300">{result}</p>
        </div>
      )}
    </div>
  )
} 