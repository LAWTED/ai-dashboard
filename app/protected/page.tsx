import { redirect } from 'next/navigation'

import { LogoutButton } from '@/components/logout-button'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex h-svh w-full flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-4">
        <p className="text-xl">
          Hello, <span className="font-bold">{data.user.email}</span>
        </p>
        <LogoutButton />
      </div>
      <p className="text-sm text-muted-foreground">This page is protected and requires authentication.</p>
    </div>
  )
}
