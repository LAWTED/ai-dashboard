import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // 创建一个响应对象，我们将在这个响应上设置 cookie
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          // 当设置 cookie 时，同时设置在请求和响应对象上
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          // 当移除 cookie 时，同时从请求和响应对象上移除
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // 获取用户登录状态
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 只对 professor 页面、protected 页面和 yellowbox 主页面进行认证检查
  const isProfessorPage = request.nextUrl.pathname.startsWith('/professor')
  const isProtectedPage = request.nextUrl.pathname.startsWith('/protected')
  const isYellowboxPage = request.nextUrl.pathname === '/yellowbox'

  if (!session && (isProfessorPage || isProtectedPage)) {
    // 没有会话但尝试访问需要认证的页面，重定向到登录页面
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (!session && isYellowboxPage) {
    // 没有会话但尝试访问 yellowbox，重定向到 yellowbox 登录页面
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/yellowbox/login'
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
