import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { partner_id, client_whatsapp, needs } = body

    if (!partner_id || !client_whatsapp || !needs) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 })
    }

    // Buscar perfil do cliente
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    // Inserir lead
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        client_id: user.id,
        partner_id,
        client_name: profile?.full_name ?? 'Cliente',
        client_email: profile?.email ?? user.email ?? '',
        client_whatsapp,
        needs,
        status: 'new',
        origin: 'partner_profile',
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao inserir lead:', error)
      return NextResponse.json({ error: 'Erro ao registrar solicitação' }, { status: 500 })
    }

    // Registrar evento de click
    await supabase.from('clicks').insert({
      client_id: user.id,
      partner_id,
      event_type: 'quote_submit',
      metadata: { lead_id: lead.id },
    })

    return NextResponse.json({ data: lead })
  } catch (err) {
    console.error('Erro na rota de leads:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    let query = supabase.from('leads').select('*, partner:partners(company_name, slug, logo_url)')

    if (profile?.role === 'cliente') {
      query = query.eq('client_id', user.id)
    } else if (profile?.role === 'parceiro') {
      const { data: partner } = await supabase
        .from('partners')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (partner) {
        query = query.eq('partner_id', partner.id)
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
