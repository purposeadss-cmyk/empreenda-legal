import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  trend?: { value: number; label: string }
  className?: string
  gold?: boolean
}

export default function StatsCard({ title, value, icon: Icon, trend, className, gold }: StatsCardProps) {
  return (
    <div className={cn(
      'bg-dark-900 border border-dark-700 rounded-2xl p-6 flex flex-col gap-4',
      gold && 'border-gold-500/30 bg-gradient-to-br from-gold-500/10 to-transparent',
      className
    )}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-dark-400">{title}</p>
        {Icon && (
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            gold ? 'bg-gold-500/20' : 'bg-dark-800'
          )}>
            <Icon size={20} className={gold ? 'text-gold-400' : 'text-dark-400'} />
          </div>
        )}
      </div>
      <div>
        <p className={cn(
          'text-3xl font-bold',
          gold ? 'text-gold-400' : 'text-white'
        )}>
          {value}
        </p>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 mt-1 text-xs font-medium',
            trend.value >= 0 ? 'text-green-400' : 'text-red-400'
          )}>
            {trend.value >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{trend.value >= 0 ? '+' : ''}{trend.value}%</span>
            <span className="text-dark-500">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  )
}
