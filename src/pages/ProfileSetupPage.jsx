import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Logo from "../assets/icons/logo.svg?react";

const C = {
    bg: "#f8f4f0",
    primary: "#1e3a2b",
    accent: "#eff87a",
    lavender: "#cfdcff",
    white: "#ffffff",
};
const faro = "'Faro', sans-serif";
const inter = "'Inter', sans-serif";

// SVG elements
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
              stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
);

const PageStyles = () => (
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
    .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .upload-btn {
      padding: 8px 18px;
      background: ${C.primary};
      color: ${C.accent};
      border: none;
      border-radius: 100px;
      font-size: 13px;
      font-weight: 600;
      font-family: ${inter};
      cursor: pointer;
      transition: background 0.2s, transform 0.15s;
    }
    .upload-btn:hover {
      background: #2d5540;
      transform: translateY(-1px);
    }
    .remove-btn {
      padding: 8px 18px;
      background: transparent;
      color: ${C.primary};
      border: 1.5px solid ${C.primary};
      border-radius: 100px;
      font-size: 13px;
      font-weight: 600;
      font-family: ${inter};
      cursor: pointer;
      transition: background 0.2s;
    }
    .remove-btn:hover {
      background: rgba(30,58,43,0.08);
    }
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
const LogoMark = ({ onClick }) => (
    <div
        onClick={onClick}
        style={{
            textAlign: "center",
            marginBottom: 28,
            cursor: "pointer", // Shows hand cursor
        }}
    >
        <div
            style={{
                width: 52,
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 4px",
            }}
        >
            <Logo
                style={{
                    width: "100%",
                    height: "100%",
                    color: C.primary,
                }}
            />
        </div>

        <span
            style={{
                fontSize: 28,
                fontWeight: 900,
                fontFamily: faro,
                letterSpacing: "-1px",
                color: C.primary,
            }}
        >
            Ripple^
        </span>
    </div>
);

export default function ProfileSetupPage() {
    const [form, setForm] = useState({ name: "", bio: "", isPrivate: false });
    const [preview, setPreview] = useState(null);   // base64 or object URL for display
    const [imageFile, setImageFile] = useState(null); // actual File object
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // When user picks a file — create a local preview URL
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Please select an image file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be under 5MB.");
            return;
        }
        setError("");
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => {
        setPreview(null);
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async () => {
        setError("");
        if (!form.name.trim()) {
            setError("Display name is required.");
            return;
        }
        setLoading(true);
        try {
            // For now send null for profilePic — wire up file upload endpoint later
            // When you have a file upload endpoint, upload imageFile first,
            // get back a URL, then pass it as profilePic below
            const profilePicUrl = null; // replace with upload URL when ready

            await api.post("/api/profile/create", {
                name: form.name,
                bio: form.bio || null,
                profilePic: profilePicUrl,
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
        <div style={{
            background: C.bg, minHeight: "100vh",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden", fontFamily: inter,
        }}>
            <PageStyles />

            {/* Background SVG decorations */}
            <Swoosh color={C.accent} style={{ width: 280, top: 30, left: -20, opacity: 0.7 }} />
            <Swoosh color={C.lavender} style={{ width: 260, bottom: 40, right: -20, opacity: 0.6 }} />
            <CurlyLine color={C.lavender} style={{ width: 65, top: 40, right: 60, opacity: 0.8 }} />
            <CurlyLine color={C.accent} style={{ width: 60, bottom: 60, left: 50, opacity: 0.7 }} />
            <SketchCircle color={C.lavender} style={{ width: 320, top: -80, right: -80, opacity: 0.3 }} />
            <SketchCircle color={C.accent} style={{ width: 280, bottom: -70, left: -70, opacity: 0.25 }} />
            <DotGrid color={C.primary} style={{ width: 100, top: 80, left: 80, opacity: 1 }} />
            <DotGrid color={C.primary} style={{ width: 100, bottom: 80, right: 80, opacity: 1 }} />
            <WaveLine color={C.accent} style={{ width: 200, top: 200, right: "18%", opacity: 0.45 }} />
            <Scribble color={C.primary} style={{ width: 120, bottom: 200, left: 120, opacity: 1 }} />

            <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 460, padding: "0 20px" }}>
                <LogoMark onClick={() => navigate("/")} />

                {/* Step badge */}
                <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={{
              display: "inline-block", background: C.lavender, color: C.primary,
              padding: "5px 16px", borderRadius: 100, fontSize: 12, fontWeight: 600,
              border: `1.5px solid ${C.primary}`, fontFamily: inter,
          }}>Step 2 of 2 — Set up your profile</span>
                </div>

                {/* Card */}
                <div style={{
                    background: C.accent, borderRadius: 32, padding: "40px 40px 36px",
                    border: `2.5px solid ${C.primary}`,
                    boxShadow: "6px 6px 0px rgba(30,58,43,0.15)",
                    position: "relative",
                }}>
                    <h2 style={{ fontFamily: faro, fontSize: 28, fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.5px", color: C.primary }}>
                        Tell us about you
                    </h2>
                    <p style={{ fontSize: 14, color: "#3a5c48", margin: "0 0 28px", fontFamily: inter }}>
                        This is what your friends will see on your profile.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                        {/* ── PROFILE PICTURE UPLOAD ── */}
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: C.primary, display: "block", marginBottom: 12, fontFamily: inter }}>
                                Profile picture <span style={{ fontWeight: 400, color: "#3a5c48" }}>(optional)</span>
                            </label>

                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                {/* Circular preview */}
                                <div style={{
                                    width: 80, height: 80, borderRadius: "50%",
                                    border: `2.5px solid ${C.primary}`,
                                    background: C.white,
                                    overflow: "hidden",
                                    flexShrink: 0,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    position: "relative",
                                }}>
                                    {preview ? (
                                        <img src={preview} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                            <circle cx="16" cy="12" r="6" stroke={C.primary} strokeWidth="2" opacity="0.4" />
                                            <path d="M 4 28 Q 4 20 16 20 Q 28 20 28 28" stroke={C.primary} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                                        </svg>
                                    )}
                                </div>

                                {/* Buttons beside the circle */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
                                        {preview ? "Change photo" : "Upload photo"}
                                    </button>
                                    {preview && (
                                        <button className="remove-btn" onClick={handleRemoveImage}>
                                            Remove
                                        </button>
                                    )}
                                    <span style={{ fontSize: 12, color: "#3a5c48", fontFamily: inter }}>
                    JPG, PNG · Max 5MB
                  </span>
                                </div>
                            </div>

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                            />
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
                </div>

                <p style={{ textAlign: "center", fontSize: 13, color: "#3a5c48", margin: "16px 0 0", fontFamily: inter, opacity: 0.7 }}>
                    You can update all of this later in your profile settings.
                </p>
            </div>
        </div>
    );
}