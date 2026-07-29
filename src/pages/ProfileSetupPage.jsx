import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Logo from "../assets/icons/logo.svg?react";
import {StatusPicker} from "../components/StatusPicker.jsx";
import {uploadProfilePic} from "../services/profile.js";

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
      padding: 12px 16px;
      border: 2px solid ${C.primary};
      border-radius: 14px;
      font-size: 14px;
      font-family: ${inter};
      background: ${C.white};
      color: ${C.primary};
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .auth-input:focus {
      border-color: #2d5540;
      box-shadow: 0 0 0 4px rgba(30,58,43,0.1);
    }
    .auth-input::placeholder { color: rgba(30,58,43,0.35); }
    .auth-btn {
      width: 100%;
      padding: 13px;
      background: ${C.primary};
      color: ${C.accent};
      border: none;
      border-radius: 100px;
      font-size: 15px;
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
      padding: 8px 16px;
      background: ${C.primary};
      color: ${C.accent};
      border: none;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 600;
      font-family: ${inter};
      cursor: pointer;
      transition: background 0.2s, transform 0.15s;
      white-space: nowrap;
    }
    .upload-btn:hover { background: #2d5540; transform: translateY(-1px); }
    .remove-btn {
      padding: 8px 16px;
      background: transparent;
      color: ${C.primary};
      border: 1.5px solid ${C.primary};
      border-radius: 100px;
      font-size: 12px;
      font-weight: 600;
      font-family: ${inter};
      cursor: pointer;
      transition: background 0.2s;
      white-space: nowrap;
    }
    .remove-btn:hover { background: rgba(30,58,43,0.08); }
    .toggle-track {
      width: 46px; height: 24px;
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
      width: 16px; height: 16px;
      border-radius: 50%;
      transition: transform 0.2s;
    }
    .status-dropdown::-webkit-scrollbar { display: none; }
  `}</style>
);

// Status picker

export default function ProfileSetupPage() {
    const [form, setForm] = useState({ name: "", bio: "", isPrivate: false, relationshipStatus: "" });
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const [imageFile, setImageFile] = useState(null);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
        if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB."); return; }
        setError("");
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => {
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async () => {
        setError("");
        if (!form.name.trim()) { setError("Display name is required."); return; }
        setLoading(true);
        try {
            let picUrl = null;
            if (imageFile) {
                picUrl = await uploadProfilePic(imageFile);
            }
            await api.post("/api/profile/create", {
                name: form.name,
                bio: form.bio || null,
                profilePic: picUrl,
                relationshipStatus: form.relationshipStatus || null,
                isPrivate: form.isPrivate,
            });
            navigate("/app");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save profile.");
        } finally { setLoading(false); }
    };

    return (
        <div style={{
            background: C.bg, minHeight: "100vh",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0",
            position: "relative", overflow: "hidden", fontFamily: inter,
        }}>
            <PageStyles />

            {/* Background SVGs */}
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

            {/* Main wrapper — logo left, form right */}
            <div style={{
                position: "relative", zIndex: 10,
                display: "flex", alignItems: "flex-start", gap: 20,
                width: "100%", maxWidth: 520, padding: "0 20px",
            }}>

                {/* Logo — left side */}
                <div
                    onClick={() => navigate("/")}
                    style={{ cursor: "pointer", flexShrink: 0, paddingTop: 48, display: "flex", flexDirection: "column", alignItems: "center" }}
                >
                    <Logo style={{ width: 40, height: 40, color: C.primary }} />
                    <span style={{ fontSize: 11, fontWeight: 900, fontFamily: faro, color: C.primary, letterSpacing: "-0.5px", marginTop: 4 }}>
            Ripple^
          </span>
                </div>

                {/* Right side — badge + card + note */}
                <div style={{ flex: 1 }}>

                    {/* Step badge */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <h3 style={{ fontFamily: faro, fontSize: 12, fontWeight: 700, color: C.primary, margin: 0, letterSpacing: "1px", opacity: 0.45 }}>
                            PROFILE SETUP
                        </h3>
                        <span style={{
                            background: C.lavender, color: C.primary, padding: "4px 12px",
                            borderRadius: 100, fontSize: 11, fontWeight: 600,
                            border: `1.5px solid ${C.primary}`, fontFamily: inter,
                        }}>Step 2 of 2</span>
                    </div>

                    {/* Card */}
                    <div style={{
                        background: C.accent, borderRadius: 28, padding: "22px 28px",
                        border: `2.5px solid ${C.primary}`,
                        boxShadow: "6px 6px 0px rgba(30,58,43,0.15)",
                    }}>
                        <h2 style={{ fontFamily: faro, fontSize: 24, fontWeight: 900, margin: "0 0 2px", letterSpacing: "-0.5px", color: C.primary }}>
                            Tell us about you
                        </h2>
                        <p style={{ fontSize: 13, color: "#3a5c48", margin: "0 0 16px", fontFamily: inter }}>
                            This is what your friends will see on your profile.
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                            {/* Profile picture */}
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, display: "block", marginBottom: 8, fontFamily: inter }}>
                                    Profile picture <span style={{ fontWeight: 400, color: "#3a5c48" }}>(optional)</span>
                                </label>
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{
                                        width: 56, height: 56, borderRadius: "50%",
                                        border: `2px solid ${C.primary}`, background: C.white,
                                        overflow: "hidden", flexShrink: 0,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        {preview ? (
                                            <img src={preview} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                                                <circle cx="16" cy="12" r="6" stroke={C.primary} strokeWidth="2" opacity="0.4" />
                                                <path d="M 4 28 Q 4 20 16 20 Q 28 20 28 28" stroke={C.primary} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                                            </svg>
                                        )}
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
                                            {preview ? "Change photo" : "Upload photo"}
                                        </button>
                                        {preview && <button className="remove-btn" onClick={handleRemoveImage}>Remove</button>}
                                        <span style={{ fontSize: 11, color: "#3a5c48", fontFamily: inter }}>JPG, PNG · Max 5MB</span>
                                    </div>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                            </div>

                            {/* Display name */}
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, display: "block", marginBottom: 5, fontFamily: inter }}>
                                    Display name <span style={{ fontWeight: 400, color: "#3a5c48" }}>(shown to friends)</span>
                                </label>
                                <input className="auth-input" name="name" placeholder="e.g. Harry" value={form.name} onChange={handleChange} />
                            </div>

                            {/* Bio */}
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, display: "block", marginBottom: 5, fontFamily: inter }}>
                                    Bio <span style={{ fontWeight: 400, color: "#3a5c48" }}>(optional)</span>
                                </label>
                                <textarea
                                    className="auth-input"
                                    name="bio"
                                    placeholder="A short line about yourself..."
                                    value={form.bio}
                                    onChange={handleChange}
                                    rows={2}
                                    style={{ resize: "none", borderRadius: 14, lineHeight: 1.5 }}
                                />
                            </div>

                            {/* Relationship status */}
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, display: "block", marginBottom: 5, fontFamily: inter }}>
                                    Relationship status <span style={{ fontWeight: 400, color: "#3a5c48" }}>(optional)</span>
                                </label>
                                <StatusPicker
                                    value={form.relationshipStatus}
                                    onChange={(val) => setForm({ ...form, relationshipStatus: val })}
                                />
                            </div>

                            {/* Private toggle */}
                            <div style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                background: "rgba(30,58,43,0.07)", borderRadius: 12, padding: "11px 14px",
                            }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: C.primary, fontFamily: inter }}>Private account</div>
                                    <div style={{ fontSize: 11, color: "#3a5c48", marginTop: 1, fontFamily: inter }}>Hide from search and friend lists</div>
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
                                <div style={{ background: "rgba(30,58,43,0.1)", borderRadius: 10, padding: "9px 13px", fontSize: 12, color: C.primary, fontFamily: inter }}>
                                    {error}
                                </div>
                            )}

                            <button className="auth-btn" onClick={handleSubmit} disabled={loading} style={{ marginTop: 2 }}>
                                {loading ? "Saving..." : "Start chatting →"}
                            </button>
                        </div>
                    </div>

                    <p style={{ textAlign: "center", fontSize: 11, color: "#3a5c48", margin: "8px 0 0", fontFamily: inter, opacity: 0.6 }}>
                        You can update all of this later in your profile settings.
                    </p>
                </div>
            </div>
        </div>
    );
}