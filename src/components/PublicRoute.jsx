import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
    const token = localStorage.getItem("token");
    if (!token) return children;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const isExpired = payload.exp && payload.exp * 1000 < Date.now();
        if (!isExpired) return <Navigate to="/app" replace />;
        localStorage.removeItem("token");
    } catch {
        localStorage.removeItem("token");
    }
    return children;
}