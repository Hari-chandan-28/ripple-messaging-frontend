import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getChats } from "../services/messages";
import { getPending } from "../services/friendship";

const C = {
    bg: "#f8f4f0",
    primary: "#1e3a2b",
    accent: "#eff87a",
    lavender: "#cfdcff",
    white: "#ffffff",
    border: "rgba(30,58,43,0.12)",
};
const faro = "'Faro', sans-serif";
const inter = "'Inter', sans-serif";

export { C, faro, inter };

export default function AppPage() {
    const [view, setView] = useState("chats");
    const [activeConvo, setActiveConvo] = useState(null);
    const [chats, setChats] = useState([]);
    const [pendingCount, setPendingCount] = useState(0);
    const wsRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        // if (!token) { navigate("/login"); return; }
        loadChats();
        loadPending();
        connectWebSocket(token);
        return () => wsRef.current?.close();
    }, []);

    const loadChats = async () => {
        try {
            const res = await getChats();
            setChats(res.data);
        } catch (e) { console.error(e); }
    };

    const loadPending = async () => {
        try {
            const res = await getPending();
            setPendingCount(res.data.length);
        } catch (e) {}
    };

    const connectWebSocket = (token) => {
        const ws = new WebSocket(`ws://localhost:8081/ws/chat?token=${token}`);
        ws.onopen = () => console.log("WS connected");
        ws.onmessage = (e) => {
            const packet = JSON.parse(e.data);
            if (packet.type === "RECEIVE_MESSAGE" || packet.type === "MESSAGE_DELIVERED") {
                loadChats();
            }
        };
        ws.onclose = () => console.log("WS disconnected");
        wsRef.current = ws;
    };

    const sendWsMessage = useCallback((packet) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(packet));
        }
    }, []);

    return (
        <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: inter, overflow: "hidden" }}>
            <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(30,58,43,0.2); border-radius: 4px; }
        .sidebar-item:hover { background: rgba(30,58,43,0.05); }
        .sidebar-item.active { background: rgba(239,248,122,0.4); }
        .icon-btn { background: none; border: none; cursor: pointer; padding: 8px; border-radius: 10px; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
        .icon-btn:hover { background: rgba(30,58,43,0.08); }
        .msg-input { flex: 1; padding: 12px 16px; border: 2px solid transparent; border-radius: 100px; font-size: 14px; font-family: ${inter}; background: rgba(30,58,43,0.06); color: ${C.primary}; outline: none; transition: border-color 0.2s; }
        .msg-input:focus { border-color: ${C.primary}; background: ${C.white}; }
        .msg-input::placeholder { color: rgba(30,58,43,0.35); }
        .send-btn { width: 40px; height: 40px; border-radius: 50%; background: ${C.primary}; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.15s, transform 0.15s; }
        .send-btn:hover { background: #2d5540; transform: scale(1.05); }
        .auth-input { width: 100%; padding: 12px 16px; border: 2px solid ${C.primary}; border-radius: 14px; font-size: 14px; font-family: ${inter}; background: ${C.white}; color: ${C.primary}; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .auth-input:focus { box-shadow: 0 0 0 4px rgba(30,58,43,0.1); }
        .auth-input::placeholder { color: rgba(30,58,43,0.35); }
        .save-btn { padding: 12px 28px; background: ${C.primary}; color: ${C.accent}; border: none; border-radius: 100px; font-size: 14px; font-weight: 700; font-family: ${inter}; cursor: pointer; transition: background 0.2s, transform 0.15s; }
        .save-btn:hover { background: #2d5540; transform: translateY(-1px); }
        .action-btn { padding: 8px 18px; border-radius: 100px; font-size: 13px; font-weight: 600; font-family: ${inter}; cursor: pointer; transition: all 0.15s; border: 1.5px solid ${C.primary}; }
      `}</style>

            {/* SIDEBAR */}
            <Sidebar
                chats={chats}
                activeConvo={activeConvo}
                view={view}
                pendingCount={pendingCount}
                onSelectConvo={(id) => { setActiveConvo(id); setView("chats"); }}
                onSearchClick={() => setView("search")}
                onProfileClick={() => setView("profile")}
                onFriendsClick={() => setView("friends")}
            />

            {/* RIGHT PANEL */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", borderLeft: `1.5px solid ${C.border}` }}>
                {view === "chats" && activeConvo
                    ? <ChatWindow convoId={activeConvo} sendWs={sendWsMessage} wsRef={wsRef} onMessageSent={loadChats} />
                    : view === "chats"
                        ? <EmptyState onSearchClick={() => setView("search")} />
                        : view === "search"
                            ? <SearchPanel onClose={() => setView("chats")} onStartChat={(id) => { setActiveConvo(id); setView("chats"); }} />
                            : view === "profile"
                                ? <ProfilePanel onClose={() => setView("chats")} />
                                : view === "friends"
                                    ? <FriendsPanel onClose={() => setView("chats")} pendingCount={pendingCount} onAccept={loadPending} />
                                    : null
                }
            </div>
        </div>
    );
}

// ─── SIDEBAR ──────────────────────────────────────────────────
function Sidebar({ chats, activeConvo, view, pendingCount, onSelectConvo, onSearchClick, onProfileClick, onFriendsClick }) {
    return (
        <div style={{ width: 300, display: "flex", flexDirection: "column", height: "100vh", background: C.bg, flexShrink: 0 }}>

            {/* Header */}
            <div style={{ padding: "20px 16px 12px", borderBottom: `1.5px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <span style={{ fontFamily: faro, fontSize: 22, fontWeight: 900, color: C.primary, letterSpacing: "-0.5px" }}>Ripple^</span>
                    <div style={{ display: "flex", gap: 4 }}>
                        {/* Friends / pending */}
                        <button className="icon-btn" onClick={onFriendsClick} style={{ position: "relative" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
                                <circle cx="9" cy="7" r="4" stroke={C.primary} strokeWidth="2" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            {pendingCount > 0 && (
                                <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: "50%", background: C.accent, border: `1.5px solid ${C.primary}` }} />
                            )}
                        </button>
                        {/* Search */}
                        <button className="icon-btn" onClick={onSearchClick}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <circle cx="11" cy="11" r="8" stroke={C.primary} strokeWidth="2" />
                                <path d="m21 21-4.35-4.35" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                        {/* Profile */}
                        <button className="icon-btn" onClick={onProfileClick}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="8" r="4" stroke={C.primary} strokeWidth="2" />
                                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Chat list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(30,58,43,0.4)", padding: "8px 8px 6px", fontFamily: inter }}>
                    Messages
                </div>
                {chats.length === 0 ? (
                    <div style={{ padding: "24px 12px", textAlign: "center", color: "rgba(30,58,43,0.4)", fontSize: 13, fontFamily: inter }}>
                        No conversations yet
                    </div>
                ) : (
                    chats.map((chat) => (
                        <div
                            key={chat.conversationId}
                            className={`sidebar-item${activeConvo === chat.conversationId ? " active" : ""}`}
                            onClick={() => onSelectConvo(chat.conversationId)}
                            style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 10px", borderRadius: 14, cursor: "pointer", marginBottom: 2 }}
                        >
                            <Avatar name={chat.name} pic={chat.profilePic} size={42} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontWeight: 700, fontSize: 14, color: C.primary, fontFamily: inter }}>{chat.name || "Unknown"}</span>
                                    {chat.lastMessageAt && (
                                        <span style={{ fontSize: 11, color: "rgba(30,58,43,0.4)", fontFamily: inter, flexShrink: 0 }}>
                      {formatTime(chat.lastMessageAt)}
                    </span>
                                    )}
                                </div>
                                <div style={{ fontSize: 13, color: "rgba(30,58,43,0.5)", fontFamily: inter, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                                    {chat.lastMessage || "No messages yet"}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// ─── AVATAR ───────────────────────────────────────────────────
function Avatar({ name, pic, size = 40 }) {
    const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%",
            background: pic ? "transparent" : C.lavender,
            border: `2px solid ${C.primary}`,
            flexShrink: 0, overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: faro, fontWeight: 900, fontSize: size * 0.35, color: C.primary,
        }}>
            {pic ? <img src={pic} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
        </div>
    );
}

// ─── EMPTY STATE ──────────────────────────────────────────────
function EmptyState({ onSearchClick }) {
    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 40 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: C.accent, border: `2px solid ${C.primary}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
                💬
            </div>
            <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily: faro, fontSize: 26, fontWeight: 900, color: C.primary, margin: "0 0 8px", letterSpacing: "-0.5px" }}>Start a conversation</p>
                <p style={{ fontSize: 14, color: "rgba(30,58,43,0.5)", margin: "0 0 24px", fontFamily: inter }}>Search for someone to chat with</p>
                <button onClick={onSearchClick} style={{ padding: "12px 28px", background: C.primary, color: C.accent, border: "none", borderRadius: 100, fontSize: 14, fontWeight: 700, fontFamily: inter, cursor: "pointer" }}>
                    Find someone →
                </button>
            </div>
        </div>
    );
}

// ─── CHAT WINDOW ──────────────────────────────────────────────
import { getMessages } from "../services/messages";

function ChatWindow({ convoId, sendWs, wsRef, onMessageSent }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [myUserId, setMyUserId] = useState(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                setMyUserId(payload.userId);
            } catch (e) {}
        }
    }, []);

    useEffect(() => {
        if (!convoId) return;
        loadMessages();
    }, [convoId]);

    useEffect(() => {
        if (!wsRef?.current) return;
        const original = wsRef.current.onmessage;
        wsRef.current.onmessage = (e) => {
            if (original) original(e);
            const packet = JSON.parse(e.data);
            if (packet.type === "RECEIVE_MESSAGE" && packet.payload.conversationId === convoId) {
                setMessages(prev => [...prev, {
                    messageId: packet.payload.messageId,
                    senderId: packet.payload.senderId,
                    content: packet.payload.content,
                    sentAt: packet.payload.timestamp,
                    isDeleted: false,
                }]);
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
            }
        };
    }, [convoId, wsRef]);

    const loadMessages = async () => {
        try {
            const res = await getMessages(convoId);
            setMessages(res.data);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "instant" }), 50);
        } catch (e) { console.error(e); }
    };

    const handleSend = () => {
        if (!input.trim()) return;
        sendWs({ type: "SEND_MESSAGE", payload: { conversationId: convoId, content: input.trim() } });
        setInput("");
        onMessageSent();
    };

    const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                {messages.map((msg) => {
                    const isOwn = msg.senderId === myUserId;
                    return (
                        <div key={msg.messageId} style={{ display: "flex", justifyContent: isOwn ? "flex-end" : "flex-start" }}>
                            <div style={{
                                maxWidth: "65%",
                                padding: "10px 16px",
                                borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                background: isOwn ? C.primary : C.white,
                                color: isOwn ? C.accent : C.primary,
                                fontSize: 14, lineHeight: 1.5, fontFamily: inter,
                                border: isOwn ? "none" : `1.5px solid ${C.border}`,
                                boxShadow: "0 1px 4px rgba(30,58,43,0.06)",
                            }}>
                                {msg.isDeleted
                                    ? <span style={{ opacity: 0.5, fontStyle: "italic" }}>This message was deleted</span>
                                    : msg.content
                                }
                                <div style={{ fontSize: 10, opacity: 0.5, marginTop: 4, textAlign: "right", fontFamily: inter }}>
                                    {formatTime(msg.sentAt)}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "12px 20px 16px", borderTop: `1.5px solid ${C.border}`, display: "flex", gap: 10, alignItems: "center" }}>
                <input
                    className="msg-input"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button className="send-btn" onClick={handleSend}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

// ─── SEARCH PANEL ─────────────────────────────────────────────
import { searchUsers, sendRequest } from "../services/friendship";
import { createConversation } from "../services/messages";

function SearchPanel({ onClose, onStartChat }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState({});

    useEffect(() => {
        if (!query.trim()) { setResults([]); return; }
        const t = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await searchUsers(query);
                setResults(res.data);
            } catch (e) {}
            finally { setLoading(false); }
        }, 300);
        return () => clearTimeout(t);
    }, [query]);

    const handleMessage = async (userId) => {
        try {
            const res = await createConversation(userId);
            onStartChat(res.data);
        } catch (e) { console.error(e); }
    };

    const handleAddFriend = async (userId) => {
        try {
            await sendRequest(userId);
            setSent(s => ({ ...s, [userId]: true }));
        } catch (e) {}
    };

    return (
        <PanelWrapper title="Search people" onClose={onClose}>
            <div style={{ padding: "16px 24px", borderBottom: `1.5px solid ${C.border}` }}>
                <div style={{ position: "relative" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}>
                        <circle cx="11" cy="11" r="8" stroke={C.primary} strokeWidth="2" />
                        <path d="m21 21-4.35-4.35" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                        className="auth-input"
                        placeholder="Search by username..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{ paddingLeft: 40 }}
                        autoFocus
                    />
                </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
                {loading && <div style={{ textAlign: "center", padding: 24, color: "rgba(30,58,43,0.4)", fontSize: 13, fontFamily: inter }}>Searching...</div>}
                {!loading && query && results.length === 0 && (
                    <div style={{ textAlign: "center", padding: 24, color: "rgba(30,58,43,0.4)", fontSize: 13, fontFamily: inter }}>No users found</div>
                )}
                {results.map((user) => (
                    <div key={user.userId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderRadius: 14, marginBottom: 4 }}>
                        <Avatar name={user.username} pic={user.profilePic} size={44} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: C.primary, fontFamily: inter }}>{user.name || user.username}</div>
                            <div style={{ fontSize: 12, color: "rgba(30,58,43,0.5)", fontFamily: inter }}>@{user.username}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                            <button className="action-btn" onClick={() => handleMessage(user.userId)}
                                    style={{ background: C.primary, color: C.accent, borderColor: C.primary }}>
                                Message
                            </button>
                            <button className="action-btn" onClick={() => handleAddFriend(user.userId)}
                                    disabled={sent[user.userId]}
                                    style={{ background: sent[user.userId] ? "rgba(30,58,43,0.08)" : "transparent", color: C.primary, opacity: sent[user.userId] ? 0.6 : 1 }}>
                                {sent[user.userId] ? "Sent ✓" : "Add"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </PanelWrapper>
    );
}

// ─── FRIENDS PANEL ────────────────────────────────────────────
import { getFriends, getPending as getPendingFn, acceptRequest, rejectRequest, removeFriend } from "../services/friendship";

function FriendsPanel({ onClose, onAccept }) {
    const [tab, setTab] = useState("friends");
    const [friends, setFriends] = useState([]);
    const [pending, setPending] = useState([]);

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        try {
            const [f, p] = await Promise.all([getFriends(), getPendingFn()]);
            setFriends(f.data);
            setPending(p.data);
        } catch (e) {}
    };

    const handleAccept = async (senderId) => {
        try { await acceptRequest(senderId); loadAll(); onAccept(); } catch (e) {}
    };
    const handleReject = async (senderId) => {
        try { await rejectRequest(senderId); loadAll(); onAccept(); } catch (e) {}
    };
    const handleRemove = async (friendId) => {
        try { await removeFriend(friendId); loadAll(); } catch (e) {}
    };

    const TabBtn = ({ id, label, count }) => (
        <button onClick={() => setTab(id)} style={{
            padding: "8px 20px", borderRadius: 100, border: "none", cursor: "pointer", fontFamily: inter,
            fontSize: 13, fontWeight: 600, transition: "all 0.15s",
            background: tab === id ? C.primary : "transparent",
            color: tab === id ? C.accent : C.primary,
        }}>
            {label}{count > 0 && <span style={{ marginLeft: 6, background: C.accent, color: C.primary, borderRadius: 100, padding: "1px 6px", fontSize: 11 }}>{count}</span>}
        </button>
    );

    return (
        <PanelWrapper title="Friends" onClose={onClose}>
            <div style={{ padding: "12px 24px", borderBottom: `1.5px solid ${C.border}`, display: "flex", gap: 6 }}>
                <TabBtn id="friends" label="Friends" count={0} />
                <TabBtn id="pending" label="Requests" count={pending.length} />
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
                {tab === "friends" && (
                    friends.length === 0
                        ? <EmptyListNote text="No friends yet. Search for people to connect." />
                        : friends.map((f) => (
                            <div key={f.friendshipId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderRadius: 14, marginBottom: 4 }}>
                                <Avatar name={String(f.senderId)} size={44} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: C.primary, fontFamily: inter }}>
                                        User {f.senderId === f.receiverId ? f.senderId : (f.senderId)}
                                    </div>
                                </div>
                                <button className="action-btn" onClick={() => handleRemove(f.senderId)}
                                        style={{ background: "transparent", color: "rgba(30,58,43,0.5)", borderColor: "rgba(30,58,43,0.2)", fontSize: 12 }}>
                                    Remove
                                </button>
                            </div>
                        ))
                )}
                {tab === "pending" && (
                    pending.length === 0
                        ? <EmptyListNote text="No pending requests." />
                        : pending.map((p) => (
                            <div key={p.friendshipId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderRadius: 14, marginBottom: 4 }}>
                                <Avatar name={String(p.senderId)} size={44} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: C.primary, fontFamily: inter }}>User {p.senderId}</div>
                                    <div style={{ fontSize: 12, color: "rgba(30,58,43,0.5)", fontFamily: inter }}>Sent you a request</div>
                                </div>
                                <div style={{ display: "flex", gap: 6 }}>
                                    <button className="action-btn" onClick={() => handleAccept(p.senderId)}
                                            style={{ background: C.primary, color: C.accent, borderColor: C.primary }}>Accept</button>
                                    <button className="action-btn" onClick={() => handleReject(p.senderId)}
                                            style={{ background: "transparent", color: C.primary }}>Decline</button>
                                </div>
                            </div>
                        ))
                )}
            </div>
        </PanelWrapper>
    );
}

// ─── PROFILE PANEL ────────────────────────────────────────────
import { updateProfile, updatePrivacy } from "../services/profile";

const RELATIONSHIP_OPTIONS = [
    { value: "", label: "Prefer not to say" },
    { value: "SINGLE", label: "Single" },
    { value: "COMMITTED", label: "In a relationship" },
    { value: "MARRIED", label: "Married" },
    { value: "COMPLICATED", label: "It's complicated" },
];

function ProfilePanel({ onClose }) {
    const [form, setForm] = useState({ name: "", bio: "", profilePic: "", relationshipStatus: "", isPrivate: false });
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSave = async () => {
        setLoading(true); setError(""); setSaved(false);
        try {
            await updateProfile({ name: form.name, bio: form.bio || null, profilePic: form.profilePic || null, relationshipStatus: form.relationshipStatus || null });
            await updatePrivacy(form.isPrivate);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (e) {
            setError("Failed to save. Try again.");
        } finally { setLoading(false); }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    return (
        <PanelWrapper title="Your profile" onClose={onClose}>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                    {/* Avatar preview */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <Avatar name={form.name || "?"} pic={form.profilePic} size={64} />
                        <div>
                            <div style={{ fontFamily: faro, fontSize: 18, fontWeight: 900, color: C.primary }}>{form.name || "Your name"}</div>
                            <div style={{ fontSize: 13, color: "rgba(30,58,43,0.5)", fontFamily: inter }}>Edit your profile below</div>
                        </div>
                    </div>

                    <FormField label="Display name">
                        <input className="auth-input" name="name" placeholder="Your name" value={form.name} onChange={handleChange} />
                    </FormField>

                    <FormField label="Bio">
            <textarea className="auth-input" name="bio" placeholder="A short bio..." value={form.bio} onChange={handleChange}
                      rows={3} style={{ resize: "none", borderRadius: 14, lineHeight: 1.5 }} />
                    </FormField>

                    <FormField label="Profile picture URL">
                        <input className="auth-input" name="profilePic" placeholder="https://..." value={form.profilePic} onChange={handleChange} />
                    </FormField>

                    <FormField label="Relationship status">
                        <select className="auth-input" name="relationshipStatus" value={form.relationshipStatus} onChange={handleChange}
                                style={{ cursor: "pointer", appearance: "none" }}>
                            {RELATIONSHIP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </FormField>

                    {/* Private toggle */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(30,58,43,0.06)", borderRadius: 14, padding: "14px 16px" }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: C.primary, fontFamily: inter }}>Private account</div>
                            <div style={{ fontSize: 12, color: "rgba(30,58,43,0.5)", marginTop: 2, fontFamily: inter }}>Hide from search and friend lists</div>
                        </div>
                        <div onClick={() => setForm({ ...form, isPrivate: !form.isPrivate })}
                             style={{ width: 46, height: 24, borderRadius: 100, border: `2px solid ${C.primary}`, cursor: "pointer", display: "flex", alignItems: "center", padding: 2, background: form.isPrivate ? C.primary : "transparent", transition: "background 0.2s" }}>
                            <div style={{ width: 16, height: 16, borderRadius: "50%", background: form.isPrivate ? C.accent : C.primary, transition: "transform 0.2s", transform: form.isPrivate ? "translateX(22px)" : "translateX(0)" }} />
                        </div>
                    </div>

                    {error && <div style={{ background: "rgba(30,58,43,0.08)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.primary, fontFamily: inter }}>{error}</div>}
                    {saved && <div style={{ background: "rgba(239,248,122,0.5)", border: `1.5px solid ${C.primary}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.primary, fontFamily: inter, fontWeight: 600 }}>✓ Profile saved</div>}

                    <div style={{ display: "flex", gap: 10 }}>
                        <button className="save-btn" onClick={handleSave} disabled={loading} style={{ flex: 1 }}>
                            {loading ? "Saving..." : "Save changes"}
                        </button>
                        <button onClick={handleLogout} style={{ padding: "12px 20px", background: "transparent", color: "rgba(30,58,43,0.5)", border: `1.5px solid rgba(30,58,43,0.2)`, borderRadius: 100, fontSize: 13, fontWeight: 600, fontFamily: inter, cursor: "pointer" }}>
                            Log out
                        </button>
                    </div>
                </div>
            </div>
        </PanelWrapper>
    );
}

// ─── SHARED HELPERS ───────────────────────────────────────────
function PanelWrapper({ title, onClose, children }) {
    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ padding: "18px 24px", borderBottom: `1.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <span style={{ fontFamily: faro, fontSize: 20, fontWeight: 900, color: C.primary, letterSpacing: "-0.5px" }}>{title}</span>
                <button className="icon-btn" onClick={onClose}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6 6 18M6 6l12 12" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>
            </div>
            {children}
        </div>
    );
}

function FormField({ label, children }) {
    return (
        <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.primary, display: "block", marginBottom: 6, fontFamily: inter }}>{label}</label>
            {children}
        </div>
    );
}

function EmptyListNote({ text }) {
    return <div style={{ textAlign: "center", padding: "32px 16px", color: "rgba(30,58,43,0.4)", fontSize: 13, fontFamily: inter }}>{text}</div>;
}

function formatTime(ts) {
    if (!ts) return "";
    try {
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
}