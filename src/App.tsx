import React from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Planner from "./pages/Planner";
import Analytics from "./pages/Analytics";
import Discovery from "./pages/Discovery";
import Progress from "./pages/Progress";
import Quiz from "./pages/Quiz";
import QuizHistory from "./pages/QuizHistory";


import GlobalFocusCamera from "./components/GlobalFocusCamera";
import GlobalToast from "./components/GlobalToast";
import FocusTrackerBootstrap from "./components/camera/FocusTrackerBootstrap";

import { FocusTrackingProvider } from "./context/FocusTrackingProvider";
import { ToastProvider } from "./context/ToastProvider";
import { installAlarmAudioAutoUnlock } from "@/lib/alarmAudio.ts";

// Public sayfalar: Kamera + Toast yok
function PublicLayout() {
    return <Outlet />;
}

// App sayfalar: Kamera + Toast + Provider'lar var
function AppLayout() {
    React.useEffect(() => {
        return installAlarmAudioAutoUnlock();
    }, []);

    return (
        <ToastProvider>
            <FocusTrackingProvider>
                <GlobalToast />
                <GlobalFocusCamera />
                <FocusTrackerBootstrap />
                <Outlet />
            </FocusTrackingProvider>
        </ToastProvider>
    );
}

function AppInner() {
    return (
        <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
            </Route>

            {/* App routes (provider içinde) */}
            <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/planner" element={<Planner />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/discovery" element={<Discovery />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/quiz-history" element={<QuizHistory />} />
            </Route>
        </Routes>
    );
}

export default function App() {
    return (
        <Router>
            <AppInner />
        </Router>
    );
}
