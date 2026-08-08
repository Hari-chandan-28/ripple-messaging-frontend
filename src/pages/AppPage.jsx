import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {StatusPicker} from "../components/StatusPicker.jsx";

// ─── API SETUP ───────────────────────────────────────────────
const api = axios.create({ baseURL: "http://localhost:8081" });
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const getChats = () => api.get("/api/message/get/conversation");
const getMessages = (id) => api.get(`/api/message/get/conversation/${id}`);
const createConversation = (id) => api.post(`/api/message/create/conversation/${id}`);
const getFriends = () => api.get("/api/friendship/friends");
const getPendingFn = () => api.get("/api/friendship/pending");
const sendRequest = (id) => api.post(`/api/friendship/request/${id}`);
const acceptRequest = (id) => api.put(`/api/friendship/accept/${id}`);
const rejectRequest = (id) => api.delete(`/api/friendship/reject/${id}`);
const removeFriend = (id) => api.delete(`/api/friendship/remove/${id}`);
const searchUsers = (q) => api.get(`/api/search/profile?username=${q}`);
const getMyProfile = (id) => api.get(`/api/profile/${id}`);
const updateProfile = (data) => api.put("/api/profile/update", data);
const uploadProfilePic = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    const r = await api.post("/api/profile/upload-pic", fd, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return r.data.url;
};

// ─── DESIGN TOKENS ───────────────────────────────────────────
const C = {
    bg: "#f8f4f0", primary: "#1e3a2b", accent: "#eff87a",
    lavender: "#cfdcff", white: "#ffffff", border: "rgba(30,58,43,0.12)",
    muted: "rgba(30,58,43,0.45)",
};
const faro = "'Faro', sans-serif";
const inter = "'Inter', sans-serif";

// ─── HELPERS ─────────────────────────────────────────────────
const toUrl = (u) =>
    !u ? null : (u.startsWith("http") || u.startsWith("blob:")) ? u : `http://localhost:8081${u}`;

const formatTime = (ts) => {
    if (!ts) return "";
    try {
        const d = new Date(ts);
        if (isNaN(d)) return "";
        const now = new Date();
        const diff = now - d;
        if (diff < 86400000 && d.getDate() === now.getDate())
            return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        if (diff < 604800000)
            return d.toLocaleDateString([], { weekday: "short" });
        return d.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch { return ""; }
};

const fmtLastSeen = (ts) => {
    if (!ts) return "last seen a while ago";
    try {
        const d = new Date(ts);
        if (isNaN(d)) return "last seen a while ago";
        const diff = Date.now() - d.getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (diff < 60000) return "last seen just now";
        if (mins < 60) return `last seen ${mins}m ago`;
        if (hours < 24) return `last seen ${hours}h ago`;
        if (days === 1) return `last seen yesterday at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        if (days < 7) return `last seen ${d.toLocaleDateString([], { weekday: "long" })}`;
        return `last seen ${d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}`;
    } catch { return "last seen a while ago"; }
};

const getMyUserId = () => {
    try { return JSON.parse(atob(localStorage.getItem("token").split(".")[1])).userId; }
    catch { return null; }
};

const RL = {
    SINGLE: "Single", COMMITTED: "In a relationship",
    MARRIED: "Married", COMPLICATED: "It's complicated",
};

// ─── GLOBAL STYLES ───────────────────────────────────────────
const GlobalStyles = () => (
    <style>{`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-thumb { background: rgba(30,58,43,0.15); border-radius: 3px; }
    .hov:hover { background: rgba(30,58,43,0.05) !important; }
    .act { background: rgba(239,248,122,0.45) !important; }
    .icon-btn {
      background: none; border: none; cursor: pointer; padding: 7px;
      border-radius: 9px; display: flex; align-items: center;
      justify-content: center; transition: background .15s; color: ${C.primary};
    }
    .icon-btn:hover { background: rgba(30,58,43,0.08); }
    .primary-btn {
      width: 100%; padding: 13px; background: ${C.primary}; color: ${C.accent};
      border: none; border-radius: 100px; font-size: 14px; font-weight: 700;
      font-family: ${inter}; cursor: pointer; transition: background .2s, transform .15s;
    }
    .primary-btn:hover:not(:disabled) { background: #2d5540; transform: translateY(-1px); }
    .primary-btn:disabled { opacity: .55; cursor: default; }
    .secondary-btn {
      width: 100%; padding: 13px; background: transparent; color: ${C.primary};
      border: 1.5px solid ${C.primary}; border-radius: 100px; font-size: 14px;
      font-weight: 600; font-family: ${inter}; cursor: pointer; transition: background .15s;
    }
    .secondary-btn:hover { background: rgba(30,58,43,0.06); }
    .ghost-btn {
      width: 100%; padding: 13px; background: transparent; color: rgba(30,58,43,0.5);
      border: 1.5px solid rgba(30,58,43,0.18); border-radius: 100px; font-size: 14px;
      font-weight: 600; font-family: ${inter}; cursor: pointer;
    }
    .ghost-btn:hover { background: rgba(30,58,43,0.05); }
    .auth-input {
      width: 100%; padding: 12px 16px; border: 2px solid ${C.primary};
      border-radius: 14px; font-size: 14px; font-family: ${inter};
      background: ${C.white}; color: ${C.primary}; outline: none;
      transition: box-shadow .2s;
    }
    .auth-input:focus { box-shadow: 0 0 0 4px rgba(30,58,43,0.1); }
    .auth-input::placeholder { color: rgba(30,58,43,0.32); }
    .msg-input {
      flex: 1; padding: 11px 16px; border: 2px solid transparent;
      border-radius: 100px; font-size: 14px; font-family: ${inter};
      background: rgba(30,58,43,0.06); color: ${C.primary}; outline: none;
      transition: border-color .2s, background .2s;
    }
    .msg-input:focus { border-color: ${C.primary}; background: ${C.white}; }
    .msg-input::placeholder { color: rgba(30,58,43,0.32); }
    .send-btn {
      width: 38px; height: 38px; border-radius: 50%; background: ${C.primary};
      border: none; cursor: pointer; display: flex; align-items: center;
      justify-content: center; flex-shrink: 0; transition: background .15s, transform .15s;
    }
    .send-btn:hover { background: #2d5540; transform: scale(1.06); }
    .status-dropdown::-webkit-scrollbar { display: none; }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); opacity: 0.4; }
      50% { transform: translateY(-4px); opacity: 1; }
    }
  `}</style>
);

// ─── ATOMS ───────────────────────────────────────────────────
function Avatar({ name, pic, size = 40, online, lastSeen }) {
    const initials = (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    return (
        <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
                width: size, height: size, borderRadius: "50%",
                background: pic ? "transparent" : C.lavender,
                border: `2px solid ${C.primary}`, overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: faro, fontWeight: 900, fontSize: Math.round(size * .34), color: C.primary,
            }}>
                {pic
                    ? <img src={toUrl(pic)} alt={name}
                           style={{ width: "100%", height: "100%", objectFit: "cover" }}
                           onError={e => { e.target.style.display = "none"; }} />
                    : initials}
            </div>
            {online !== undefined && (
                <div style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: Math.max(8, size * .22), height: Math.max(8, size * .22),
                    borderRadius: "50%",
                    background: online ? "#4ade80" : "rgba(30,58,43,0.25)",
                    border: `2px solid ${C.bg}`,
                }} title={online ? "Online" : fmtLastSeen(lastSeen)} />
            )}
        </div>
    );
}

function Ticks({ status }) {
    const color = status === "read" ? "#60a5fa" : "#FFFFFF";
    if (status === "sent") return (
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" style={{ flexShrink: 0 }}>
            <path d="M1 5l3 3 5-7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
    return (
        <svg width="18" height="10" viewBox="0 0 18 10" fill="none" style={{ flexShrink: 0 }}>
            <path d="M1 5l3 3 5-7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 5l3 3 5-7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(30,58,43,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999, padding: 24,
        }}>
            <div style={{
                background: C.bg, borderRadius: 24, padding: 28,
                border: `2px solid ${C.primary}`, maxWidth: 340, width: "100%",
                boxShadow: "6px 6px 0 rgba(30,58,43,0.14)",
            }}>
                <p style={{ fontFamily: faro, fontSize: 18, fontWeight: 900, color: C.primary, marginBottom: 20, lineHeight: 1.3 }}>
                    {message}
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                    <button className="primary-btn" onClick={onConfirm}>Confirm</button>
                    <button className="secondary-btn" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

function PanelHeader({ title, onClose }) {
    return (
        <div style={{
            padding: "15px 20px", borderBottom: `1.5px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}>
      <span style={{ fontFamily: faro, fontSize: 19, fontWeight: 900, color: C.primary, letterSpacing: "-.4px" }}>
        {title}
      </span>
            <button className="icon-btn" onClick={onClose}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6 6 18M6 6l12 12" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>
        </div>
    );
}

function BackBtn({ label, onClick }) {
    return (
        <button onClick={onClick} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            color: C.muted, fontSize: 13, fontFamily: inter, fontWeight: 600,
            padding: "12px 20px 6px",
        }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {label}
        </button>
    );
}

function EmptyNote({ text }) {
    return (
        <div style={{ textAlign: "center", padding: "36px 20px", color: C.muted, fontSize: 13, fontFamily: inter, lineHeight: 1.6 }}>
            {text}
        </div>
    );
}

function SectionLabel({ text }) {
    return (
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: C.muted, padding: "10px 10px 4px", fontFamily: inter }}>
            {text}
        </div>
    );
}

