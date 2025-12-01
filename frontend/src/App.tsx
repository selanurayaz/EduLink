import { useState } from "react"
import { Hero } from "./components/Hero"
import { LoginPage } from "./pages/Login"

type Screen = "hero" | "login"

function App() {
  const [screen, setScreen] = useState<Screen>("hero")

  if (screen === "hero") {
    return <Hero onStart={() => setScreen("login")} />
  }

  return <LoginPage />
}

export default App
