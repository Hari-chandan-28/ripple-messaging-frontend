import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    getChats, getMessages, createConversation,
    editMessage, deleteMessage
} from "../services/messages";
import {
    getFriends, getPending as getPendingFn,
    sendRequest, acceptRequest, rejectRequest, removeFriend,
    searchUsers, takebackRequest
} from "../services/friendship";
import {
    getMyProfile, updateProfile,
    updatePrivacy, uploadProfilePic
} from "../services/profile";
import {StatusPicker} from "../components/StatusPicker.jsx";

// ─── DESIGN TOKENS ───────────────────────────────────────────
const C = {
    bg: "#f8f4f0",
    primary: "#1e3a2b",
    accent: "#eff87a",
    lavender: "#cfdcff",
    white: "#ffffff",
    border: "rgba(30,58,43,0.12)",
    muted: "rgba(30,58,43,0.45)",
};
const faro = "'Faro', sans-serif";
const inter = "'Inter', sans-serif";

// ─── HELPERS ─────────────────────────────────────────────────
const toUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("blob:")) return url;
    return `http://localhost:8081${url}`;
};

const formatTime = (ts) => {
    if (!ts) return "";
    try {
        const d = new Date(ts);
        if (isNaN(d.getTime())) return "";
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
};

const getMyUserId = () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) return null;
        return JSON.parse(atob(token.split(".")[1])).userId;
    } catch { return null; }
};

const RL = {
    SINGLE: "Single 🌿",
    COMMITTED: "In a relationship 💛",
    MARRIED: "Married 💍",
    COMPLICATED: "It's complicated 🌀",
};

// ─── GLOBAL STYLES ───────────────────────────────────────────
const GlobalStyles = () => (
    <style>{`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: ${inter}; }
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-thumb { background: rgba(30,58,43,0.15); border-radius: 3px; }
    .hover-bg:hover { background: rgba(30,58,43,0.05) !important; }
    .active-chat { background: rgba(239,248,122,0.45) !important; }
    .icon-btn {
      background: none; border: none; cursor: pointer;
      padding: 7px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s; color: ${C.primary};
    }
    .icon-btn:hover { background: rgba(30,58,43,0.08); }
    .primary-btn {
      width: 100%; padding: 13px;
      background: ${C.primary}; color: ${C.accent};
      border: none; border-radius: 100px;
      font-size: 14px; font-weight: 700;
      font-family: ${inter}; cursor: pointer;
      transition: background 0.2s, transform 0.15s;
    }
    .primary-btn:hover:not(:disabled) { background: #2d5540; transform: translateY(-1px); }
    .primary-btn:disabled { opacity: 0.55; cursor: default; }
    .secondary-btn {
      width: 100%; padding: 13px;
      background: transparent; color: ${C.primary};
      border: 1.5px solid ${C.primary}; border-radius: 100px;
      font-size: 14px; font-weight: 600;
      font-family: ${inter}; cursor: pointer;
      transition: background 0.15s;
    }
    .secondary-btn:hover { background: rgba(30,58,43,0.06); }
    .ghost-btn {
      width: 100%; padding: 13px;
      background: transparent; color: rgba(30,58,43,0.5);
      border: 1.5px solid rgba(30,58,43,0.18); border-radius: 100px;
      font-size: 14px; font-weight: 600;
      font-family: ${inter}; cursor: pointer;
      transition: background 0.15s;
    }
    .ghost-btn:hover { background: rgba(30,58,43,0.05); }
    .auth-input {
      width: 100%; padding: 12px 16px;
      border: 2px solid ${C.primary}; border-radius: 14px;
      font-size: 14px; font-family: ${inter};
      background: ${C.white}; color: ${C.primary};
      outline: none; transition: box-shadow 0.2s;
    }
    .auth-input:focus { box-shadow: 0 0 0 4px rgba(30,58,43,0.1); }
    .auth-input::placeholder { color: rgba(30,58,43,0.32); }
    .msg-input {
      flex: 1; padding: 11px 16px;
      border: 2px solid transparent; border-radius: 100px;
      font-size: 14px; font-family: ${inter};
      background: rgba(30,58,43,0.06); color: ${C.primary};
      outline: none; transition: border-color 0.2s, background 0.2s;
    }
    .msg-input:focus { border-color: ${C.primary}; background: ${C.white}; }
    .msg-input::placeholder { color: rgba(30,58,43,0.32); }
    .send-btn {
      width: 38px; height: 38px; border-radius: 50%;
      background: ${C.primary}; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background 0.15s, transform 0.15s;
    }
    .send-btn:hover { background: #2d5540; transform: scale(1.06); }
  `}</style>
);