// ─── UNIVERSAL PROFILE VIEW ───────────────────────────────────
function ProfileView({ userId, myUserId, onStartChat, onFriendshipChange, onEditProfile, onlineUsers }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirm, setConfirm] = useState(null);
    const [busy, setBusy] = useState(false);
    const isOwn = userId === myUserId;
    const isOnline = onlineUsers?.[userId];

    useEffect(() => { userId && load(); }, [userId]);

    const load = async () => {
        setLoading(true);
        try { const r = await getMyProfile(userId); setProfile(r.data); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const ask = (msg, fn) => setConfirm({ msg, fn });

    const act = async (fn) => {
        setBusy(true);
        try { await fn(); await load(); onFriendshipChange?.(); }
        catch (e) { console.error(e); }
        finally { setBusy(false); }
    };

    if (loading) return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontFamily: inter, fontSize: 13 }}>
            Loading...
        </div>
    );

    if (!profile) return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontFamily: inter, fontSize: 13 }}>
            Profile not found.
        </div>
    );

    const fs = profile.friendshipStatus;
    const isSender = profile.isSender;

    return (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            {confirm && (
                <ConfirmDialog
                    message={confirm.msg}
                    onConfirm={() => { setConfirm(null); confirm.fn(); }}
                    onCancel={() => setConfirm(null)}
                />
            )}

            <div style={{
                background: C.accent, borderRadius: 22, padding: "28px 20px",
                border: `2px solid ${C.primary}`, boxShadow: "4px 4px 0 rgba(30,58,43,0.11)",
                display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10,
            }}>
                <Avatar name={profile.name || profile.username} pic={profile.profilePic} size={80}
                        online={isOwn ? undefined : isOnline} lastSeen={profile.lastSeen} />
                <div>
                    <div style={{ fontFamily: faro, fontSize: 22, fontWeight: 900, color: C.primary, letterSpacing: "-.5px" }}>
                        {profile.name || profile.username}
                    </div>
                    <div style={{ fontSize: 13, color: "#3a5c48", fontFamily: inter, marginTop: 3 }}>@{profile.username}</div>
                    {!isOwn && (
                        <div style={{ fontSize: 12, color: "#3a5c48", fontFamily: inter, marginTop: 4 }}>
                            {isOnline ? "🟢 Online" : fmtLastSeen(profile.lastSeen)}
                        </div>
                    )}
                </div>
                {profile.bio && (
                    <div style={{ fontSize: 14, color: "#3a5c48", fontFamily: inter, lineHeight: 1.55, maxWidth: 280 }}>
                        {profile.bio}
                    </div>
                )}
                {profile.relationshipStatus && (
                    <span style={{
                        display: "inline-block", background: C.lavender, color: C.primary,
                        padding: "4px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                        border: `1.5px solid ${C.primary}`, fontFamily: inter,
                    }}>
            {RL[profile.relationshipStatus] || profile.relationshipStatus}
          </span>
                )}
                {isOwn && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#3a5c48", fontFamily: inter }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: profile.isPrivate ? "rgba(30,58,43,0.3)" : "#4ade80" }} />
                        {profile.isPrivate ? "Private" : "Public"} account
                    </div>
                )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {isOwn ? (
                    <button className="primary-btn" onClick={onEditProfile}>Edit profile</button>
                ) : (
                    <>
                        {fs === 2 && (
                            <>
                                <button className="primary-btn"
                                        onClick={() => onStartChat && act(async () => { const r = await createConversation(userId); onStartChat(r.data); })}
                                        disabled={busy}>
                                    Message
                                </button>
                                <button className="ghost-btn"
                                        onClick={() => ask(`Remove ${profile?.name || profile?.username} from friends?`, () => act(() => removeFriend(userId)))}
                                        disabled={busy}>
                                    Remove friend
                                </button>
                            </>
                        )}
                        {!fs && (
                            <button className="primary-btn" onClick={() => act(() => sendRequest(userId))} disabled={busy}>
                                {busy ? "Sending..." : "Add friend"}
                            </button>
                        )}
                        {fs === 1 && isSender === true && (
                            <button className="secondary-btn"
                                    onClick={() => ask("Take back your friend request?", () => act(() => rejectRequest(userId)))}
                                    disabled={busy}>
                                Pending — take back?
                            </button>
                        )}
                        {fs === 1 && isSender === false && (
                            <div style={{ display: "flex", gap: 9 }}>
                                <button className="primary-btn" onClick={() => act(() => acceptRequest(userId))} disabled={busy}>Accept</button>
                                <button className="secondary-btn"
                                        onClick={() => ask("Decline this request?", () => act(() => rejectRequest(userId)))}
                                        disabled={busy}>
                                    Decline
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// ─── OWN PROFILE EDIT ─────────────────────────────────────────
    function OwnProfileEdit({ profile, onSaved, onCancel }) {
    const [form, setForm] = useState({
        name: profile?.name || "",
        bio: profile?.bio || "",
        relationshipStatus: profile?.relationshipStatus || "",
        isPrivate: profile?.isPrivate || false,
        showOnlineStatus: profile?.showOnlineStatus ?? true,  // ADD THIS
    });
    const [preview, setPreview] = useState(profile?.profilePic || null);
    const [imgFile, setImgFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");
    const fRef = useRef(null);

    const onFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (!f.type.startsWith("image/")) { setErr("Select an image."); return; }
        if (f.size > 5 * 1024 * 1024) { setErr("Max 5MB."); return; }
        setErr(""); setImgFile(f); setPreview(URL.createObjectURL(f));
    };

    const save = async () => {
        if (!form.name.trim()) { setErr("Name required."); return; }
        setSaving(true); setErr("");
        try {
            let pic = profile?.profilePic || null;
            if (imgFile) pic = await uploadProfilePic(imgFile);
            if (!preview && !imgFile) pic = null;
            await updateProfile({
                name: form.name, bio: form.bio || null,
                profilePic: pic,
                relationshipStatus: form.relationshipStatus || null,
                isPrivate: form.isPrivate,
            });
            // Update online status visibility separately
            await api.patch("/api/auth/me/online-status", {
                showOnlineStatus: form.showOnlineStatus,
            });
            onSaved();
        } catch { setErr("Save failed."); }
        finally { setSaving(false); }
    };
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "16px 20px 24px" }}>
            {/* Profile picture */}
            <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.primary, display: "block", marginBottom: 10, fontFamily: inter }}>
                    Profile picture
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: "50%", border: `2px solid ${C.primary}`,
                        background: C.lavender, overflow: "hidden", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        {preview
                            ? <img src={preview.startsWith("blob:") ? preview : toUrl(preview)} alt="pic"
                                   style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                                <circle cx="16" cy="12" r="6" stroke={C.primary} strokeWidth="2" opacity=".4" />
                                <path d="M4 28 Q4 20 16 20 Q28 20 28 28" stroke={C.primary} strokeWidth="2" strokeLinecap="round" opacity=".4" />
                            </svg>
                        }
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <button onClick={() => fRef.current?.click()} style={{
                            padding: "8px 16px", background: C.primary, color: C.accent,
                            border: "none", borderRadius: 100, fontSize: 12, fontWeight: 600,
                            fontFamily: inter, cursor: "pointer",
                        }}>
                            {preview ? "Change" : "Upload"}
                        </button>
                        {preview && (
                            <button onClick={() => { setPreview(null); setImgFile(null); if (fRef.current) fRef.current.value = ""; }}
                                    style={{ padding: "8px 16px", background: "transparent", color: C.primary, border: `1.5px solid ${C.primary}`, borderRadius: 100, fontSize: 12, fontWeight: 600, fontFamily: inter, cursor: "pointer" }}>
                                Remove
                            </button>
                        )}
                        <span style={{ fontSize: 11, color: "#3a5c48", fontFamily: inter }}>JPG/PNG · 5MB max</span>
                    </div>
                </div>
                <input ref={fRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
            </div>

            {/* Display name */}
            <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.primary, display: "block", marginBottom: 5, fontFamily: inter }}>Display name</label>
                <input className="auth-input" placeholder="Your name" value={form.name}
                       onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>

            {/* Bio */}
            <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.primary, display: "block", marginBottom: 5, fontFamily: inter }}>Bio</label>
                <textarea className="auth-input" placeholder="Short bio..." value={form.bio}
                          onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                          rows={3} style={{ resize: "none", borderRadius: 14, lineHeight: 1.5 }} />
            </div>

            {/* Relationship status */}
            <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.primary, display: "block", marginBottom: 5, fontFamily: inter }}>Relationship status</label>
                <StatusPicker
                    value={form.relationshipStatus}
                    onChange={(val) => setForm({ ...form, relationshipStatus: val })}
                />
            </div>

            {/* Private toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(30,58,43,0.06)", borderRadius: 14, padding: "13px 15px" }}>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.primary, fontFamily: inter }}>Private account</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2, fontFamily: inter }}>Hide from search</div>
                </div>
                <div onClick={() => setForm(f => ({ ...f, isPrivate: !f.isPrivate }))}
                     style={{ width: 44, height: 23, borderRadius: 100, border: `2px solid ${C.primary}`, cursor: "pointer", display: "flex", alignItems: "center", padding: 2, background: form.isPrivate ? C.primary : "transparent", transition: "background .2s" }}>
                    <div style={{ width: 15, height: 15, borderRadius: "50%", background: form.isPrivate ? C.accent : C.primary, transition: "transform .2s", transform: form.isPrivate ? "translateX(21px)" : "translateX(0)" }} />
                </div>
            </div>
            {/* Show online status toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(30,58,43,0.06)", borderRadius: 14, padding: "13px 15px" }}>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.primary, fontFamily: inter }}>Show online status</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2, fontFamily: inter }}>Let others see when you're active</div>
                </div>
                <div
                    onClick={() => setForm(f => ({ ...f, showOnlineStatus: !f.showOnlineStatus }))}
                    style={{ width: 44, height: 23, borderRadius: 100, border: `2px solid ${C.primary}`, cursor: "pointer", display: "flex", alignItems: "center", padding: 2, background: form.showOnlineStatus ? C.primary : "transparent", transition: "background .2s" }}
                >
                    <div style={{ width: 15, height: 15, borderRadius: "50%", background: form.showOnlineStatus ? C.accent : C.primary, transition: "transform .2s", transform: form.showOnlineStatus ? "translateX(21px)" : "translateX(0)" }} />
                </div>
            </div>

            {err && (
                <div style={{ background: "rgba(30,58,43,0.08)", borderRadius: 10, padding: "9px 13px", fontSize: 13, color: C.primary, fontFamily: inter }}>
                    {err}
                </div>
            )}

            <div style={{ display: "flex", gap: 9, marginTop: 4 }}>
                <button className="primary-btn" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
                <button className="secondary-btn" onClick={onCancel} style={{ width: "auto", padding: "13px 20px" }}>Cancel</button>
            </div>
        </div>
    );
}

// ─── GROUP CREATE MODAL ───────────────────────────────────────
function GroupCreateModal({ friends, onClose, onCreated }) {
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [preview, setPreview] = useState(null);
    const [imgFile, setImgFile] = useState(null);
    const [selected, setSelected] = useState([]);
    const [creating, setCreating] = useState(false);
    const [err, setErr] = useState("");
    const fRef = useRef(null);

    const onFile = (e) => {
        const f = e.target.files[0];
        if (!f || !f.type.startsWith("image/")) return;
        setImgFile(f); setPreview(URL.createObjectURL(f));
    };

    const toggleMember = (id) =>
        setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

    const create = async () => {
        if (!name.trim()) { setErr("Group name is required."); return; }
        setCreating(true); setErr("");
        try {
            let pic = null;
            if (imgFile) pic = await uploadProfilePic(imgFile);
            await api.post("/api/groups/create/all", {
                name: name.trim(), description: desc.trim() || null,
                profilePic: pic, memberIds: selected,
            });
            onCreated(); onClose();
        } catch { setErr("Failed to create group."); }
        finally { setCreating(false); }
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(30,58,43,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9998, padding: 20 }}>
            <div style={{ background: C.bg, borderRadius: 28, width: "100%", maxWidth: 440, maxHeight: "85vh", display: "flex", flexDirection: "column", border: `2px solid ${C.primary}`, boxShadow: "6px 6px 0 rgba(30,58,43,0.14)", overflow: "hidden" }}>

                <div style={{ padding: "18px 20px", borderBottom: `1.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                        <div style={{ fontFamily: faro, fontSize: 18, fontWeight: 900, color: C.primary }}>New Group</div>
                        <div style={{ fontSize: 12, color: C.muted, fontFamily: inter, marginTop: 2 }}>Step {step} of 2</div>
                    </div>
                    <button className="icon-btn" onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6 6 18M6 6l12 12" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {step === 1 && (
                    <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => fRef.current?.click()}>
                                <div style={{ width: 80, height: 80, borderRadius: "50%", border: `2px solid ${C.primary}`, background: C.lavender, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {preview
                                        ? <img src={preview} alt="group" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        : <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={C.primary} strokeWidth="2" strokeLinecap="round" opacity=".5" />
                                            <circle cx="9" cy="7" r="4" stroke={C.primary} strokeWidth="2" opacity=".5" />
                                        </svg>
                                    }
                                </div>
                                <div style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${C.bg}` }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 5v14M5 12h14" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                            <input ref={fRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: C.primary, display: "block", marginBottom: 5, fontFamily: inter }}>Group name *</label>
                                <input className="auth-input" placeholder="e.g. Team Ripple" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: C.primary, display: "block", marginBottom: 5, fontFamily: inter }}>
                                    Description <span style={{ fontWeight: 400, color: C.muted }}>(optional)</span>
                                </label>
                                <textarea className="auth-input" placeholder="What's this group about..." value={desc}
                                          onChange={e => setDesc(e.target.value)} rows={3} style={{ resize: "none", borderRadius: 14, lineHeight: 1.5 }} />
                            </div>
                            {err && <div style={{ background: "rgba(30,58,43,0.08)", borderRadius: 10, padding: "9px 13px", fontSize: 13, color: C.primary, fontFamily: inter }}>{err}</div>}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                        <div style={{ fontSize: 13, color: C.muted, fontFamily: inter, marginBottom: 12, padding: "0 4px" }}>
                            Select friends to add ({selected.length} selected)
                        </div>
                        {friends.length === 0 ? <EmptyNote text="No friends to add." /> : friends.map(f => (
                            <div key={f.friendId} onClick={() => toggleMember(f.friendId)}
                                 style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 10px", borderRadius: 13, marginBottom: 1, cursor: "pointer", background: selected.includes(f.friendId) ? "rgba(239,248,122,0.35)" : "transparent", transition: "background .15s" }}>
                                <Avatar name={f.friendName || f.friendUsername} pic={f.friendProfilePic} size={42} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: C.primary, fontFamily: inter }}>{f.friendName || f.friendUsername}</div>
                                    <div style={{ fontSize: 12, color: C.muted, fontFamily: inter }}>@{f.friendUsername}</div>
                                </div>
                                <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${C.primary}`, background: selected.includes(f.friendId) ? C.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    {selected.includes(f.friendId) && (
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                            <path d="M2 6l3 3 5-5" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        ))}
                        {err && <div style={{ background: "rgba(30,58,43,0.08)", borderRadius: 10, padding: "9px 13px", fontSize: 13, color: C.primary, fontFamily: inter, marginTop: 8 }}>{err}</div>}
                    </div>
                )}

                <div style={{ padding: "14px 20px", borderTop: `1.5px solid ${C.border}`, display: "flex", gap: 9 }}>
                    {step === 1 ? (
                        <>
                            <button className="secondary-btn" onClick={onClose} style={{ width: "auto", padding: "12px 20px" }}>Cancel</button>
                            <button className="primary-btn" onClick={() => { if (!name.trim()) { setErr("Name required."); return; } setErr(""); setStep(2); }}>
                                Next — Add members
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="secondary-btn" onClick={() => setStep(1)} style={{ width: "auto", padding: "12px 20px" }}>Back</button>
                            <button className="primary-btn" onClick={create} disabled={creating}>
                                {creating ? "Creating..." : `Create group${selected.length > 0 ? ` (${selected.length})` : ""}`}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── GROUP DETAIL PANEL ───────────────────────────────────────
function GroupDetailPanel({ convoId, friends, myUserId, onRefresh, onGroupDeleted }) {
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({ name: "", description: "" });
    const [preview, setPreview] = useState(null);
    const [imgFile, setImgFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [selectedToAdd, setSelectedToAdd] = useState([]);
    const [confirm, setConfirm] = useState(null);
    const [actionErr, setActionErr] = useState("");
    const fRef = useRef(null);

    useEffect(() => { loadGroupInfo(); }, [convoId]);

    const loadGroupInfo = async () => {
        setLoading(true);
        try {
            const chatsRes = await getChats();
            const convo = chatsRes.data.find(c => c.conversationId === convoId);
            if (convo?.groupId) {
                const membersRes = await api.get(`/api/groups/${convo.groupId}`);
                setMembers(membersRes.data);
                setGroup(convo);
                setForm({ name: convo.name || "", description: convo.description || "" });
                setPreview(convo.profilePic || null);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f || !f.type.startsWith("image/")) return;
        setImgFile(f); setPreview(URL.createObjectURL(f));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let pic = group?.profilePic || null;
            if (imgFile) pic = await uploadProfilePic(imgFile);
            await api.put("/api/groups/update", {
                groupId: group.groupId,
                name: form.name,
                description: form.description,
                profilePic: pic,
            });
            await loadGroupInfo();
            onRefresh();
            setEditMode(false);
            setImgFile(null);
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const handleKick = (memberId, username) => {
        setConfirm({
            msg: `Remove ${username} from group?`,
            fn: async () => {
                try {
                    await api.delete(`/api/groups/${group.groupId}/remove/${memberId}`);
                    setMembers([]); await loadGroupInfo();
                } catch {}
            }
        });
    };

    // Role body is sent as plain string matching enum value
    const handleChangeRole = (memberId, username, currentRole) => {
        const newRole = currentRole === "MEMBER" ? "ADMIN" : "MEMBER";
        const label = newRole === "ADMIN" ? "Make admin" : "Remove admin";
        setConfirm({
            msg: `${label} for ${username}?`,
            fn: async () => {
                try {
                    await api.put(
                        `/api/groups/${group.groupId}/role/${memberId}`,
                        newRole,  // plain string — matches GroupRole enum
                        { headers: { "Content-Type": "application/json" } }
                    );
                    setMembers([]); await loadGroupInfo();
                } catch {}
            }
        });
    };

    const handleLeave = () => {
        setConfirm({
            msg: "Leave this group? You won't be able to rejoin unless added back.",
            fn: async () => {
                try {
                    await api.delete(`/api/groups/leave/${group.groupId}`);
                    onGroupDeleted?.();
                } catch (e) {
                    setActionErr(e.response?.data?.message || "Cannot leave the group.");
                }
            }
        });
    };

    const handleDelete = () => {
        setConfirm({
            msg: `Delete "${group?.name}"? This cannot be undone. All messages will be lost.`,
            fn: async () => {
                try {
                    await api.delete(`/api/groups/delete/${group.groupId}`);
                    onGroupDeleted?.();
                } catch (e) {
                    setActionErr(e.response?.data?.message || "Failed to delete group.");
                }
            }
        });
    };

    const handleAddMembers = async () => {
        try {
            for (const id of selectedToAdd) {
                await api.post(`/api/groups/${group.groupId}/add/${id}`);
            }
            setSelectedToAdd([]);
            setShowAdd(false);
            setMembers([]);
            await loadGroupInfo();
        } catch {}
    };

    const available = friends.filter(f => !members.some(m => m.memberId === f.friendId));
    const myRole = members.find(m => m.memberId === myUserId)?.role;
    const isOwner = myRole === "OWNER";
    const isAdmin = myRole === "ADMIN" || isOwner;

    if (loading) return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontFamily: inter, fontSize: 13 }}>
            Loading...
        </div>
    );

    return (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            {confirm && (
                <ConfirmDialog
                    message={confirm.msg}
                    onConfirm={() => { setConfirm(null); confirm.fn(); }}
                    onCancel={() => setConfirm(null)}
                />
            )}

            {/* Group card */}
            <div style={{
                background: C.accent, borderRadius: 22, padding: "24px 20px",
                border: `2px solid ${C.primary}`, boxShadow: "4px 4px 0 rgba(30,58,43,0.11)",
                display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10,
            }}>
                {editMode ? (
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
                        {/* Group pic upload */}
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
                            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => fRef.current?.click()}>
                                <div style={{ width: 72, height: 72, borderRadius: "50%", border: `2px solid ${C.primary}`, background: C.lavender, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {preview
                                        ? <img src={preview.startsWith("blob:") ? preview : toUrl(preview)} alt="g" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        : <span style={{ fontFamily: faro, fontWeight: 900, fontSize: 24, color: C.primary }}>{form.name?.[0] || "G"}</span>
                                    }
                                </div>
                                <div style={{ position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${C.accent}` }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 5v14M5 12h14" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                            <input ref={fRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, display: "block", marginBottom: 4, fontFamily: inter }}>Group name</label>
                            <input className="auth-input" value={form.name}
                                   onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                   style={{ background: C.white }} />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, display: "block", marginBottom: 4, fontFamily: inter }}>Description</label>
                            <textarea className="auth-input" value={form.description}
                                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                      rows={2} style={{ resize: "none", borderRadius: 14, background: C.white }} />
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="primary-btn" onClick={handleSave} disabled={saving} style={{ fontSize: 13, padding: "10px" }}>
                                {saving ? "Saving..." : "Save"}
                            </button>
                            <button className="secondary-btn"
                                    onClick={() => { setEditMode(false); setImgFile(null); setPreview(group?.profilePic || null); }}
                                    style={{ fontSize: 13, padding: "10px" }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Group avatar */}
                        <div style={{ width: 72, height: 72, borderRadius: "50%", border: `2px solid ${C.primary}`, background: C.lavender, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {preview
                                ? <img src={toUrl(preview)} alt="group" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : <span style={{ fontFamily: faro, fontWeight: 900, fontSize: 28, color: C.primary }}>{group?.name?.[0] || "G"}</span>
                            }
                        </div>
                        <div style={{ fontFamily: faro, fontSize: 20, fontWeight: 900, color: C.primary }}>{group?.name}</div>
                        {group?.description && (
                            <div style={{ fontSize: 13, color: "#3a5c48", fontFamily: inter }}>{group.description}</div>
                        )}
                        <div style={{ fontSize: 12, color: C.muted, fontFamily: inter }}>{members.length} members</div>
                        {/* Role badge */}
                        <span style={{
                            fontSize: 11, fontWeight: 600, color: C.primary,
                            background: isOwner ? C.accent : isAdmin ? C.lavender : "rgba(30,58,43,0.08)",
                            padding: "3px 12px", borderRadius: 100, fontFamily: inter,
                        }}>
              You are {isOwner ? "Owner" : isAdmin ? "Admin" : "Member"}
            </span>
                        {isAdmin && (
                            <button onClick={() => setEditMode(true)} style={{ padding: "8px 20px", background: C.primary, color: C.accent, border: "none", borderRadius: 100, fontSize: 12, fontWeight: 600, fontFamily: inter, cursor: "pointer" }}>
                                Edit group
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Members section */}
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: C.muted, fontFamily: inter }}>
            Members
          </span>
                    {isAdmin && (
                        <button onClick={() => setShowAdd(s => !s)} style={{ padding: "5px 14px", background: C.primary, color: C.accent, border: "none", borderRadius: 100, fontSize: 12, fontWeight: 600, fontFamily: inter, cursor: "pointer" }}>
                            {showAdd ? "Cancel" : "+ Add"}
                        </button>
                    )}
                </div>

                {/* Add members picker */}
                {showAdd && (
                    <div style={{ background: C.white, borderRadius: 16, padding: 14, marginBottom: 12, border: `1.5px solid ${C.border}` }}>
                        <div style={{ fontSize: 13, color: C.muted, fontFamily: inter, marginBottom: 8 }}>
                            Select friends to add ({selectedToAdd.length} selected)
                        </div>
                        {available.length === 0
                            ? <div style={{ fontSize: 13, color: C.muted, fontFamily: inter }}>All friends are already members.</div>
                            : available.map(f => (
                                <div key={f.friendId}
                                     onClick={() => setSelectedToAdd(s => s.includes(f.friendId) ? s.filter(x => x !== f.friendId) : [...s, f.friendId])}
                                     style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 6px", borderRadius: 10, cursor: "pointer", background: selectedToAdd.includes(f.friendId) ? "rgba(239,248,122,0.3)" : "transparent", transition: "background .15s" }}>
                                    <Avatar name={f.friendName || f.friendUsername} pic={f.friendProfilePic} size={36} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: C.primary, fontFamily: inter }}>{f.friendName || f.friendUsername}</div>
                                        <div style={{ fontSize: 11, color: C.muted, fontFamily: inter }}>@{f.friendUsername}</div>
                                    </div>
                                    <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${C.primary}`, background: selectedToAdd.includes(f.friendId) ? C.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        {selectedToAdd.includes(f.friendId) && (
                                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                                <path d="M2 6l3 3 5-5" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            ))
                        }
                        {selectedToAdd.length > 0 && (
                            <button onClick={handleAddMembers} style={{ marginTop: 10, width: "100%", padding: "9px", background: C.primary, color: C.accent, border: "none", borderRadius: 100, fontSize: 13, fontWeight: 700, fontFamily: inter, cursor: "pointer" }}>
                                Add {selectedToAdd.length} member{selectedToAdd.length > 1 ? "s" : ""}
                            </button>
                        )}
                    </div>
                )}

                {/* Member list */}
                {members.map(m => (
                    <div key={m.memberId} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 6px", borderRadius: 12, marginBottom: 2 }}>
                        <Avatar name={m.memberName || m.memberUsername} pic={m.memberProfilePic} size={40} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: C.primary, fontFamily: inter }}>
                                {m.memberName || m.memberUsername}
                                {m.memberId === myUserId && <span style={{ fontSize: 11, color: C.muted, marginLeft: 6, fontWeight: 400 }}>(you)</span>}
                            </div>
                            <div style={{ fontSize: 11, color: C.muted, fontFamily: inter }}>@{m.memberUsername}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                            {/* Role badge */}
                            <span style={{
                                fontSize: 10, fontWeight: 700, color: C.primary,
                                background: m.role === "OWNER" ? C.accent : m.role === "ADMIN" ? C.lavender : "rgba(30,58,43,0.08)",
                                padding: "2px 8px", borderRadius: 100, fontFamily: inter,
                            }}>
                {m.role}
              </span>
                            {/* Make/Remove admin — owner only, not self, not other owners */}
                            {isOwner && m.memberId !== myUserId && m.role !== "OWNER" && (
                                <button
                                    onClick={() => handleChangeRole(m.memberId, m.memberUsername || m.memberName, m.role)}
                                    style={{
                                        padding: "3px 9px",
                                        background: m.role === "ADMIN" ? "rgba(207,220,255,0.6)" : "rgba(239,248,122,0.6)",
                                        color: C.primary,
                                        border: `1.5px solid ${C.primary}`,
                                        borderRadius: 100, fontSize: 10, fontWeight: 600,
                                        fontFamily: inter, cursor: "pointer",
                                    }}>
                                    {m.role === "MEMBER" ? "Make admin" : "Remove admin"}
                                </button>
                            )}
                            {/* Remove from group — admin or above, not self, not owner */}
                            {isAdmin && m.memberId !== myUserId && m.role !== "OWNER" && (
                                <button
                                    onClick={() => handleKick(m.memberId, m.memberUsername || m.memberName)}
                                    style={{ padding: "3px 9px", background: "transparent", color: "rgba(200,80,80,0.8)", border: "1.5px solid rgba(200,80,80,0.4)", borderRadius: 100, fontSize: 10, fontWeight: 600, fontFamily: inter, cursor: "pointer" }}>
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Error message */}
            {actionErr && (
                <div style={{ background: "rgba(200,80,80,0.1)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#c85050", fontFamily: inter, border: "1.5px solid rgba(200,80,80,0.3)" }}>
                    {actionErr}
                    <button onClick={() => setActionErr("")} style={{ marginLeft: 8, background: "none", border: "none", cursor: "pointer", color: "#c85050", fontWeight: 700 }}>✕</button>
                </div>
            )}

            {/* Danger zone */}
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 4, paddingTop: 16, borderTop: `1.5px solid ${C.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(200,80,80,0.7)", fontFamily: inter, marginBottom: 4 }}>
                    Danger zone
                </div>
                {/* Leave — non-owners only */}
                {!isOwner && (
                    <button onClick={handleLeave} style={{ width: "100%", padding: "12px", background: "transparent", color: "#c85050", border: "1.5px solid #c85050", borderRadius: 100, fontSize: 14, fontWeight: 600, fontFamily: inter, cursor: "pointer" }}>
                        Leave group
                    </button>
                )}
                {/* Owner must delete or transfer before leaving */}
                {isOwner && (
                    <button onClick={handleDelete} style={{ width: "100%", padding: "12px", background: "transparent", color: "#c85050", border: "1.5px solid #c85050", borderRadius: 100, fontSize: 14, fontWeight: 600, fontFamily: inter, cursor: "pointer" }}>
                        Delete group
                    </button>
                )}
            </div>
        </div>
    );
}
// ─── APP PAGE ─────────────────────────────────────────────────
export default function AppPage() {
    const navigate = useNavigate();
    const myUserId = getMyUserId();

    const [chats, setChats] = useState([]);
    const [friends, setFriends] = useState([]);
    const [pending, setPending] = useState([]);
    const [activeConvo, setActiveConvo] = useState(null);
    const [view, setView] = useState("empty");
    const [profileUserId, setProfileUserId] = useState(null);
    const [profileReturnView, setProfileReturnView] = useState("empty");
    const [ownProfileMode, setOwnProfileMode] = useState("view");
    const [ownProfile, setOwnProfile] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [readStatuses, setReadStatuses] = useState({});
    const [groupDetailConvoId, setGroupDetailConvoId] = useState(null);

    const wsRef = useRef(null);
    const reconnectTimer = useRef(null);
    const activeConvoRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        refreshAll();
        connectWS(token);
        return () => {
            reconnectTimer.current && clearTimeout(reconnectTimer.current);
            wsRef.current?.close();
        };
    }, []);

    useEffect(() => { activeConvoRef.current = activeConvo; }, [activeConvo]);

    useEffect(() => {
        if (friends.length > 0) fetchOnlineStatus(friends.map(f => f.friendId));
        const interval = setInterval(() => {
            if (friends.length > 0) fetchOnlineStatus(friends.map(f => f.friendId));
        }, 30000);
        return () => clearInterval(interval);
    }, [friends]);

    const fetchOnlineStatus = async (userIds) => {
        if (!userIds.length) return;
        try {
            const r = await api.get(`/api/auth/online-status?userIds=${userIds.join(",")}`);
            setOnlineUsers(r.data);
        } catch {}
    };

    const refreshAll = () => Promise.all([loadChats(), loadFriends(), loadPending()]);
    const loadChats = async () => { try { const r = await getChats(); setChats(r.data); } catch {} };
    const loadFriends = async () => { try { const r = await getFriends(); setFriends(r.data); } catch {} };
    const loadPending = async () => { try { const r = await getPendingFn(); setPending(r.data); } catch {} };
    const loadOwnProfile = async () => { try { const r = await getMyProfile(myUserId); setOwnProfile(r.data); } catch {} };
    const logout = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current?.close();
        }

        localStorage.removeItem("token");
        window.location.href = "/login";
    };
    const connectWS = (token) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;
        const ws = new WebSocket(`ws://localhost:8081/ws/chat?token=${token}`);

        ws.onopen = () => { reconnectTimer.current && clearTimeout(reconnectTimer.current); };

        ws.onmessage = (e) => {
            const pkt = JSON.parse(e.data);
            switch (pkt.type) {
                case "MESSAGE_DELIVERED":
                    setChats(prev => prev.map(c =>
                        c.conversationId === pkt.payload.conversationId
                            ? { ...c, lastMessage: pkt.payload.content, lastMessageAt: pkt.payload.deliveredAt }
                            : c
                    ));
                    setReadStatuses(prev => ({ ...prev, [pkt.payload.messageId]: "delivered" }));
                    loadChats();
                    break;
                case "RECEIVE_MESSAGE":
                    setChats(prev => prev.map(c =>
                        c.conversationId === pkt.payload.conversationId
                            ? { ...c, lastMessage: pkt.payload.content, lastMessageAt: pkt.payload.timestamp }
                            : c
                    ));
                    setUnreadCounts(prev => {
                        if (activeConvoRef.current === pkt.payload.conversationId) return prev;
                        return { ...prev, [pkt.payload.conversationId]: (prev[pkt.payload.conversationId] || 0) + 1 };
                    });
                    break;
                case "READ_RECEIPT":
                    const newStatus = pkt.payload.allRead ? "read" : "delivered";
                    setReadStatuses(prev => ({
                        ...prev,
                        [pkt.payload.messageId]: newStatus,
                    }));                    break;
                case "FRIEND_REQUEST":
                    setPending(prev => {
                        if (prev.some(p => p.senderId === pkt.payload.senderId)) return prev;
                        return [...prev, {
                            friendshipId: Date.now(), senderId: pkt.payload.senderId,
                            receiverId: myUserId, status: 1,
                            friendId: pkt.payload.senderId,
                            friendUsername: pkt.payload.senderUsername,
                            friendName: pkt.payload.senderName,
                            friendProfilePic: null,
                        }];
                    });
                    break;
                case "GROUP_DELETED":
                    setChats(prev => prev.filter(c => c.groupId !== pkt.payload.groupId));
                    if (activeConvoRef.current) {
                        setChats(prev => {
                            const deleted = prev.find(c => c.groupId === pkt.payload.groupId);
                            if (deleted && activeConvoRef.current === deleted.conversationId) {
                                setView("empty");
                                setActiveConvo(null);
                                setGroupDetailConvoId(null);
                            }
                            return prev.filter(c => c.groupId !== pkt.payload.groupId);
                        });
                    }
                    break;
                case "REQUEST_ACCEPTED": loadFriends(); loadPending(); break;
                case "FRIEND_REMOVED":
                    setFriends(prev => prev.filter(f => f.friendId !== pkt.payload.removerId));
                    break;
                case "EDIT_MESSAGE":
                    // Update last message in chat list if this was the latest message
                    setChats(prev => prev.map(c =>
                        c.conversationId === pkt.payload.conversationId
                            ? { ...c, lastMessage: pkt.payload.content }
                            : c
                    ));
                    break;
                case "DELETE_MESSAGE":
                    // Reload chats to update last message tile
                    loadChats();
                    break;
                case "ADDED_TO_GROUP": loadChats(); break;
                default: break;
            }
        };

        ws.onclose = () => {
            const t = localStorage.getItem("token");
            if (t) reconnectTimer.current = setTimeout(() => connectWS(t), 3000);
        };

        ws.onerror = (e) => console.error("WS error", e);
        wsRef.current = ws;
    };

    const sendWs = useCallback((pkt) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify(pkt));
    }, []);

    const openUserProfile = (uid, returnView) => {
        setProfileUserId(uid);
        setProfileReturnView(returnView || view);
        setView("userProfile");
    };
    const openOwnProfile = async () => { await loadOwnProfile(); setOwnProfileMode("view"); setView("profile"); };
    const openChat = (convoId) => { setActiveConvo(convoId); setView("chat"); setUnreadCounts(prev => ({ ...prev, [convoId]: 0 })); loadChats(); };
    const openGroupDetail = (convoId) => { setGroupDetailConvoId(convoId); setView("groupDetail"); };
    const onFriendshipChange = () => { loadFriends(); loadPending(); };
    const handleStartChat = (convoId) => openChat(convoId);

    const activeChat = chats.find(c => c.conversationId === activeConvo);

    return (
        <div style={{ display: "flex", height: "100vh", background: C.bg, overflow: "hidden" }}>
            <GlobalStyles />
            {showGroupModal && (
                <GroupCreateModal friends={friends} onClose={() => setShowGroupModal(false)} onCreated={loadChats} />
            )}

            {/* ── SIDEBAR ── */}
            <div style={{ width: 296, display: "flex", flexDirection: "column", height: "100vh", flexShrink: 0, borderRight: `1.5px solid ${C.border}` }}>
                <div style={{ padding: "15px 13px 10px", borderBottom: `1.5px solid ${C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontFamily: faro, fontSize: 20, fontWeight: 900, color: C.primary, letterSpacing: "-.5px" }}>Ripple^</span>
                        <div style={{ display: "flex", gap: 1 }}>
                            <button className="icon-btn" onClick={() => setShowGroupModal(true)} title="New group">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
                                    <circle cx="9" cy="7" r="4" stroke={C.primary} strokeWidth="2" />
                                    <path d="M23 11h-6M20 8v6" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                            <button className="icon-btn" onClick={() => setView("friends")} title="Friends" style={{ position: "relative" }}>
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
                                    <circle cx="9" cy="7" r="4" stroke={C.primary} strokeWidth="2" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                {pending.length > 0 && (
                                    <span style={{ position: "absolute", top: 3, right: 3, width: 8, height: 8, borderRadius: "50%", background: C.accent, border: `1.5px solid ${C.primary}` }} />
                                )}
                            </button>
                            <button className="icon-btn" onClick={() => setView("search")} title="Search">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                                    <circle cx="11" cy="11" r="8" stroke={C.primary} strokeWidth="2" />
                                    <path d="m21 21-4.35-4.35" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                            <button className="icon-btn" onClick={openOwnProfile} title="Profile">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="8" r="4" stroke={C.primary} strokeWidth="2" />
                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "5px 5px" }}>
                    <SectionLabel text="Messages" />
                    {chats.length === 0 ? <EmptyNote text="No conversations yet" /> : chats.map(chat => {
                        const unread = unreadCounts[chat.conversationId] || 0;
                        const isActive = activeConvo === chat.conversationId;
                        const isGroup = chat.type === "GROUP";
                        const friendId = !isGroup && friends.find(f => f.friendUsername === chat.name || f.friendName === chat.name)?.friendId;
                        const isOnline = friendId ? onlineUsers[friendId] : false;
                        return (
                            <div key={chat.conversationId}
                                 className={`hov${isActive ? " act" : ""}`}
                                 onClick={() => openChat(chat.conversationId)}
                                 style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 9px", borderRadius: 13, cursor: "pointer", marginBottom: 1 }}>
                                <Avatar name={chat.name} pic={chat.profilePic} size={41} online={!isGroup ? isOnline : undefined} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                        <span style={{ fontWeight: 700, fontSize: 13.5, color: C.primary, fontFamily: inter }}>{chat.name || "Chat"}</span>
                                        <span style={{ fontSize: 10.5, color: C.muted, fontFamily: inter, flexShrink: 0 }}>{formatTime(chat.lastMessageAt)}</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
                                        <div style={{ fontSize: 12.5, color: unread > 0 ? C.primary : C.muted, fontWeight: unread > 0 ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, fontFamily: inter }}>
                                            {chat.lastMessage || "No messages yet"}
                                        </div>
                                        {unread > 0 && (
                                            <span style={{ background: C.primary, color: C.accent, borderRadius: 100, padding: "1px 7px", fontSize: 11, fontWeight: 700, flexShrink: 0, fontFamily: inter }}>
                        {unread}
                      </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                {view === "empty" && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 40 }}>
                        <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.accent, border: `2px solid ${C.primary}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>💬</div>
                        <div style={{ textAlign: "center" }}>
                            <p style={{ fontFamily: faro, fontSize: 24, fontWeight: 900, color: C.primary, marginBottom: 6 }}>Start chatting</p>
                            <p style={{ fontSize: 14, color: C.muted, marginBottom: 22, fontFamily: inter }}>Select a conversation or find someone new</p>
                            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                                <button className="primary-btn" style={{ width: "auto", padding: "11px 24px" }} onClick={() => setView("search")}>Find someone →</button>
                                <button className="secondary-btn" style={{ width: "auto", padding: "11px 24px" }} onClick={() => setShowGroupModal(true)}>New group</button>
                            </div>
                        </div>
                    </div>
                )}

                {view === "chat" && activeConvo && (
                    <ChatWindow
                        convoId={activeConvo} convoInfo={activeChat}
                        sendWs={sendWs} wsRef={wsRef}
                        myUserId={myUserId} friends={friends}
                        onMessageSent={loadChats}
                        onOpenProfile={(uid) => openUserProfile(uid, "chat")}
                        onOpenGroupDetail={openGroupDetail}
                        readStatuses={readStatuses}
                        setReadStatuses={setReadStatuses}
                        onlineUsers={onlineUsers}
                    />
                )}

                {view === "search" && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <PanelHeader title="Search" onClose={() => setView("empty")} />
                        <SearchContent myUserId={myUserId} onOpenProfile={(uid) => openUserProfile(uid, "search")} />
                    </div>
                )}

                {view === "friends" && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <PanelHeader title="Friends" onClose={() => setView("empty")} />
                        <FriendsContent
                            friends={friends} pending={pending}
                            onOpenProfile={(uid) => openUserProfile(uid, "friends")}
                            onAccept={async (sid) => { await acceptRequest(sid); onFriendshipChange(); }}
                            onDecline={async (sid) => { await rejectRequest(sid); onFriendshipChange(); }}
                        />
                    </div>
                )}

                {view === "profile" && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <PanelHeader
                            title={ownProfileMode === "edit" ? "Edit profile" : "Profile"}
                            onClose={() => { setView("empty"); setOwnProfileMode("view"); }}
                        />
                        {ownProfileMode === "view" ? (
                            <div style={{ flex: 1, overflowY: "auto" }}>
                                <ProfileView userId={myUserId} myUserId={myUserId} onEditProfile={() => setOwnProfileMode("edit")} onFriendshipChange={onFriendshipChange} onStartChat={handleStartChat} onlineUsers={onlineUsers} />
                                <div style={{ padding: "0 20px 20px" }}>
                                    <button className="ghost-btn" onClick={logout}>
                                        Log out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ flex: 1, overflowY: "auto" }}>
                                <OwnProfileEdit
                                    profile={ownProfile}
                                    onSaved={async () => { await loadOwnProfile(); setOwnProfileMode("view"); }}
                                    onCancel={() => setOwnProfileMode("view")}
                                />
                            </div>
                        )}
                    </div>
                )}

                {view === "userProfile" && profileUserId && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <PanelHeader title="Profile" onClose={() => setView(profileReturnView)} />
                        <BackBtn label="Back" onClick={() => setView(profileReturnView)} />
                        <ProfileView userId={profileUserId} myUserId={myUserId} onFriendshipChange={onFriendshipChange} onStartChat={handleStartChat} onlineUsers={onlineUsers} />
                    </div>
                )}

                {/*{view === "groupDetail" && groupDetailConvoId && (*/}
                {/*    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>*/}
                {/*        <PanelHeader title="Group Info" onClose={() => setView("chat")} />*/}
                {/*        <GroupDetailPanel convoId={groupDetailConvoId} friends={friends} myUserId={myUserId} onRefresh={loadChats} />*/}
                {/*    </div>*/}
                {/*)}*/}
                {view === "groupDetail" && groupDetailConvoId && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <PanelHeader title="Group Info" onClose={() => setView("chat")} />
                        <GroupDetailPanel
                            convoId={groupDetailConvoId}
                            friends={friends}
                            myUserId={myUserId}
                            onRefresh={loadChats}
                            onGroupDeleted={() => {
                                setView("empty");
                                setActiveConvo(null);
                                setGroupDetailConvoId(null);
                                loadChats();
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── CHAT WINDOW ──────────────────────────────────────────────
function ChatWindow({ convoId, convoInfo, sendWs, wsRef, myUserId, friends, onMessageSent, onOpenProfile, onOpenGroupDetail, readStatuses, setReadStatuses, onlineUsers }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [notFriends, setNotFriends] = useState(false);
    const [typing, setTyping] = useState(false);
    const [editingMsg, setEditingMsg] = useState(null); // { messageId, content }
    const [editInput, setEditInput] = useState("");
    const [contextMenu, setContextMenu] = useState(null); // { messageId, x, y, isOwn, content }
    const [confirm, setConfirm] = useState(null);
    const typingTimer = useRef(null);
    const bottomRef = useRef(null);
    const editInputRef = useRef(null);
    const containerRef = useRef(null); // add this ref to the messages container div
    const isGroup = !!convoInfo?.groupId;
    const isDirect = !isGroup;
    const friendMatch = isDirect && friends.some(f =>
        f.friendUsername === convoInfo?.name || f.friendName === convoInfo?.name
    );
    const messagingBlocked = notFriends || (isDirect && messages.length > 0 && !friendMatch);

    useEffect(() => {
        if (!convoId) return;
        setNotFriends(false);
        setContextMenu(null);
        setEditingMsg(null);
        load();
    }, [convoId]);

    // Close context menu on outside click
    useEffect(() => {
        const handler = () => setContextMenu(null);
        window.addEventListener("click", handler);
        return () => window.removeEventListener("click", handler);
    }, []);
    // Auto scroll when messages change or typing indicator appears
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    useEffect(() => {
        if (!wsRef?.current) return;
        const handler = (e) => {
            const pkt = JSON.parse(e.data);

            if (pkt.type === "RECEIVE_MESSAGE" && pkt.payload.conversationId === convoId) {
                setMessages(prev => {
                    if (prev.some(m => m.messageId === pkt.payload.messageId)) return prev;
                    return [...prev, {
                        messageId: pkt.payload.messageId,
                        senderId: pkt.payload.senderId,
                        senderUsername: pkt.payload.senderUsername,
                        content: pkt.payload.content,
                        sentAt: pkt.payload.timestamp,
                        isDeleted: false,
                    }];
                });
                scroll();
                onMessageSent();
                sendWs({ type: "READ_RECEIPT", payload: { messageId: pkt.payload.messageId, conversationId: convoId } });
            }
            if (pkt.type === "EDIT_MESSAGE" && pkt.payload.conversationId === convoId) {
                setMessages(prev => prev.map(m =>
                    m.messageId === pkt.payload.messageId
                        ? { ...m, content: pkt.payload.content }
                        : m
                ));
            }
            if (pkt.type === "MESSAGE_DELIVERED" && pkt.payload.conversationId === convoId) {
                setMessages(prev => prev.map(m =>
                    m.messageId > 1_000_000_000_000
                        ? { ...m, messageId: pkt.payload.messageId, sentAt: pkt.payload.deliveredAt }
                        : m
                ));
                setReadStatuses(prev => {
                    const updated = { ...prev };
                    const tempKey = Object.keys(updated).find(k => Number(k) > 1_000_000_000_000);
                    if (tempKey) delete updated[tempKey];
                    updated[pkt.payload.messageId] = "delivered";
                    return updated;
                });
                onMessageSent();
            }

            if (pkt.type === "READ_RECEIPT") {
                const newStatus = pkt.payload.allRead ? "read" : "delivered";
                setReadStatuses(prev => ({ ...prev, [pkt.payload.messageId]: newStatus }));
            }
            if (pkt.type === "DELETE_MESSAGE" && pkt.payload.conversationId === convoId) {
                if (pkt.payload.deleteType === "deleteForEveryone") {
                    setMessages(prev => prev.map(m =>
                        m.messageId === pkt.payload.messageId
                            ? { ...m, isDeleted: true, content: "" }
                            : m
                    ));
                } else {
                    // deleteForMe — remove from local list
                    setMessages(prev => prev.filter(m => m.messageId !== pkt.payload.messageId));
                }
                onMessageSent(); // update chat list last message
            }

            if (pkt.type === "TYPING" && pkt.payload.conversationId === convoId && pkt.payload.senderId !== myUserId) {
                setTyping(pkt.payload.isTyping);
                if (pkt.payload.isTyping) {
                    typingTimer.current && clearTimeout(typingTimer.current);
                    typingTimer.current = setTimeout(() => setTyping(false), 3000);
                }
            }

            if (pkt.error === "not_friends") setNotFriends(true);
        };

        wsRef.current.addEventListener("message", handler);
        return () => wsRef.current?.removeEventListener("message", handler);
    }, [convoId, wsRef]);

    const load = async () => {
        try {
            const r = await getMessages(convoId);
            const init = {};
            r.data.forEach(msg => {
                if (msg.senderId === myUserId) {
                    init[msg.messageId] = msg.isRead ? "read" : "delivered";
                }
            });
            setReadStatuses(prev => ({ ...prev, ...init }));
            setMessages(r.data);
            r.data.forEach(msg => {
                if (msg.senderId !== myUserId && !msg.isDeleted) {
                    sendWs({ type: "READ_RECEIPT", payload: { messageId: msg.messageId, conversationId: convoId } });
                }
            });
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "instant" }), 40);
        } catch {}
    };

    const scroll = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 40);

    const send = () => {
        if (!input.trim() || messagingBlocked) return;
        const content = input.trim();
        const tempId = Date.now();
        const optimistic = { messageId: tempId, senderId: myUserId, senderUsername: "", content, sentAt: new Date().toISOString(), isDeleted: false };
        setMessages(prev => [...prev, optimistic]);
        setReadStatuses(prev => ({ ...prev, [tempId]: "sent" }));
        scroll();
        sendWs({ type: "SEND_MESSAGE", payload: { conversationId: convoId, content } });
        setInput("");
        onMessageSent();
        sendWs({ type: "TYPING", payload: { conversationId: convoId, isTyping: false } });
    };

    const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

    const onInputChange = (e) => {
        setInput(e.target.value);
        sendWs({ type: "TYPING", payload: { conversationId: convoId, isTyping: true } });
        typingTimer.current && clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => {
            sendWs({ type: "TYPING", payload: { conversationId: convoId, isTyping: false } });
        }, 2000);
    };

    // Right click / long press handler
    const handleContextMenu = (e, msg, isOwn) => {
        e.preventDefault();
        if (msg.isDeleted) return;

        const MENU_WIDTH = 200;
        const MENU_HEIGHT = isOwn ? 132 : 44; // approximate heights

        // Clamp to viewport
        const x = Math.min(e.clientX, window.innerWidth - MENU_WIDTH - 12);
        const y = Math.min(e.clientY, window.innerHeight - MENU_HEIGHT - 12);

        setContextMenu({
            messageId: msg.messageId,
            content: msg.content,
            isOwn,
            x,
            y,
        });
    };

    // Start editing a message
    const startEdit = (messageId, content) => {
        setContextMenu(null);
        setEditingMsg({ messageId, content });
        setEditInput(content);
        setTimeout(() => editInputRef.current?.focus(), 50);
    };

    // Save edited message
    const saveEdit = () => {
        if (!editInput.trim() || editInput.trim() === editingMsg.content) {
            setEditingMsg(null);
            return;
        }
        // Send via WebSocket — backend broadcasts EDIT_MESSAGE to all members
        // including sender, so the WS handler updates local state
        sendWs({
            type: "EDIT_MESSAGE",
            payload: {
                messageId: editingMsg.messageId,
                conversationId: convoId,
                content: editInput.trim(),
            }
        });
        setEditingMsg(null);
    };

    const cancelEdit = () => { setEditingMsg(null); setEditInput(""); };

    // Delete a message
    const deleteMessage = (messageId, deleteType) => {
        setContextMenu(null);
        setConfirm({
            msg: deleteType === "deleteForEveryone"
                ? "Delete for everyone? This cannot be undone."
                : "Delete for yourself?",
            fn: () => {
                // Send via WebSocket — backend handles DB + broadcast
                sendWs({
                    type: "DELETE_MESSAGE",
                    payload: { messageId, conversationId: convoId, deleteType },
                });
            }
        });
    };
    const friendId = isDirect && friends.find(f =>
        f.friendUsername === convoInfo?.name || f.friendName === convoInfo?.name
    )?.friendId;
    const isOnline = friendId ? onlineUsers[friendId] : false;

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
            {confirm && (
                <ConfirmDialog
                    message={confirm.msg}
                    onConfirm={() => { setConfirm(null); confirm.fn(); }}
                    onCancel={() => setConfirm(null)}
                />
            )}

            {/* Context menu */}
            {contextMenu && (
                <div
                    onClick={e => e.stopPropagation()}
                    style={{
                        position: "fixed",
                        top: contextMenu.y,
                        left: contextMenu.x,
                        background: C.white,
                        border: `1.5px solid ${C.border}`,
                        borderRadius: 14,
                        boxShadow: "0 8px 24px rgba(30,58,43,0.18)",
                        zIndex: 9990,
                        overflow: "hidden",
                        minWidth: 200,
                    }}
                >
                    {contextMenu.isOwn && !contextMenu.isDeleted && (
                        <button
                            onClick={() => startEdit(contextMenu.messageId, contextMenu.content)}
                            style={{
                                width: "100%", padding: "12px 16px",
                                background: "transparent", border: "none",
                                borderBottom: `1px solid ${C.border}`,
                                cursor: "pointer", fontSize: 14, fontFamily: inter,
                                color: C.primary, textAlign: "left",
                                display: "flex", alignItems: "center", gap: 10,
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(30,58,43,0.04)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            Edit message
                        </button>
                    )}
                    {contextMenu.isOwn && (
                        <button
                            onClick={() => deleteMessage(contextMenu.messageId, "deleteForEveryone")}
                            style={{
                                width: "100%", padding: "12px 16px",
                                background: "transparent", border: "none",
                                borderBottom: `1px solid ${C.border}`,
                                cursor: "pointer", fontSize: 14, fontFamily: inter,
                                color: "#c85050", textAlign: "left",
                                display: "flex", alignItems: "center", gap: 10,
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(200,80,80,0.04)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <polyline points="3,6 5,6 21,6" stroke="#c85050" strokeWidth="2" strokeLinecap="round" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="#c85050" strokeWidth="2" strokeLinecap="round" />
                                <path d="M10 11v6M14 11v6" stroke="#c85050" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            Delete for everyone
                        </button>
                    )}
                    <button
                        onClick={() => deleteMessage(contextMenu.messageId, "deleteForMe")}
                        style={{
                            width: "100%", padding: "12px 16px",
                            background: "transparent", border: "none",
                            cursor: "pointer", fontSize: 14, fontFamily: inter,
                            color: "#c85050", textAlign: "left",
                            display: "flex", alignItems: "center", gap: 10,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(200,80,80,0.04)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <polyline points="3,6 5,6 21,6" stroke="#c85050" strokeWidth="2" strokeLinecap="round" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="#c85050" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Delete for me
                    </button>
                </div>
            )}

            {/* Header */}
            <div
                style={{ padding: "11px 18px", borderBottom: `1.5px solid ${C.border}`, display: "flex", alignItems: "center", gap: 11, flexShrink: 0, cursor: "pointer" }}
                onClick={() => {
                    if (isGroup) onOpenGroupDetail?.(convoId);
                    else if (friendId) onOpenProfile?.(friendId);
                }}
            >
                <Avatar name={convoInfo?.name || "Chat"} pic={convoInfo?.profilePic} size={38} online={isDirect ? isOnline : undefined} />
                <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: faro, fontSize: 15, fontWeight: 900, color: C.primary }}>
                        {convoInfo?.name || "Chat"}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, fontFamily: inter }}>
                        {typing ? "typing..." : isGroup ? "Tap to view group info" : isOnline ? "Online" : "Tap to view profile"}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={containerRef}
                style={{ flex: 1, overflowY: "auto", padding: "18px 18px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
                {messages.map(msg => {
                    const isOwn = msg.senderId === myUserId;
                    const time = formatTime(msg.sendAt || msg.sentAt);
                    const tickStatus = isOwn ? (readStatuses[msg.messageId] || "sent") : null;
                    const showSender = isGroup && !isOwn;
                    const isEditing = editingMsg?.messageId === msg.messageId;

                    return (
                        <div key={msg.messageId} style={{ display: "flex", justifyContent: isOwn ? "flex-end" : "flex-start" }}>
                            {isEditing ? (
                                // Inline edit box
                                <div style={{ maxWidth: "70%", width: "100%", display: "flex", flexDirection: "column", gap: 6, alignSelf: "flex-end" }}>
                  <textarea
                      ref={editInputRef}
                      value={editInput}
                      onChange={e => setEditInput(e.target.value)}
                      onKeyDown={e => {
                          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit(); }
                          if (e.key === "Escape") cancelEdit();
                      }}
                      style={{
                          padding: "10px 14px", borderRadius: "17px 17px 4px 17px",
                          background: C.primary, color: C.accent,
                          border: `2px solid ${C.accent}`,
                          fontSize: 14, fontFamily: inter, lineHeight: 1.5,
                          resize: "none", outline: "none", width: "100%",
                      }}
                      rows={Math.min(4, editInput.split("\n").length + 1)}
                  />
                                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                        <button onClick={cancelEdit} style={{ padding: "5px 14px", background: "transparent", color: C.muted, border: `1.5px solid ${C.border}`, borderRadius: 100, fontSize: 12, fontFamily: inter, cursor: "pointer" }}>Cancel</button>
                                        <button onClick={saveEdit} style={{ padding: "5px 14px", background: C.primary, color: C.accent, border: "none", borderRadius: 100, fontSize: 12, fontWeight: 700, fontFamily: inter, cursor: "pointer" }}>Save</button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onContextMenu={e => handleContextMenu(e, msg, isOwn)}
                                    onDoubleClick={e => { if (isOwn && !msg.isDeleted) handleContextMenu(e, msg, isOwn); }}
                                    style={{
                                        maxWidth: "64%", padding: "9px 14px",
                                        borderRadius: isOwn ? "17px 17px 4px 17px" : "17px 17px 17px 4px",
                                        background: isOwn ? C.primary : C.white,
                                        color: isOwn ? C.accent : C.primary,
                                        fontSize: 14, lineHeight: 1.5, fontFamily: inter,
                                        border: isOwn ? "none" : `1.5px solid ${C.border}`,
                                        boxShadow: "0 1px 3px rgba(30,58,43,0.05)",
                                        cursor: "default", userSelect: "text",
                                    }}
                                >
                                    {showSender && (
                                        <div style={{ fontSize: 11, fontWeight: 700, color: "#2d5540", fontFamily: faro, marginBottom: 3 }}>
                                            {msg.senderUsername || `User ${msg.senderId}`}
                                        </div>
                                    )}
                                    {msg.isDeleted
                                        ? <span style={{ opacity: .45, fontStyle: "italic" }}>This message was deleted</span>
                                        : msg.content
                                    }
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3, marginTop: 3 }}>
                                        {time && <span style={{ fontSize: 10, opacity: .45 }}>{time}</span>}
                                        {isOwn && tickStatus && <Ticks status={tickStatus} />}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Typing indicator */}
                {typing && (
                    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 4 }}>
                        <div style={{ padding: "10px 16px", borderRadius: "17px 17px 17px 4px", background: C.white, border: `1.5px solid ${C.border}`, display: "flex", gap: 4, alignItems: "center" }}>
                            {[0, 1, 2].map(i => (
                                <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.muted, animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out` }} />
                            ))}
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input or blocked */}
            {messagingBlocked ? (
                <div style={{ padding: "13px 20px", borderTop: `1.5px solid ${C.border}`, textAlign: "center", fontSize: 13, color: C.muted, fontFamily: inter }}>
                    You are no longer friends. Reconnect to send messages.
                </div>
            ) : (
                <div style={{ padding: "9px 14px 13px", borderTop: `1.5px solid ${C.border}`, display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                        className="msg-input"
                        placeholder="Type a message..."
                        value={input}
                        onChange={onInputChange}
                        onKeyDown={onKey}
                    />
                    <button className="send-btn" onClick={send}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
// ─── SEARCH ───────────────────────────────────────────────────
function SearchContent({ myUserId, onOpenProfile }) {
    const [q, setQ] = useState("");
    const [res, setRes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!q.trim()) { setRes([]); return; }
        const t = setTimeout(async () => {
            setLoading(true);
            try { const r = await searchUsers(q); setRes(r.data); }
            catch {}
            finally { setLoading(false); }
        }, 280);
        return () => clearTimeout(t);
    }, [q]);

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "12px 18px", borderBottom: `1.5px solid ${C.border}` }}>
                <div style={{ position: "relative" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                         style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", opacity: .38 }}>
                        <circle cx="11" cy="11" r="8" stroke={C.primary} strokeWidth="2" />
                        <path d="m21 21-4.35-4.35" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input className="auth-input" placeholder="Search by username..." value={q}
                           onChange={e => setQ(e.target.value)} style={{ paddingLeft: 38 }} autoFocus />
                </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "7px 7px" }}>
                {!q && <EmptyNote text="Type a username to search" />}
                {loading && <EmptyNote text="Searching..." />}
                {!loading && q && res.length === 0 && <EmptyNote text={`No users found for "${q}"`} />}
                {res.map(u => (
                    <div key={u.userId} className="hov" onClick={() => onOpenProfile(u.userId)}
                         style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 9px", borderRadius: 13, marginBottom: 1, cursor: "pointer" }}>
                        <Avatar name={u.name || u.username} pic={u.profilePic} size={43} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: C.primary, fontFamily: inter }}>
                                {u.name || u.username}
                                {u.userId === myUserId && <span style={{ fontSize: 11, color: C.muted, marginLeft: 6, fontWeight: 400 }}>(you)</span>}
                            </div>
                            <div style={{ fontSize: 12, color: C.muted, fontFamily: inter }}>@{u.username}</div>
                        </div>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ opacity: .28, flexShrink: 0 }}>
                            <path d="M9 18l6-6-6-6" stroke={C.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── FRIENDS ──────────────────────────────────────────────────
function FriendsContent({ friends, pending, onOpenProfile, onAccept, onDecline }) {
    const [tab, setTab] = useState("friends");
    const [confirm, setConfirm] = useState(null);

    const TB = ({ id, label, count }) => (
        <button onClick={() => setTab(id)} style={{
            padding: "7px 17px", borderRadius: 100, border: "none", cursor: "pointer",
            fontFamily: inter, fontSize: 13, fontWeight: 600, transition: "all .15s",
            background: tab === id ? C.primary : "transparent",
            color: tab === id ? C.accent : C.primary,
        }}>
            {label}
            {count > 0 && (
                <span style={{ marginLeft: 5, background: C.accent, color: C.primary, borderRadius: 100, padding: "1px 6px", fontSize: 11 }}>
          {count}
        </span>
            )}
        </button>
    );

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {confirm && (
                <ConfirmDialog message={confirm.msg} onConfirm={() => { setConfirm(null); confirm.fn(); }} onCancel={() => setConfirm(null)} />
            )}
            <div style={{ padding: "9px 16px", borderBottom: `1.5px solid ${C.border}`, display: "flex", gap: 5 }}>
                <TB id="friends" label="Friends" count={0} />
                <TB id="pending" label="Requests" count={pending.length} />
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "7px 7px" }}>
                {tab === "friends" && (
                    friends.length === 0 ? <EmptyNote text="No friends yet." />
                        : friends.map(f => (
                            <div key={f.friendshipId} className="hov" onClick={() => onOpenProfile(f.friendId)}
                                 style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 9px", borderRadius: 13, marginBottom: 1, cursor: "pointer" }}>
                                <Avatar name={f.friendName || f.friendUsername} pic={f.friendProfilePic} size={43} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: C.primary, fontFamily: inter }}>{f.friendName || f.friendUsername}</div>
                                    <div style={{ fontSize: 12, color: C.muted, fontFamily: inter }}>@{f.friendUsername}</div>
                                </div>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ opacity: .28, flexShrink: 0 }}>
                                    <path d="M9 18l6-6-6-6" stroke={C.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        ))
                )}
                {tab === "pending" && (
                    pending.length === 0 ? <EmptyNote text="No pending requests." />
                        : pending.map(p => (
                            <div key={p.friendshipId} style={{ background: C.white, borderRadius: 15, padding: "13px", marginBottom: 7, border: `1.5px solid ${C.border}` }}>
                                <div className="hov" onClick={() => onOpenProfile(p.friendId)}
                                     style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 10, cursor: "pointer", borderRadius: 10, padding: 2 }}>
                                    <Avatar name={p.friendName || p.friendUsername} pic={p.friendProfilePic} size={43} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: C.primary, fontFamily: inter }}>{p.friendName || p.friendUsername}</div>
                                        <div style={{ fontSize: 12, color: C.muted, fontFamily: inter }}>@{p.friendUsername} · wants to connect</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 7 }}>
                                    <button onClick={() => onAccept(p.senderId)}
                                            style={{ flex: 1, padding: "9px", background: C.primary, color: C.accent, border: "none", borderRadius: 100, fontSize: 13, fontWeight: 700, fontFamily: inter, cursor: "pointer" }}>
                                        Accept
                                    </button>
                                    <button onClick={() => setConfirm({ msg: `Decline request from ${p.friendUsername}?`, fn: () => onDecline(p.senderId) })}
                                            style={{ flex: 1, padding: "9px", background: "transparent", color: C.primary, border: `1.5px solid ${C.primary}`, borderRadius: 100, fontSize: 13, fontWeight: 600, fontFamily: inter, cursor: "pointer" }}>
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))
                )}
            </div>
        </div>
    );
}
