import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AccountSettings } from '@/components/account/account-settings'
import { Navigator } from '@/components/dashboard/navigator'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('user_id', user.id)
    .single()

  return (
    <main className="min-h-screen px-4 sm:px-6 py-8 max-w-2xl mx-auto">
      <Navigator />
      <div className="flex flex-col items-center">
      <div className="w-full max-w-sm flex flex-col gap-10 my-auto">
        <div className="flex flex-col gap-0.5">
          {profile?.username && (
            <h1 className="font-semibold">{profile.username}</h1>
          )}
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <AccountSettings userId={user.id} email={user.email ?? ''} username={profile?.username ?? ''} />
      </div>
      </div>
    </main>
  )
}
