import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * 只对 professor 页面和 protected 页面进行认证检查
     * 不再对所有路径都应用中间件
     */
    '/professor/:path*',
    '/protected/:path*',
  ],
}
