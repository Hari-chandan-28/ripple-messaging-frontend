import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import AppPage from "./pages/AppPage";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public — anyone can see */}
                <Route path="/" element={<LandingPage />} />

                {/* Auth pages — redirect to /app if already logged in */}
                <Route path="/signup" element={
                    <PublicRoute><SignupPage /></PublicRoute>
                } />
                <Route path="/login" element={
                    <PublicRoute><LoginPage /></PublicRoute>
                } />

                {/* Setup — requires token */}
                <Route path="/setup" element={
                    <ProtectedRoute><ProfileSetupPage /></ProtectedRoute>
                } />

                {/* App — requires token */}
                <Route path="/app" element={
                    <ProtectedRoute><AppPage /></ProtectedRoute>
                } />

                {/* Catch all — redirect to landing */}
                <Route path="*" element={<LandingPage />} />
            </Routes>
        </BrowserRouter>
    );
}