import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  gold?: boolean
}

export function Card({ children, className, hover, gold, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-dark-900 border border-dark-700 rounded-2xl',
        hover && 'transition-all duration-300 hover:border-gold-500/50 hover:shadow-card-hover cursor-pointer',
        gold && 'border-gold-500/30 shadow-gold',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6 border-b border-dark-700', className)} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-4 border-t border-dark-700', className)} {...props}>
      {children}
    </div>
  )
}
