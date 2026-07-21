import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import Logo from "../assets/icons/logo.svg?react"


const C = {
    bg: "#f8f4f0",
    primary: "#1e3a2b",
    accent: "#eff87a",
    lavender: "#cfdcff",
    white: "#ffffff",
};
const faro = "'Faro', sans-serif";
const inter = "'Inter', sans-serif";

const Swoosh = ({ color = C.accent, style = {} }) => (
    <svg viewBox="0 0 200 50" fill="none" style={{ position: "absolute", pointerEvents: "none", ...style }}>
        <path d="M 8 35 Q 60 8 120 28 Q 160 42 192 18" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
);
const CurlyLine = ({ color = C.accent, style = {} }) => (
    <svg viewBox="0 0 60 200" fill="none" style={{ position: "absolute", pointerEvents: "none", ...style }}>
        <path d="M 30 8 Q 55 45 22 78 Q -5 108 30 138 Q 62 168 30 195" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
);
const SketchCircle = ({ color = C.lavender, style = {} }) => (
    <svg viewBox="0 0 200 200" fill="none" style={{ position: "absolute", pointerEvents: "none", ...style }}>
        <circle cx="100" cy="100" r="88" stroke={color} strokeWidth="3" strokeDasharray="10 5" />
    </svg>
);
const Scribble = ({ color = C.primary, style = {} }) => (
    <svg viewBox="0 0 100 60" fill="none" style={{ position: "absolute", pointerEvents: "none", ...style }}>
        <path d="M 5 40 Q 25 10 50 35 Q 75 58 95 28" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.15" />
        <path d="M 10 50 Q 35 20 60 44 Q 82 62 98 38" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.08" />
    </svg>
);
const DotGrid = ({ color = C.primary, style = {} }) => (
    <svg viewBox="0 0 80 80" fill="none" style={{ position: "absolute", pointerEvents: "none", ...style }}>
        {[0,1,2,3].map(row => [0,1,2,3].map(col => (
            <circle key={`${row}-${col}`} cx={10 + col * 20} cy={10 + row * 20} r="2" fill={color} opacity="0.12" />
        )))}
    </svg>
);
const WaveLine = ({ color = C.accent, style = {} }) => (
    <svg viewBox="0 0 300 30" fill="none" style={{ position: "absolute", pointerEvents: "none", ...style }}>
        <path d="M 0 15 Q 37 5 75 15 Q 112 25 150 15 Q 187 5 225 15 Q 262 25 300 15"
              stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
);

const AuthStyles = () => (
    <style>{`
    .auth-input {
      width: 100%;
      padding: 14px 18px;
      border: 2px solid ${C.primary};
      border-radius: 14px;
      font-size: 15px;
      font-family: ${inter};
      background: ${C.white};
      color: ${C.primary};
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .auth-input:focus {
      border-color: #2d5540;
      box-shadow: 0 0 0 4px rgba(239,248,122,0.35);
    }
    .auth-input::placeholder { color: rgba(30,58,43,0.4); }
    .auth-btn {
      width: 100%;
      padding: 15px;
      background: ${C.primary};
      color: ${C.accent};
      border: none;
      border-radius: 100px;
      font-size: 16px;
      font-weight: 700;
      font-family: ${inter};
      cursor: pointer;
      transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    }
    .auth-btn:hover {
      background: #2d5540;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(30,58,43,0.3);
    }
    .auth-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    .auth-link {
      color: ${C.primary};
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
      text-underline-offset: 3px;
      transition: opacity 0.15s;
    }
    .auth-link:hover { opacity: 0.65; }
    .toggle-track {
      width: 48px; height: 26px;
      border-radius: 100px;
      border: 2px solid ${C.primary};
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 2px;
      transition: background 0.2s;
      flex-shrink: 0;
    }
    .toggle-thumb {
      width: 18px; height: 18px;
      border-radius: 50%;
      background: ${C.primary};
      transition: transform 0.2s;
    }
  `}</style>
);

