import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  // Basic token expiry check
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isExpired = payload.exp && payload.exp * 1000 < Date.now();
    if (isExpired) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }
  } catch {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
  return children;
}