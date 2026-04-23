import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  href?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Logo({ href = '/', size = 'md', className }: LogoProps) {
  const sizes = {
    sm: { title: 'text-base', sub: 'text-[9px]' },
    md: { title: 'text-xl', sub: 'text-[10px]' },
    lg: { title: 'text-2xl', sub: 'text-xs' },
  }

  const content = (
    <div className={cn('flex flex-col leading-tight', className)}>
      <span className={cn('font-bold text-white tracking-tight', sizes[size].title)}>
        Empreenda{' '}
        <span className="bg-gradient-gold bg-clip-text text-transparent">Legal</span>
      </span>
      <span className={cn('text-dark-400 tracking-widest uppercase font-medium', sizes[size].sub)}>
        by Seja Legal Global
      </span>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}
