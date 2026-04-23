'use client'

import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-dark-200">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            'w-full bg-dark-900 border rounded-lg px-4 py-2.5 text-sm text-white placeholder-dark-400',
            'transition-colors duration-200 resize-y min-h-[100px]',
            'focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-dark-700 hover:border-dark-600',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-dark-400">{hint}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
export default Textarea
