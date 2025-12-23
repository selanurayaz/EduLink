import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import type { Session } from "@supabase/supabase-js"

type AuthState = {
  session: Session | null
  loading: boolean
}

const AuthContext = createContext<AuthState>({
  session: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session)
        }
    )

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  return (
      <AuthContext.Provider value={{ session, loading }}>
        {children}
      </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
