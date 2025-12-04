import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Hero } from "./components/Hero"
import { LoginPage } from "./pages/Login"
import { ResetPasswordPage } from "./pages/ResetPassword"
import { AuthCallbackPage } from "./pages/AuthCallback"
import { HomePage } from "./pages/HomePage"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { useState } from "react"

function AuthFlow() {
  const [screen, setScreen] = useState<"hero" | "login">("hero")

  return screen === "hero" ? (
    <Hero onStart={() => setScreen("login")} />
  ) : (
    <LoginPage />
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔒 Ana sayfa = sadece login olan kullanıcı */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Auth ekranları */}
        <Route path="/auth" element={<AuthFlow />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </BrowserRouter>
  )
}
