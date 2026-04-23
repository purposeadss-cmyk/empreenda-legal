import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'gold' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
  className?: string
}

export default function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const variants = {
    default: 'bg-dark-700 text-dark-200',
    gold: 'bg-gold-500/20 text-gold-400 border border-gold-500/30',
    success: 'bg-green-900/40 text-green-400 border border-green-500/30',
    warning: 'bg-yellow-900/40 text-yellow-400 border border-yellow-500/30',
    danger: 'bg-red-900/40 text-red-400 border border-red-500/30',
    info: 'bg-blue-900/40 text-blue-400 border border-blue-500/30',
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  }

  return (
    <span className={cn('inline-flex items-center rounded-full font-medium', variants[variant], sizes[size], className)}>
      {children}
    </span>
  )
}
