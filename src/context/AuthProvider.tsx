import { createContext, useContext, useEffect, useState } from "react"
import { supabase, authChannel } from "../lib/supabaseClient"

// Auth türü
type AuthState = {
  session: any | null
  loading: boolean
}

const AuthContext = createContext<AuthState>({
  session: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // İlk yüklemede session oku
  useEffect(() => {
    let active = true

    async function load() {
      const { data } = await supabase.auth.getSession()
      if (!active) return
      setSession(data?.session ?? null)
      setLoading(false)
    }

    load()

    // Supabase event listener
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
      }
    )

    // Multi-tab dinleme
    authChannel.onmessage = (msg) => {
      console.log("[AuthProvider] BroadcastChannel:", msg.data)
      setSession(msg.data.session)
    }

    return () => {
      active = false
      listener.subscription.unsubscribe()
      authChannel.close()
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
