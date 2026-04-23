import Link from 'next/link'
import { Globe, ArrowRight } from 'lucide-react'
import type { Partner } from '@/lib/types'
import { truncate } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

interface PartnerCardProps {
  partner: Partner & { category?: { name: string; slug: string } }
}

export default function PartnerCard({ partner }: PartnerCardProps) {
  const href = `/parceiros/${partner.slug ?? partner.id}`

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 flex flex-col gap-4 hover:border-gold-500/30 transition-all duration-300 group">
      <div className="flex items-start gap-4">
        <Avatar name={partner.company_name} url={partner.logo_url} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white group-hover:text-gold-400 transition-colors truncate">
            {partner.company_name}
          </h3>
          {partner.category && (
            <Badge variant="gold" size="sm" className="mt-1">{partner.category.name}</Badge>
          )}
        </div>
      </div>

      {partner.description && (
        <p className="text-sm text-dark-400 leading-relaxed line-clamp-2">
          {truncate(partner.description, 120)}
        </p>
      )}

      {partner.countries.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-dark-500">
          <Globe size={12} />
          <span>{partner.countries.slice(0, 3).join(', ')}{partner.countries.length > 3 ? ` +${partner.countries.length - 3}` : ''}</span>
        </div>
      )}

      <Link href={href}>
        <Button variant="outline" size="sm" fullWidth>
          Ver perfil
          <ArrowRight size={14} />
        </Button>
      </Link>
    </div>
  )
}