const LogoMark = () => (
    <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px",}}>
            <Logo style={{width: "100%", height: "100%" ,color:C.primary}}/>
        </div>
        <span style={{fontSize: 28, fontWeight: 900, fontFamily: faro, letterSpacing: "-1px", color: C.primary,}}>
            Ripple^
        </span>
    </div>
);

// ─── AUTH CARD WRAPPER ────────────────────────────────────────
const AuthCard = ({ children }) => (
    <div style={{
        background: C.accent,
        borderRadius: 32,
        padding: "40px 40px 36px",
        border: `2.5px solid ${C.primary}`,
        width: "100%",
        maxWidth: 420,
        boxShadow: "6px 6px 0px rgba(30,58,43,0.15)",
        position: "relative",
    }}>
        {children}
    </div>
);


export function LoginPage() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        setError("");
        if (!form.email || !form.password) {
            setError("Both fields are required.");
            return;
        }
        setLoading(true);
        try {
            const res = await login(form.email, form.password);
            localStorage.setItem("token", res.data.token);
            navigate("/app");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", fontFamily: inter }}>
            <AuthStyles />

            {/* Background SVG elements */}
            <CurlyLine color={C.accent} style={{ width: 65, top: 50, right: 50, opacity: 0.8 }} />
            <CurlyLine color={C.lavender} style={{ width: 55, bottom: 80, left: 50, opacity: 0.7 }} />
            <Swoosh color={C.accent} style={{ width: 260, top: 40, left: -20, opacity: 0.6 }} />
            <Swoosh color={C.lavender} style={{ width: 240, bottom: 60, right: -20, opacity: 0.6 }} />
            <SketchCircle color={C.accent} style={{ width: 280, top: -70, right: -70, opacity: 0.35 }} />
            <SketchCircle color={C.lavender} style={{ width: 240, bottom: -60, left: -60, opacity: 0.3 }} />
            <DotGrid color={C.primary} style={{ width: 90, top: 120, left: 100, opacity: 1 }} />
            <DotGrid color={C.primary} style={{ width: 90, bottom: 120, right: 100, opacity: 1 }} />
            <WaveLine color={C.lavender} style={{ width: 220, bottom: 180, left: "25%", opacity: 0.5 }} />
            <Scribble color={C.primary} style={{ width: 110, top: 180, right: 100, opacity: 1 }} />

            {/* Card */}
            <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 420, margin: "0 auto", }}>
                <LogoMark />
                <AuthCard >
                    <h2 style={{ fontFamily: faro, fontSize: 28, fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.5px", color: C.primary }}>
                        Welcome back
                    </h2>
                    <p style={{ fontSize: 14, color: "#3a5c48", margin: "0 0 28px", fontFamily: inter }}>
                        Log in to continue your conversations.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: C.primary, display: "block", marginBottom: 6, fontFamily: inter }}>Email</label>
                            <input className="auth-input" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: C.primary, display: "block", marginBottom: 6, fontFamily: inter }}>Password</label>
                            <input className="auth-input" name="password" type="password" placeholder="Your password" value={form.password} onChange={handleChange} />
                        </div>

                        {error && (
                            <div style={{ background: "rgba(30,58,43,0.1)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.primary, fontFamily: inter }}>
                                {error}
                            </div>
                        )}

                        <button className="auth-btn" onClick={handleSubmit} disabled={loading} style={{ marginTop: 8 }}>
                            {loading ? "Logging in..." : "Log in →"}
                        </button>
                    </div>

                    <p style={{ textAlign: "center", fontSize: 14, color: "#3a5c48", margin: "20px 0 0", fontFamily: inter }}>
                        Don't have an account?{" "}
                        <span className="auth-link" onClick={() => navigate("/signup")}>Sign up</span>
                    </p>
                </AuthCard>
            </div>
        </div>
    );
}

export default LoginPage;