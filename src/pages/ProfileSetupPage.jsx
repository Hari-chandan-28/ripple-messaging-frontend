import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import LoginPage from "./LoginPage.jsx";

// ============================================================
// AUTH PAGES — SignupPage, LoginPage, ProfileSetupPage
// Copy each component into its respective file in src/pages/
// ============================================================

// ─── SHARED DESIGN TOKENS ────────────────────────────────────
const C = {
    bg: "#f8f4f0",
    primary: "#1e3a2b",
    accent: "#eff87a",
    lavender: "#cfdcff",
    white: "#ffffff",
};
const faro = "'Faro', sans-serif";
const inter = "'Inter', sans-serif";

// ─── SHARED SVG SKETCHY ELEMENTS ─────────────────────────────
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

// ─── SHARED STYLES INJECTED ONCE ─────────────────────────────
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

// ─── LOGO MARK ────────────────────────────────────────────────
const LogoMark = () => (
    <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{
            width: 52, height: 52, background: C.primary, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
            color: C.accent, fontWeight: 900, fontSize: 22, fontFamily: faro,
        }}>R</div>
        <span style={{ fontSize: 28, fontWeight: 900, fontFamily: faro, letterSpacing: "-1px", color: C.primary }}>Ripple^</span>
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


export function ProfileSetupPage() {
    const [form, setForm] = useState({ name: "", bio: "", profilePic: "", isPrivate: false });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        setError("");
        if (!form.name.trim()) {
            setError("Display name is required.");
            return;
        }
        setLoading(true);
        try {
            await api.post("/api/profile/create", {
                name: form.name,
                bio: form.bio || null,
                profilePic: form.profilePic || null,
                relationshipStatus: null,
                isPrivate: form.isPrivate,
            });
            navigate("/app");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", fontFamily: inter }}>
            <AuthStyles />

            {/* Background SVG elements */}
            <Swoosh color={C.accent} style={{ width: 280, top: 30, left: -20, opacity: 0.7 }} />
            <Swoosh color={C.lavender} style={{ width: 260, bottom: 40, right: -20, opacity: 0.6 }} />
            <CurlyLine color={C.lavender} style={{ width: 65, top: 40, right: 60, opacity: 0.8 }} />
            <CurlyLine color={C.accent} style={{ width: 60, bottom: 60, left: 50, opacity: 0.7 }} />
            <SketchCircle color={C.lavender} style={{ width: 320, top: -80, right: -80, opacity: 0.3 }} />
            <SketchCircle color={C.accent} style={{ width: 280, bottom: -70, left: -70, opacity: 0.25 }} />
            <DotGrid color={C.primary} style={{ width: 100, top: 80, left: 80, opacity: 1 }} />
            <DotGrid color={C.primary} style={{ width: 100, bottom: 80, right: 80, opacity: 1 }} />
            <WaveLine color={C.accent} style={{ width: 200, top: 200, right: "20%", opacity: 0.45 }} />
            <Scribble color={C.primary} style={{ width: 120, bottom: 200, left: 120, opacity: 1 }} />

            {/* Card — slightly wider for the extra fields */}
            <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 460, padding: "0 20px" }}>
                <LogoMark />

                {/* Step indicator */}
                <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={{
              display: "inline-block", background: C.lavender, color: C.primary,
              padding: "5px 16px", borderRadius: 100, fontSize: 12, fontWeight: 600,
              border: `1.5px solid ${C.primary}`, fontFamily: inter,
          }}>Step 2 of 2 — Set up your profile</span>
                </div>

                <AuthCard>
                    <h2 style={{ fontFamily: faro, fontSize: 28, fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.5px", color: C.primary }}>
                        Tell us about you
                    </h2>
                    <p style={{ fontSize: 14, color: "#3a5c48", margin: "0 0 28px", fontFamily: inter }}>
                        This is what your friends will see on your profile.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                        {/* Profile pic URL */}
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: C.primary, display: "block", marginBottom: 6, fontFamily: inter }}>
                                Profile picture URL <span style={{ fontWeight: 400, color: "#3a5c48" }}>(optional)</span>
                            </label>
                            <input className="auth-input" name="profilePic" placeholder="https://example.com/your-photo.jpg" value={form.profilePic} onChange={handleChange} />
                            {/* Live preview */}
                            {form.profilePic && (
                                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                                    <img src={form.profilePic} alt="preview"
                                         onError={(e) => { e.target.style.display = "none"; }}
                                         style={{ width: 44, height: 44, borderRadius: "50%", border: `2px solid ${C.primary}`, objectFit: "cover" }} />
                                    <span style={{ fontSize: 13, color: "#3a5c48", fontFamily: inter }}>Preview</span>
                                </div>
                            )}
                        </div>

                        {/* Display name */}
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: C.primary, display: "block", marginBottom: 6, fontFamily: inter }}>
                                Display name <span style={{ fontWeight: 400, color: "#3a5c48" }}>(shown to friends)</span>
                            </label>
                            <input className="auth-input" name="name" placeholder="e.g. Harry" value={form.name} onChange={handleChange} />
                        </div>

                        {/* Bio */}
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: C.primary, display: "block", marginBottom: 6, fontFamily: inter }}>
                                Bio <span style={{ fontWeight: 400, color: "#3a5c48" }}>(optional)</span>
                            </label>
                            <textarea
                                className="auth-input"
                                name="bio"
                                placeholder="A short line about yourself..."
                                value={form.bio}
                                onChange={handleChange}
                                rows={3}
                                style={{ resize: "none", borderRadius: 14, lineHeight: 1.6 }}
                            />
                        </div>

                        {/* Private toggle */}
                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            background: "rgba(30,58,43,0.07)", borderRadius: 14, padding: "14px 16px",
                        }}>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: C.primary, fontFamily: inter }}>Private account</div>
                                <div style={{ fontSize: 12, color: "#3a5c48", marginTop: 2, fontFamily: inter }}>Hide from search and friend lists</div>
                            </div>
                            {/* Toggle */}
                            <div
                                className="toggle-track"
                                onClick={() => setForm({ ...form, isPrivate: !form.isPrivate })}
                                style={{ background: form.isPrivate ? C.primary : "transparent" }}
                            >
                                <div className="toggle-thumb" style={{
                                    transform: form.isPrivate ? "translateX(22px)" : "translateX(0px)",
                                    background: form.isPrivate ? C.accent : C.primary,
                                }} />
                            </div>
                        </div>

                        {error && (
                            <div style={{ background: "rgba(30,58,43,0.1)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.primary, fontFamily: inter }}>
                                {error}
                            </div>
                        )}

                        <button className="auth-btn" onClick={handleSubmit} disabled={loading} style={{ marginTop: 4 }}>
                            {loading ? "Saving..." : "Start chatting →"}
                        </button>

                    </div>
                </AuthCard>

                <p style={{ textAlign: "center", fontSize: 13, color: "#3a5c48", margin: "16px 0 0", fontFamily: inter, opacity: 0.7 }}>
                    You can update all of this later in your profile settings.
                </p>
            </div>
        </div>
    );
}
export default ProfileSetupPage;