import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Rotas públicas que não precisam de auth
  const publicPaths = ['/', '/login', '/cadastro', '/api/auth', '/admin', '/parceiro']
  const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith(p))

  // Se não está autenticado e tenta acessar rota protegida → login
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se está autenticado e tenta acessar login/cadastro → redirecionar
  if (user && (pathname === '/login' || pathname === '/cadastro')) {
    return NextResponse.redirect(new URL('/feed', request.url))
  }

  // Proteção de rotas por role
  if (user && (pathname.startsWith('/admin') || pathname.startsWith('/parceiro'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role ?? 'cliente'

    if (pathname.startsWith('/admin') && !['admin', 'colaborador'].includes(role)) {
      return NextResponse.redirect(new URL('/feed', request.url))
    }

    if (pathname.startsWith('/parceiro') && role !== 'parceiro') {
      return NextResponse.redirect(new URL('/feed', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
