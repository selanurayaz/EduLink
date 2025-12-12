import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile"; // Yeni yaptığımız sayfayı çağırıyoruz

function App() {
    return (
        <Router>
            <Routes>
                {/* Giriş Sayfası */}
                <Route path="/" element={<Login />} />

                {/* Kayıt Ol Sayfası */}
                <Route path="/signup" element={<Signup />} />

                {/* Ana Panel (Kamera) */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Profil Ayarları Sayfası (YENİ EKLENDİ) */}
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </Router>
    );
}

export default App;