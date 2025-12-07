import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Hero } from "./components/Hero"
import { LoginPage } from "./pages/Login"
import { ResetPasswordPage } from "./pages/ResetPassword"
import { AuthCallbackPage } from "./pages/AuthCallback"
import { HomePage } from "./pages/HomePage"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { useState } from "react"
import { AuthProvider } from "./context/AuthProvider"

function AuthFlow() {
  const [screen, setScreen] = useState<"hero" | "login">("hero")

  return screen === "hero" ? (
    <Hero onStart={() => setScreen("login")} />
  ) : (
    <LoginPage />
  )
}

function App() {
  return (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* 👉 Artık root (/) = Auth akışı */}
        <Route path="/" element={<AuthFlow />} />

        {/* 👉 Korunan ana sayfa artık /home */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Auth callback + şifre sıfırlama */}
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App
