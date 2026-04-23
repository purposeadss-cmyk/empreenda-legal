import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getAvatarUrl } from '@/lib/utils'

interface AvatarProps {
  name: string | null
  url: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: { px: 32, cls: 'w-8 h-8' },
  md: { px: 48, cls: 'w-12 h-12' },
  lg: { px: 64, cls: 'w-16 h-16' },
  xl: { px: 96, cls: 'w-24 h-24' },
}

export default function Avatar({ name, url, size = 'md', className }: AvatarProps) {
  const src = getAvatarUrl(name, url)
  const { px, cls } = sizes[size]

  return (
    <div className={cn('relative rounded-full overflow-hidden flex-shrink-0 border-2 border-dark-700', cls, className)}>
      <Image
        src={src}
        alt={name || 'Avatar'}
        width={px}
        height={px}
        className="object-cover w-full h-full"
      />
    </div>
  )
}
