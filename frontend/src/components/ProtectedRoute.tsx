// src/components/ProtectedRoute.tsx
import { useEffect, useState, type ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

type ProtectedRouteProps = {
  children: ReactNode
}

type AuthStatus = "checking" | "authed" | "guest"

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [status, setStatus] = useState<AuthStatus>("checking")

  useEffect(() => {
    let isMounted = true

    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        console.log("[ProtectedRoute] getSession:", { data, error })

        if (!isMounted) return

        if (error) {
          console.error("[ProtectedRoute] getSession error:", error)
          setStatus("guest")
          return
        }

        if (data?.session) {
          console.log("[ProtectedRoute] session VAR, authed")
          setStatus("authed")
        } else {
          console.log("[ProtectedRoute] session YOK, guest")
          setStatus("guest")
        }
      } catch (err) {
        if (!isMounted) return
        console.error("[ProtectedRoute] getSession CATCH:", err)
        setStatus("guest")
      }
    }

    checkSession()

    return () => {
      isMounted = false
    }
  }, [])

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <p>Yükleniyor...</p>
      </div>
    )
  }

  if (status === "guest") {
    return <Navigate to="/auth" replace />
  }

  // status === "authed"
  return <>{children}</>
}
