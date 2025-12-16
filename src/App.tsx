import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Planner from "./pages/Planner";
import Analytics from "./pages/Analytics";
import Discovery from "./pages/Discovery";
import Progress from "./pages/Progress"; // <--- YENİ ✅

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/planner" element={<Planner />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/discovery" element={<Discovery />} />

                {/* Yeni İlerleme Sayfası */}
                <Route path="/progress" element={<Progress />} /> {/* <--- YENİ ✅ */}
            </Routes>
        </Router>
    );
}

export default App;