// ─── REUSABLE UI ATOMS ────────────────────────────────────────
function Avatar({ name, pic, size = 40 }) {
    const initials = (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%",
            background: pic ? "transparent" : C.lavender,
            border: `2px solid ${C.primary}`,
            flexShrink: 0, overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: faro, fontWeight: 900,
            fontSize: Math.round(size * 0.34), color: C.primary,
        }}>
            {pic
                ? <img src={toUrl(pic)} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                : initials}
        </div>
    );
}

function Divider() {
    return <div style={{ height: 1, background: C.border, margin: "4px 0" }} />;
}

function Label({ text }) {
    return (
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: C.muted, padding: "10px 10px 4px", fontFamily: inter }}>
            {text}
        </div>
    );
}

function EmptyNote({ text }) {
    return (
        <div style={{ textAlign: "center", padding: "36px 20px", color: C.muted, fontSize: 13, fontFamily: inter, lineHeight: 1.6 }}>
            {text}
        </div>
    );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(30,58,43,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 24 }}>
            <div style={{ background: C.bg, borderRadius: 24, padding: "28px", border: `2px solid ${C.primary}`, maxWidth: 340, width: "100%", boxShadow: "6px 6px 0 rgba(30,58,43,0.14)" }}>
                <p style={{ fontFamily: faro, fontSize: 18, fontWeight: 900, color: C.primary, marginBottom: 20, lineHeight: 1.3 }}>{message}</p>
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
        <div style={{ padding: "16px 20px", borderBottom: `1.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <span style={{ fontFamily: faro, fontSize: 19, fontWeight: 900, color: C.primary, letterSpacing: "-0.4px" }}>{title}</span>
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
        <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 13, fontFamily: inter, fontWeight: 600, padding: "14px 20px 8px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {label}
        </button>
    );
}

// ─── UNIVERSAL PROFILE VIEW ───────────────────────────────────
// Used EVERYWHERE a profile needs to be shown.
// Pass userId. It fetches the profile and derives all buttons.
// Pass myUserId so it knows if this is the own profile.
function ProfileView({ userId, myUserId, onStartChat, onFriendshipChange, onEditProfile }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirm, setConfirm] = useState(null);
    const [busy, setBusy] = useState(false);
    const isOwnProfile = userId === myUserId;

    useEffect(() => {
        if (!userId) return;
        load();
    }, [userId]);

    const load = async () => {
        setLoading(true);
        try {
            const res = await getMyProfile(userId);
            setProfile(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const ask = (msg, action) => setConfirm({ msg, action });

    const doAction = async (fn) => {
        setBusy(true);
        try { await fn(); await load(); onFriendshipChange?.(); }
        catch (e) { console.error(e); }
        finally { setBusy(false); }
    };

    const handleAdd = () => doAction(() => sendRequest(userId));

    const handleAccept = () => doAction(() => acceptRequest(userId));

    const handleDecline = () => ask("Decline this friend request?",
        () => doAction(() => rejectRequest(userId)));

    const handleTakeBack = () => ask("Take back your friend request?",
        () => doAction(() => takebackRequest(userId)));

    const handleRemove = () => ask(`Remove ${profile?.name || profile?.username} from friends?`,
        () => doAction(() => removeFriend(userId)));

    const handleMessage = async () => {
        try {
            const res = await createConversation(userId);
            onStartChat?.(res.data);
        } catch (e) { console.error(e); }
    };

    if (loading) return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontFamily: inter, fontSize: 13 }}>
            Loading profile...
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
                    onConfirm={() => { setConfirm(null); confirm.action(); }}
                    onCancel={() => setConfirm(null)}
                />
            )}

            {/* Profile card */}
            <div style={{
                background: C.accent, borderRadius: 22, padding: "28px 20px",
                border: `2px solid ${C.primary}`,
                boxShadow: "4px 4px 0 rgba(30,58,43,0.11)",
                display: "flex", flexDirection: "column", alignItems: "center",
                textAlign: "center", gap: 10,
            }}>
                <Avatar name={profile.name || profile.username} pic={profile.profilePic} size={80} />

                <div>
                    <div style={{ fontFamily: faro, fontSize: 22, fontWeight: 900, color: C.primary, letterSpacing: "-0.5px" }}>
                        {profile.name || profile.username}
                    </div>
                    <div style={{ fontSize: 13, color: "#3a5c48", fontFamily: inter, marginTop: 3 }}>
                        @{profile.username}
                    </div>
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
            {profile.relationshipStatus}
          </span>
                )}

                {/* Online dot — own profile shows privacy status */}
                {isOwnProfile && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#3a5c48", fontFamily: inter }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: profile.isPrivate ? "rgba(30,58,43,0.3)" : "#4ade80" }} />
                        {profile.isPrivate ? "Private account" : "Public account"}
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {isOwnProfile ? (
                    // Own profile — edit button
                    <button className="primary-btn" onClick={onEditProfile}>Edit profile</button>
                ) : (
                    <>
                        {/* Friends → message + remove */}
                        {fs === 2 && (
                            <>
                                <button className="primary-btn" onClick={handleMessage} disabled={busy}>Message</button>
                                <button className="ghost-btn" onClick={handleRemove} disabled={busy}>Remove friend</button>
                            </>
                        )}

                        {/* No connection → add friend */}
                        {!fs && (
                            <button className="primary-btn" onClick={handleAdd} disabled={busy}>
                                {busy ? "Sending..." : "Add friend"}
                            </button>
                        )}

                        {/* You sent request → take back */}
                        {fs === 1 && isSender === true && (
                            <button className="secondary-btn" onClick={handleTakeBack} disabled={busy}>
                                Request sent — take back?
                            </button>
                        )}

                        {/* They sent request → accept + decline */}
                        {fs === 1 && isSender === false && (
                            <div style={{ display: "flex", gap: 9 }}>
                                <button className="primary-btn" onClick={handleAccept} disabled={busy}>Accept</button>
                                <button className="secondary-btn" onClick={handleDecline} disabled={busy}>Decline</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// ─── OWN PROFILE EDIT ─────────────────────────────────────────
const RL_OPTIONS = [
    { value: "", label: "Prefer not to say" },
    { value: "SINGLE", label: "Single 🌿" },
    { value: "COMMITTED", label: "In a relationship 💛" },
    { value: "MARRIED", label: "Married 💍" },
    { value: "COMPLICATED", label: "It's complicated 🌀" },
];

function OwnProfileEdit({ profile, onSaved, onCancel }) {
    const [form, setForm] = useState({
        name: profile?.name || "",
        bio: profile?.bio || "",
        relationshipStatus: profile?.relationshipStatus || "",
        isPrivate: profile?.isPrivate || false,
    });
    const [preview, setPreview] = useState(profile?.profilePic || null);
    const [imageFile, setImageFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const fileRef = useRef(null);

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { setError("Select an image file."); return; }
        if (file.size > 5 * 1024 * 1024) { setError("Max 5MB."); return; }
        setError("");
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        if (!form.name.trim()) { setError("Display name is required."); return; }
        setSaving(true); setError("");
        try {
            let picUrl = profile?.profilePic || null;
            if (imageFile) picUrl = await uploadProfilePic(imageFile);
            if (!preview && !imageFile) picUrl = null;
            await updateProfile({
                name: form.name,
                bio: form.bio || null,
                profilePic: picUrl,
                relationshipStatus: form.relationshipStatus || null,
                isPrivate: form.isPrivate,
            });
            onSaved();
        } catch (e) { setError("Failed to save. Try again."); }
        finally { setSaving(false); }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "16px 20px 24px" }}>
            {/* Pic upload */}
            <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.primary, display: "block", marginBottom: 10, fontFamily: inter }}>
                    Profile picture
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", border: `2px solid ${C.primary}`, background: C.lavender, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {preview
                            ? <img src={preview.startsWith("blob:") ? preview : toUrl(preview)} alt="pic" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <svg width="26" height="26" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="12" r="6" stroke={C.primary} strokeWidth="2" opacity="0.4" /><path d="M4 28 Q4 20 16 20 Q28 20 28 28" stroke={C.primary} strokeWidth="2" strokeLinecap="round" opacity="0.4" /></svg>
                        }
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <button onClick={() => fileRef.current?.click()} style={{ padding: "8px 16px", background: C.primary, color: C.accent, border: "none", borderRadius: 100, fontSize: 12, fontWeight: 600, fontFamily: inter, cursor: "pointer" }}>
                            {preview ? "Change photo" : "Upload photo"}
                        </button>
                        {preview && (
                            <button onClick={() => { setPreview(null); setImageFile(null); if (fileRef.current) fileRef.current.value = ""; }} style={{ padding: "8px 16px", background: "transparent", color: C.primary, border: `1.5px solid ${C.primary}`, borderRadius: 100, fontSize: 12, fontWeight: 600, fontFamily: inter, cursor: "pointer" }}>
                                Remove
                            </button>
                        )}
                        <span style={{ fontSize: 11, color: "#3a5c48", fontFamily: inter }}>JPG, PNG · Max 5MB</span>
                    </div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
            </div>

            {/* Name */}
            <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.primary, display: "block", marginBottom: 5, fontFamily: inter }}>Display name</label>
                <input className="auth-input" name="name" placeholder="Your name" value={form.name} onChange={handleChange} />
            </div>

            {/* Bio */}
            <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.primary, display: "block", marginBottom: 5, fontFamily: inter }}>Bio</label>
                <textarea className="auth-input" name="bio" placeholder="A short bio..." value={form.bio} onChange={handleChange} rows={3} style={{ resize: "none", borderRadius: 14, lineHeight: 1.5 }} />
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
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2, fontFamily: inter }}>Hide from search and friend lists</div>
                </div>
                <div onClick={() => setForm(f => ({ ...f, isPrivate: !f.isPrivate }))}
                     style={{ width: 44, height: 23, borderRadius: 100, border: `2px solid ${C.primary}`, cursor: "pointer", display: "flex", alignItems: "center", padding: 2, background: form.isPrivate ? C.primary : "transparent", transition: "background 0.2s" }}>
                    <div style={{ width: 15, height: 15, borderRadius: "50%", background: form.isPrivate ? C.accent : C.primary, transition: "transform 0.2s", transform: form.isPrivate ? "translateX(21px)" : "translateX(0)" }} />
                </div>
            </div>

            {error && <div style={{ background: "rgba(30,58,43,0.08)", borderRadius: 10, padding: "9px 13px", fontSize: 13, color: C.primary, fontFamily: inter }}>{error}</div>}

            <div style={{ display: "flex", gap: 9, marginTop: 4 }}>
                <button className="primary-btn" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
                <button className="secondary-btn" onClick={onCancel} style={{ width: "auto", padding: "13px 20px" }}>Cancel</button>
            </div>
        </div>
    );
}

// ─── APP PAGE ─────────────────────────────────────────────────
export default function AppPage() {
    const navigate = useNavigate();
    const myUserId = getMyUserId();

    // ── App state ──────────────────────────────────────────────
    const [chats, setChats] = useState([]);
    const [friends, setFriends] = useState([]);
    const [pending, setPending] = useState([]);
    const [activeConvo, setActiveConvo] = useState(null);

    // view: "empty" | "chat" | "search" | "profile" | "friends" | "userProfile"
    const [view, setView] = useState("empty");

    // When viewing someone's profile
    const [profileUserId, setProfileUserId] = useState(null);
    const [profileReturnView, setProfileReturnView] = useState("empty");

    // Own profile edit mode
    const [ownProfileMode, setOwnProfileMode] = useState("view"); // "view" | "edit"
    const [ownProfile, setOwnProfile] = useState(null);

    const wsRef = useRef(null);

    // ── Boot ──────────────────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        refreshAll();
        connectWS(token);
        return () => wsRef.current?.close();
    }, []);

    const refreshAll = async () => {
        await Promise.all([loadChats(), loadFriends(), loadPending()]);
    };

    const loadChats = async () => {
        try { const r = await getChats(); setChats(r.data); } catch (e) {}
    };

    const loadFriends = async () => {
        try { const r = await getFriends(); setFriends(r.data); } catch (e) {}
    };

    const loadPending = async () => {
        try { const r = await getPendingFn(); setPending(r.data); } catch (e) {}
    };

    const loadOwnProfile = async () => {
        try { const r = await getMyProfile(myUserId); setOwnProfile(r.data); } catch (e) {}
    };

    // ── WebSocket ─────────────────────────────────────────────
    const connectWS = (token) => {
        const ws = new WebSocket(`ws://localhost:8081/ws/chat?token=${token}`);
        ws.onopen = () => console.log("WS connected");
        ws.onmessage = (e) => {
            const pkt = JSON.parse(e.data);
            switch (pkt.type) {
                case "FRIEND_REQUEST":
                    // Add to pending live
                    setPending(prev => {
                        const exists = prev.some(p => p.senderId === pkt.payload.senderId);
                        if (exists) return prev;
                        return [...prev, {
                            friendshipId: Date.now(),
                            senderId: pkt.payload.senderId,
                            receiverId: myUserId,
                            status: 1,
                            friendId: pkt.payload.senderId,
                            friendUsername: pkt.payload.senderUsername,
                            friendName: pkt.payload.senderName,
                            friendProfilePic: null,
                        }];
                    });
                    break;
                case "REQUEST_ACCEPTED":
                    // Remove from pending (if we sent request) and reload friends
                    loadFriends();
                    loadPending();
                    break;
                case "FRIEND_REMOVED":
                    // Remove from friends list live
                    setFriends(prev => prev.filter(f => f.friendId !== pkt.payload.removerId));
                    break;
                case "MESSAGE_DELIVERED":
                    setChats(prev => prev.map(c =>
                        c.conversationId === pkt.payload.conversationId
                            ? { ...c, lastMessage: pkt.payload.content, lastMessageAt: pkt.payload.deliveredAt }
                            : c
                    ));
                    loadChats();
                    break;
                case "RECEIVE_MESSAGE":
                    setChats(prev => prev.map(c =>
                        c.conversationId === pkt.payload.conversationId
                            ? { ...c, lastMessage: pkt.payload.content, lastMessageAt: pkt.payload.timestamp }
                            : c
                    ));
                    loadChats();
                    break;
                default: break;
            }
        };
        ws.onclose = () => console.log("WS disconnected");
        wsRef.current = ws;
    };

    const sendWs = useCallback((packet) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(packet));
        }
    }, []);

    // ── Navigation helpers ────────────────────────────────────
    const openUserProfile = (userId, returnView) => {
        setProfileUserId(userId);
        setProfileReturnView(returnView || view);
        setView("userProfile");
    };

    const openOwnProfile = async () => {
        await loadOwnProfile();
        setOwnProfileMode("view");
        setView("profile");
    };

    const openChat = (convoId) => {
        setActiveConvo(convoId);
        setView("chat");
        loadChats();
    };

    const onFriendshipChange = () => {
        loadFriends();
        loadPending();
    };

    const handleStartChat = async (convoId) => {
        openChat(convoId);
    };

    // ── Render ────────────────────────────────────────────────
    const pendingCount = pending.length;
    const activeChat = chats.find(c => c.conversationId === activeConvo);

    return (
        <div style={{ display: "flex", height: "100vh", background: C.bg, overflow: "hidden" }}>
            <GlobalStyles />

            {/* ── LEFT SIDEBAR ── */}
            <div style={{ width: 296, display: "flex", flexDirection: "column", height: "100vh", flexShrink: 0, borderRight: `1.5px solid ${C.border}` }}>

                {/* Sidebar header */}
                <div style={{ padding: "16px 14px 10px", borderBottom: `1.5px solid ${C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontFamily: faro, fontSize: 21, fontWeight: 900, color: C.primary, letterSpacing: "-0.5px" }}>Ripple^</span>
                        <div style={{ display: "flex", gap: 2 }}>

                            {/* Friends icon */}
                            <button className="icon-btn" onClick={() => setView("friends")} style={{ position: "relative" }} title="Friends">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
                                    <circle cx="9" cy="7" r="4" stroke={C.primary} strokeWidth="2" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                {pendingCount > 0 && (
                                    <span style={{ position: "absolute", top: 3, right: 3, width: 8, height: 8, borderRadius: "50%", background: C.accent, border: `1.5px solid ${C.primary}` }} />
                                )}
                            </button>

                            {/* Search icon */}
                            <button className="icon-btn" onClick={() => setView("search")} title="Search">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                                    <circle cx="11" cy="11" r="8" stroke={C.primary} strokeWidth="2" />
                                    <path d="m21 21-4.35-4.35" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>

                            {/* Own profile icon */}
                            <button className="icon-btn" onClick={openOwnProfile} title="Profile">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="8" r="4" stroke={C.primary} strokeWidth="2" />
                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chat list */}
                <div style={{ flex: 1, overflowY: "auto", padding: "6px 6px" }}>
                    <Label text="Messages" />
                    {chats.length === 0
                        ? <EmptyNote text="No conversations yet" />
                        : chats.map(chat => (
                            <div
                                key={chat.conversationId}
                                className={`hover-bg${activeConvo === chat.conversationId ? " active-chat" : ""}`}
                                onClick={() => openChat(chat.conversationId)}
                                style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 9px", borderRadius: 13, cursor: "pointer", marginBottom: 1 }}
                            >
                                <Avatar name={chat.name} pic={chat.profilePic} size={41} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                        <span style={{ fontWeight: 700, fontSize: 13.5, color: C.primary, fontFamily: inter }}>{chat.name || "Chat"}</span>
                                        <span style={{ fontSize: 10.5, color: C.muted, fontFamily: inter, flexShrink: 0 }}>{formatTime(chat.lastMessageAt)}</span>
                                    </div>
                                    <div style={{ fontSize: 12.5, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1, fontFamily: inter }}>
                                        {chat.lastMessage || "No messages yet"}
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                {/* Empty state */}
                {view === "empty" && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 40 }}>
                        <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.accent, border: `2px solid ${C.primary}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>💬</div>
                        <div style={{ textAlign: "center" }}>
                            <p style={{ fontFamily: faro, fontSize: 24, fontWeight: 900, color: C.primary, marginBottom: 6, letterSpacing: "-0.5px" }}>Start chatting</p>
                            <p style={{ fontSize: 14, color: C.muted, marginBottom: 22, fontFamily: inter }}>Select a conversation or search for someone</p>
                            <button className="primary-btn" style={{ width: "auto", padding: "11px 28px" }} onClick={() => setView("search")}>Find someone →</button>
                        </div>
                    </div>
                )}

                {/* Chat window */}
                {view === "chat" && activeConvo && (
                    <ChatWindow
                        convoId={activeConvo}
                        convoInfo={activeChat}
                        sendWs={sendWs}
                        wsRef={wsRef}
                        myUserId={myUserId}
                        friends={friends}
                        onMessageSent={loadChats}
                        onOpenProfile={(userId) => openUserProfile(userId, "chat")}
                    />
                )}

                {/* Search panel */}
                {view === "search" && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <PanelHeader title="Search" onClose={() => setView("empty")} />
                        <SearchContent
                            myUserId={myUserId}
                            onOpenProfile={(userId) => openUserProfile(userId, "search")}
                            onStartChat={handleStartChat}
                        />
                    </div>
                )}

                {/* Friends panel */}
                {view === "friends" && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <PanelHeader title="Friends" onClose={() => setView("empty")} />
                        <FriendsContent
                            friends={friends}
                            pending={pending}
                            myUserId={myUserId}
                            onOpenProfile={(userId) => openUserProfile(userId, "friends")}
                            onAccept={async (senderId) => {
                                await acceptRequest(senderId);
                                onFriendshipChange();
                            }}
                            onDecline={async (senderId) => {
                                await rejectRequest(senderId);
                                onFriendshipChange();
                            }}
                        />
                    </div>
                )}

                {/* Own profile panel */}
                {view === "profile" && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <PanelHeader
                            title={ownProfileMode === "edit" ? "Edit profile" : "Profile"}
                            onClose={() => { setView("empty"); setOwnProfileMode("view"); }}
                        />
                        {ownProfileMode === "view" ? (
                            <div style={{ flex: 1, overflowY: "auto" }}>
                                <ProfileView
                                    userId={myUserId}
                                    myUserId={myUserId}
                                    onEditProfile={() => setOwnProfileMode("edit")}
                                    onFriendshipChange={onFriendshipChange}
                                    onStartChat={handleStartChat}
                                />
                                <div style={{ padding: "0 20px 20px" }}>
                                    <button className="ghost-btn" onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }}>
                                        Log out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ flex: 1, overflowY: "auto" }}>
                                {ownProfileMode === "edit" && (
                                    <OwnProfileEdit
                                        profile={ownProfile}
                                        onSaved={async () => {
                                            await loadOwnProfile();
                                            setOwnProfileMode("view");
                                        }}
                                        onCancel={() => setOwnProfileMode("view")}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Any user's profile */}
                {view === "userProfile" && profileUserId && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <PanelHeader title="Profile" onClose={() => setView(profileReturnView)} />
                        <BackBtn label="Back" onClick={() => setView(profileReturnView)} />
                        <ProfileView
                            userId={profileUserId}
                            myUserId={myUserId}
                            onFriendshipChange={onFriendshipChange}
                            onStartChat={handleStartChat}
                            onEditProfile={() => setOwnProfileMode("edit")}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── CHAT WINDOW ──────────────────────────────────────────────
function ChatWindow({ convoId, convoInfo, sendWs, wsRef, myUserId, friends, onMessageSent, onOpenProfile }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const bottomRef = useRef(null);

    // Check if user is friend for this direct conversation
    // We check by looking at the conversation name (which is the friend's username)
    // The real check is done on backend — frontend just shows blocked UI if WS returns not_friends error
    const [notFriendsError, setNotFriendsError] = useState(false);

    useEffect(() => {
        if (!convoId) return;
        setNotFriendsError(false);
        load();
    }, [convoId]);

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
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 40);
                onMessageSent();
            }
            if (pkt.type === "MESSAGE_DELIVERED" && pkt.payload.conversationId === convoId) {
                setMessages(prev => prev.map(m =>
                    m.messageId > 1_000_000_000_000
                        ? { ...m, messageId: pkt.payload.messageId, sentAt: pkt.payload.deliveredAt }
                        : m
                ));
                onMessageSent();
            }
            if (pkt.error === "not_friends") {
                setNotFriendsError(true);
            }
        };
        wsRef.current.addEventListener("message", handler);
        return () => wsRef.current?.removeEventListener("message", handler);
    }, [convoId, wsRef]);

    const load = async () => {
        try {
            const r = await getMessages(convoId);
            setMessages(r.data);
            // Initialize tick status for own messages loaded from DB
            // All DB messages are at minimum "delivered" since they were saved
            const initialStatuses = {};
            r.data.forEach(msg => {
                if (msg.senderId === myUserId) {
                    initialStatuses[msg.messageId] = "delivered";
                }
            });
            setReadStatuses(prev => ({ ...prev, ...initialStatuses }));
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "instant" }), 40);
        } catch {}
    };

    const send = () => {
        if (!input.trim() || notFriendsError) return;
        const content = input.trim();
        setMessages(prev => [...prev, {
            messageId: Date.now(),
            senderId: myUserId,
            content,
            sentAt: new Date().toISOString(),
            isDeleted: false,
        }]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 40);
        sendWs({ type: "SEND_MESSAGE", payload: { conversationId: convoId, content } });
        setInput("");
        onMessageSent();
    };

    const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

    const isDirect = convoInfo?.type === "PRIVATE" || !convoInfo?.type;

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

            {/* Chat header */}
            <div
                style={{ padding: "12px 18px", borderBottom: `1.5px solid ${C.border}`, display: "flex", alignItems: "center", gap: 11, flexShrink: 0, cursor: isDirect ? "pointer" : "default" }}
                onClick={() => isDirect && convoInfo && onOpenProfile && onOpenProfile(convoInfo.receiverId)}
            >
                <Avatar name={convoInfo?.name || "Chat"} pic={convoInfo?.profilePic} size={38} />
                <div>
                    <div style={{ fontFamily: faro, fontSize: 15, fontWeight: 900, color: C.primary, letterSpacing: "-0.3px" }}>
                        {convoInfo?.name || "Chat"}
                    </div>
                    {isDirect && (
                        <div style={{ fontSize: 11, color: C.muted, fontFamily: inter }}>Tap to view profile</div>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
                {messages.map(msg => {
                    const isOwn = msg.senderId === myUserId;
                    const senderName = !isOwn && convoInfo?.type === "GROUP"
                        ? (msg.senderUsername || `User ${msg.senderId}`)
                        : null;
                    const time = formatTime(msg.sendAt || msg.sentAt);
                    return (
                        <div key={msg.messageId} style={{ display: "flex", justifyContent: isOwn ? "flex-end" : "flex-start" }}>
                            <div style={{
                                maxWidth: "64%", padding: "9px 15px",
                                borderRadius: isOwn ? "17px 17px 4px 17px" : "17px 17px 17px 4px",
                                background: isOwn ? C.primary : C.white,
                                color: isOwn ? C.accent : C.primary,
                                fontSize: 14, lineHeight: 1.5, fontFamily: inter,
                                border: isOwn ? "none" : `1.5px solid ${C.border}`,
                                boxShadow: "0 1px 3px rgba(30,58,43,0.05)",
                            }}>
                                {senderName && (
                                    <div style={{
                                        fontSize: 11, fontWeight: 700, color: C.priv,
                                        fontFamily: faro, marginBottom: 3, opacity: 0.85,
                                    }}>
                                        {senderName}
                                    </div>
                                )}
                                {msg.isDeleted
                                    ? <span style={{ opacity: 0.45, fontStyle: "italic" }}>This message was deleted</span>
                                    : msg.content
                                }
                                {time && <div style={{ fontSize: 10, opacity: 0.45, marginTop: 3, textAlign: "right" }}>{time}</div>}
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input or not-friends banner */}
            {notFriendsError ? (
                <div style={{ padding: "14px 20px", borderTop: `1.5px solid ${C.border}`, textAlign: "center", fontSize: 13, color: C.muted, fontFamily: inter, background: "rgba(30,58,43,0.03)" }}>
                    You are no longer friends. Reconnect to send messages.
                </div>
            ) : (
                <div style={{ padding: "10px 16px 14px", borderTop: `1.5px solid ${C.border}`, display: "flex", gap: 9, alignItems: "center" }}>
                    <input className="msg-input" placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey} />
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

// ─── SEARCH CONTENT ───────────────────────────────────────────
function SearchContent({ myUserId, onOpenProfile, onStartChat }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query.trim()) { setResults([]); return; }
        const t = setTimeout(async () => {
            setLoading(true);
            try { const r = await searchUsers(query); setResults(r.data); }
            catch (e) {}
            finally { setLoading(false); }
        }, 280);
        return () => clearTimeout(t);
    }, [query]);

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "12px 20px", borderBottom: `1.5px solid ${C.border}` }}>
                <div style={{ position: "relative" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", opacity: 0.38 }}>
                        <circle cx="11" cy="11" r="8" stroke={C.primary} strokeWidth="2" />
                        <path d="m21 21-4.35-4.35" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input className="auth-input" placeholder="Search by username..." value={query} onChange={e => setQuery(e.target.value)} style={{ paddingLeft: 38 }} autoFocus />
                </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
                {!query && <EmptyNote text="Type a username to search" />}
                {loading && <EmptyNote text="Searching..." />}
                {!loading && query && results.length === 0 && <EmptyNote text={`No users found for "${query}"`} />}
                {results.map(user => (
                    <div
                        key={user.userId}
                        className="hover-bg"
                        onClick={() => onOpenProfile(user.userId)}
                        style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 10px", borderRadius: 13, marginBottom: 1, cursor: "pointer" }}
                    >
                        <Avatar name={user.name || user.username} pic={user.profilePic} size={43} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: C.primary, fontFamily: inter }}>
                                {user.name || user.username}
                                {user.userId === myUserId && <span style={{ fontSize: 11, color: C.muted, marginLeft: 6, fontWeight: 400 }}>(you)</span>}
                            </div>
                            <div style={{ fontSize: 12, color: C.muted, fontFamily: inter }}>@{user.username}</div>
                        </div>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.28, flexShrink: 0 }}>
                            <path d="M9 18l6-6-6-6" stroke={C.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── FRIENDS CONTENT ──────────────────────────────────────────
function FriendsContent({ friends, pending, myUserId, onOpenProfile, onAccept, onDecline }) {
    const [tab, setTab] = useState("friends");
    const [confirm, setConfirm] = useState(null);

    const ask = (msg, action) => setConfirm({ msg, action });

    const TabBtn = ({ id, label, count }) => (
        <button onClick={() => setTab(id)} style={{
            padding: "7px 18px", borderRadius: 100, border: "none", cursor: "pointer",
            fontFamily: inter, fontSize: 13, fontWeight: 600, transition: "all 0.15s",
            background: tab === id ? C.primary : "transparent",
            color: tab === id ? C.accent : C.primary,
        }}>
            {label}
            {count > 0 && <span style={{ marginLeft: 5, background: C.accent, color: C.primary, borderRadius: 100, padding: "1px 6px", fontSize: 11 }}>{count}</span>}
        </button>
    );

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {confirm && <ConfirmDialog message={confirm.msg} onConfirm={() => { setConfirm(null); confirm.action(); }} onCancel={() => setConfirm(null)} />}

            <div style={{ padding: "10px 18px", borderBottom: `1.5px solid ${C.border}`, display: "flex", gap: 5 }}>
                <TabBtn id="friends" label="Friends" count={0} />
                <TabBtn id="pending" label="Requests" count={pending.length} />
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
                {tab === "friends" && (
                    friends.length === 0
                        ? <EmptyNote text="No friends yet. Search for people to connect." />
                        : friends.map(f => (
                            <div key={f.friendshipId} className="hover-bg"
                                 onClick={() => onOpenProfile(f.friendId)}
                                 style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 10px", borderRadius: 13, marginBottom: 1, cursor: "pointer" }}
                            >
                                <Avatar name={f.friendName || f.friendUsername} pic={f.friendProfilePic} size={43} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: C.primary, fontFamily: inter }}>{f.friendName || f.friendUsername}</div>
                                    <div style={{ fontSize: 12, color: C.muted, fontFamily: inter }}>@{f.friendUsername}</div>
                                </div>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.28, flexShrink: 0 }}>
                                    <path d="M9 18l6-6-6-6" stroke={C.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        ))
                )}

                {tab === "pending" && (
                    pending.length === 0
                        ? <EmptyNote text="No pending requests." />
                        : pending.map(p => (
                            <div key={p.friendshipId} style={{ background: C.white, borderRadius: 15, padding: "13px", marginBottom: 7, border: `1.5px solid ${C.border}` }}>
                                <div
                                    className="hover-bg"
                                    onClick={() => onOpenProfile(p.friendId)}
                                    style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 10, cursor: "pointer", borderRadius: 10, padding: "2px" }}
                                >
                                    <Avatar name={p.friendName || p.friendUsername} pic={p.friendProfilePic} size={43} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: C.primary, fontFamily: inter }}>{p.friendName || p.friendUsername}</div>
                                        <div style={{ fontSize: 12, color: C.muted, fontFamily: inter }}>@{p.friendUsername} · wants to connect</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 7 }}>
                                    <button onClick={() => onAccept(p.senderId)} style={{ flex: 1, padding: "9px", background: C.primary, color: C.accent, border: "none", borderRadius: 100, fontSize: 13, fontWeight: 700, fontFamily: inter, cursor: "pointer" }}>Accept</button>
                                    <button onClick={() => ask(`Decline request from ${p.friendUsername}?`, () => onDecline(p.senderId))} style={{ flex: 1, padding: "9px", background: "transparent", color: C.primary, border: `1.5px solid ${C.primary}`, borderRadius: 100, fontSize: 13, fontWeight: 600, fontFamily: inter, cursor: "pointer" }}>Decline</button>
                                </div>
                            </div>
                        ))
                )}
            </div>
        </div>
    );
}