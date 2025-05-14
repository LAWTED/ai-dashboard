'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function LogoutButton({ className, ...props }: React.ComponentPropsWithoutRef<typeof Button>) {
  const router = useRouter()

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    router.refresh()
    router.push('/')
  }

  return <Button onClick={logout} className={className} {...props}>Logout</Button>
}
