import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { EventType } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { partner_id, event_type, metadata } = body as {
      partner_id: string
      event_type: EventType
      metadata?: Record<string, unknown>
    }

    if (!partner_id || !event_type) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 })
    }

    await supabase.from('clicks').insert({
      client_id: user.id,
      partner_id,
      event_type,
      metadata: metadata ?? {},
    })

    // Incrementar contador de views se for profile_view
    if (event_type === 'profile_view') {
      await supabase.rpc('increment_partner_views', { partner_id })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
