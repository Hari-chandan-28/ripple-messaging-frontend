import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatIcon from "../assets/icons/chat.svg?react";
import GroupIcon from "../assets/icons/group.svg?react";
import LockIcon from "../assets/icons/privacy.svg?react";
import FriendsIcon from "../assets/icons/connection.svg?react";
import SearchIcon from "../assets/icons/search.svg?react";
import MessageIcon from "../assets/icons/message.svg?react";
import Logo from "../assets/icons/logo.svg?react";

const colors = {
    bg: "#f8f4f0",
    primary: "#1e3a2b",
    accent: "#eff87a",
    lavender: "#cfdcff",
    white: "#ffffff",
};

const faro = "'Faro', sans-serif";
const inter = "'Inter', sans-serif";

const features = [
    { icon: ChatIcon, title: "Real-time messaging", desc: "Instant delivery via WebSocket. Your messages arrive the moment you send them, no polling, no delays.", bg: colors.accent },
    { icon: GroupIcon, title: "Groups & roles", desc: "Create groups, manage members, assign admin roles. Full control over who can do what.", bg: colors.lavender },
    { icon: LockIcon, title: "Privacy controls", desc: "Go private anytime. Control who can find you, view your profile, or see your friends list.", bg: colors.white },
    { icon: FriendsIcon, title: "Friend connections", desc: "Send requests, accept connections, remove friends. Your social graph, your rules.", bg: colors.white },
    { icon: SearchIcon, title: "Smart search", desc: "Find anyone by username with typeahead search. Results update as you type.", bg: colors.accent },
    { icon: MessageIcon, title: "Message control", desc: "Edit sent messages, delete for yourself or everyone. Full control over your words.", bg: colors.lavender },
];

const tech = [
    { label: "Language", name: "Kotlin", desc: "Concise, expressive, null-safe" },
    { label: "Framework", name: "Spring Boot", desc: "Production-grade backend" },
    { label: "Database", name: "MySQL", desc: "Relational data with Liquibase migrations" },
    { label: "Real-time", name: "WebSocket", desc: "Custom JSON protocol, no STOMP" },
    { label: "Auth", name: "JWT", desc: "Stateless Bearer token auth" },
    { label: "ORM", name: "Hibernate", desc: "JPA with Spring Data repositories" },
    { label: "Migrations", name: "Liquibase", desc: "Version-controlled schema" },
    { label: "Build", name: "Gradle", desc: "Kotlin DSL build scripts" },
];

const faqs = [
    { q: "Is Ripple open source?", a: "Yes — the full backend is available on GitHub. Built with Spring Boot and Kotlin, fully documented with a REST API and WebSocket protocol spec." },
    { q: "How does real-time messaging work?", a: "Ripple uses raw WebSocket connections with a custom JSON message protocol. No STOMP, no third-party messaging middleware — just a clean, hand-rolled protocol with typed message envelopes." },
    { q: "What happens when I'm offline?", a: "Every message is saved to the database before being pushed via WebSocket. When you come back online, your full message history loads from the server automatically." },
    { q: "Can I control who sees my profile?", a: "Yes. Set your account to private and you disappear from search results and friend lists. Only people you're already connected with can still see you." },
];

// ─── CHANGE 1: SVG sketchy components ────────────────────────────────────────
// Added throughout the page for hand-drawn retro feel
const Swoosh = ({ color = colors.accent, style = {} }) => (
    <svg viewBox="0 0 200 50" fill="none" style={{ position: "absolute", pointerEvents: "none", ...style }}>
        <path d="M 8 35 Q 60 8 120 28 Q 160 42 192 18" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
);

const CurlyLine = ({ color = colors.accent, style = {} }) => (
    <svg viewBox="0 0 60 200" fill="none" style={{ position: "absolute", pointerEvents: "none", ...style }}>
        <path d="M 30 8 Q 55 45 22 78 Q -5 108 30 138 Q 62 168 30 195" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
);

const SketchUnderline = ({ color = colors.lavender, style = {} }) => (
    <svg viewBox="0 0 300 18" fill="none" style={{ position: "absolute", pointerEvents: "none", ...style }}>
        <path d="M 4 12 Q 80 4 150 11 Q 220 18 296 8" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
);

const SketchCircle = ({ color = colors.lavender, style = {} }) => (
    <svg viewBox="0 0 140 80" fill="none" style={{ position: "absolute", pointerEvents: "none", ...style }}>
        <ellipse cx="70" cy="40" rx="64" ry="32" stroke={color} strokeWidth="3" strokeDasharray="7 4" />
    </svg>
);

const Scribble = ({ color = colors.primary, style = {} }) => (
    <svg viewBox="0 0 100 60" fill="none" style={{ position: "absolute", pointerEvents: "none", ...style }}>
        <path d="M 5 40 Q 25 10 50 35 Q 75 58 95 28" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.18" />
        <path d="M 10 50 Q 35 20 60 44 Q 82 62 98 38" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.1" />
    </svg>
);

const ArrowSketch = ({ color = colors.primary, style = {} }) => (
    <svg viewBox="0 0 80 80" fill="none" style={{ position: "absolute", pointerEvents: "none", ...style }}>
        <path d="M 20 20 Q 50 10 60 50" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.25" />
        <path d="M 52 46 L 60 50 L 56 42" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.25" />
    </svg>
);

const GlobalStyles = () => (
    <style>{`
    .ripple-btn-primary {
      background: ${colors.primary};
      color: ${colors.accent};
      padding: 10px 24px;
      border-radius: 100px;
      font-size: 14px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      font-family: ${inter};
      transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    }
    .ripple-btn-primary:hover {
      background: #2d5540;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(30,58,43,0.25);
    }
    .ripple-btn-secondary {
      background: transparent;
      color: ${colors.primary};
      padding: 10px 24px;
      border-radius: 100px;
      font-size: 14px;
      font-weight: 600;
      border: 2px solid ${colors.primary};
      cursor: pointer;
      font-family: ${inter};
      transition: background 0.2s, transform 0.15s;
    }
    .ripple-btn-secondary:hover {
      background: ${colors.primary};
      color: ${colors.accent};
      transform: translateY(-2px);
    }
    .ripple-btn-hero-primary {
      background: ${colors.primary};
      color: ${colors.accent};
      padding: 14px 32px;
      border-radius: 100px;
      font-size: 16px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      font-family: ${inter};
      transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    }
    .ripple-btn-hero-primary:hover {
      background: #2d5540;
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(30,58,43,0.3);
    }
    .ripple-btn-hero-secondary {
      background: transparent;
      color: ${colors.primary};
      padding: 14px 32px;
      border-radius: 100px;
      font-size: 16px;
      font-weight: 600;
      border: 2px solid ${colors.primary};
      cursor: pointer;
      font-family: ${inter};
      transition: background 0.2s, transform 0.15s;
    }
    .ripple-btn-hero-secondary:hover {
      background: ${colors.primary};
      color: ${colors.accent};
      transform: translateY(-3px);
    }
    .ripple-btn-cta {
      background: ${colors.primary};
      color: ${colors.accent};
      padding: 16px 48px;
      border-radius: 100px;
      font-size: 18px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      font-family: ${inter};
      transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    }
    .ripple-btn-cta:hover {
      background: #2d5540;
      transform: translateY(-3px);
      box-shadow: 0 10px 28px rgba(30,58,43,0.35);
    }
    .feature-card {
      border: 2px solid ${colors.primary};
      border-radius: 20px;
      padding: 32px;
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: default;
    }
    .feature-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 32px rgba(30,58,43,0.15);
    }
    .tech-card {
      background: #fff;
      border-radius: 28px;
      padding: 28px;
      box-shadow: 0 18px 40px rgba(0,0,0,.10);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .tech-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 24px 48px rgba(0,0,0,.18);
    }
    .faq-item {
      padding: 20px 0;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .faq-item:hover {
      opacity: 0.75;
    }
    @keyframes marquee {
      from { transform: translateX(0); }
      to { transform: translateX(-33.33%); }
    }
  `}</style>
);

export default function LandingPage() {
    const [openFaq, setOpenFaq] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

    return (
        <div style={{ background: colors.bg, fontFamily: inter, color: colors.primary, minHeight: "100vh", overflowX: "hidden" }}>
            <GlobalStyles />

            {/* NAV */}
            <nav style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "20px 48px", borderBottom: `2px solid ${colors.primary}`,
                background: colors.bg, position: "sticky", top: 0, zIndex: 100,
                boxShadow: scrolled ? "0 2px 20px rgba(30,58,43,0.08)" : "none",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Logo style={{ height: "34px", width: "auto", color: colors.primary, display: "block" }} />
                    <span style={{ fontSize: 22, fontWeight: 900, fontFamily: faro, letterSpacing: "-0.5px", color: colors.primary }}>Ripple^</span>
                </div>

                <ul style={{ display: "flex", gap: 32, listStyle: "none", margin: 0, padding: 0 }}>
                    {[["Features", "features"], ["Tech Stack", "tech"], ["FAQ", "faq"]].map(([label, id]) => (
                        <li key={id}>
                            <span onClick={() => scrollTo(id)} style={{ color: colors.primary, fontSize: 15, fontWeight: 500, cursor: "pointer" }}>{label}</span>
                        </li>
                    ))}
                </ul>

                <div style={{ display: "flex", gap: 12 }}>
                    {/* CHANGE 3: Hover classes on all nav buttons */}
                    <button onClick={() => navigate("/login")} className="ripple-btn-secondary">Log in</button>
                    <button onClick={() => navigate("/signup")} className="ripple-btn-primary" style={{ background: colors.lavender, color: colors.primary, border: "none" }}>Get started</button>
                </div>
            </nav>

            {/* HERO */}
            <section style={{ borderBottom: `2px solid ${colors.primary}`, position: "relative", overflow: "hidden" }}>
                {/* CHANGE 4: SVG decorations in hero */}
                <Swoosh color={colors.accent} style={{ width: 220, top: 30, left: -10, opacity: 0.9 }} />
                <CurlyLine color={colors.accent} style={{ width: 55, top: 10, right: 60, opacity: 0.7 }} />
                <Scribble color={colors.primary} style={{ width: 100, bottom: 30, right: 20, opacity: 1 }} />

                <div style={{
                    padding: "100px 48px 80px", maxWidth: 1100, margin: "0 auto",
                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center",
                    position: "relative",
                }}>
                    <div>
            <span style={{
                display: "inline-block", background: colors.lavender, color: colors.primary,
                padding: "6px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600,
                marginBottom: 20, border: `1.5px solid ${colors.primary}`,
            }}>✦ Real-time messaging</span>

                        {/* CHANGE 5: SVG underline under "instant." */}
                        <h1 style={{ fontFamily: faro, fontSize: 68, lineHeight: 1.05, fontWeight: 900, margin: "0 0 24px", letterSpacing: "-2px" }}>
                            Chat that feels{" "}
                            <span style={{ position: "relative", display: "inline-block" }}>
                <span style={{ background: colors.accent, borderRadius: 8, padding: "0 8px" }}>instant.</span>
              </span>
                            {" "}Always.
                        </h1>

                        <p style={{ fontSize: 18, lineHeight: 1.7, color: "#3a5c48", margin: "0 0 40px", maxWidth: 480, fontFamily: inter }}>
                            Ripple is a full-featured messaging app built from scratch — real-time WebSocket delivery, friend connections, group chats, and full privacy controls.
                        </p>

                        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                            <button onClick={() => navigate("/signup")} className="ripple-btn-hero-primary">Create account</button>
                            <button onClick={() => scrollTo("features")} className="ripple-btn-hero-secondary">See features</button>
                        </div>
                    </div>

                    {/* CHAT MOCKUP */}
                    <div style={{ background: colors.primary, borderRadius: 24, padding: 32, border: `3px solid ${colors.primary}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
                            <div style={{ width: 40, height: 40, borderRadius: "50%", background: colors.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: colors.primary, flexShrink: 0 }}>AJ</div>
                            <div>
                                <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>Arjun</div>
                                <div style={{ color: colors.accent, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                                    Online now
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {[
                                { text: "Hey! Did you see the new update?", own: false },
                                { text: "Just checked it out — looks great 🔥", own: true },
                                { text: "Want to jump on a call later?", own: false },
                                { text: "For sure, ping me after 5!", own: true },
                            ].map((m, i) => (
                                <div key={i} style={{
                                    background: m.own ? colors.accent : "rgba(255,255,255,0.12)",
                                    color: m.own ? colors.primary : "#fff",
                                    padding: "10px 16px",
                                    borderRadius: m.own ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                    fontSize: 14, maxWidth: "75%",
                                    alignSelf: m.own ? "flex-end" : "flex-start",
                                    lineHeight: 1.5,
                                }}>{m.text}</div>
                            ))}
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 16, background: "rgba(255,255,255,0.08)", borderRadius: 100, padding: "10px 16px", alignItems: "center" }}>
                            <span style={{ flex: 1, color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Type a message...</span>
                            <div style={{ background: colors.accent, borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: colors.primary, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>↑</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── CHANGE 6: NEW SECTION — SVG showcase strip between hero and features ─── */}
            <section style={{
                padding: "80px 48px",
                borderBottom: `2px solid ${colors.primary}`,
                position: "relative",
                overflow: "hidden",
                background: colors.bg,
            }}>
                {/* Background sketch decorations */}
                <CurlyLine color={colors.accent} style={{ width: 70, top: -10, left: 30, opacity: 0.6 }} />
                <Swoosh color={colors.lavender} style={{ width: 280, bottom: 10, right: -20, opacity: 0.8 }} />
                <ArrowSketch color={colors.primary} style={{ width: 70, top: 20, right: 200, opacity: 1 }} />
                <Scribble color={colors.primary} style={{ width: 110, bottom: 10, left: 200, opacity: 1 }} />

                <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center", position: "relative" }}>

                    {/* Circled word */}
                    <div style={{ marginBottom: 48 }}>
            <span style={{
                fontFamily: faro, fontSize: 52, fontWeight: 900, letterSpacing: "-1.5px",
                position: "relative", display: "inline-block",
            }}>
              Why{" "}
                <span style={{ position: "relative", display: "inline-block" }}>
                Ripple?
                <SketchCircle color={colors.lavender} style={{ width: "120%", height: "180%", top: "-40%", left: "-10%" }} />
              </span>
            </span>
                    </div>

                    {/* Three stat boxes with sketch underlines */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
                        {[
                            { number: "9", unit: "tables", label: "Designed before writing a single line of code" },
                            { number: "0", unit: "shortcuts", label: "No STOMP, no magic abstractions, no tutorial copy-paste" },
                            { number: "100%", unit: "custom", label: "WebSocket protocol designed and built from scratch" },
                        ].map((s, i) => (
                            <div key={i} style={{ textAlign: "center", position: "relative", padding: "24px 16px" }}>
                                {/* sketch underline under each stat */}
                                <div style={{ position: "relative", display: "inline-block", marginBottom: 8 }}>
                                    <span style={{ fontFamily: faro, fontSize: 64, fontWeight: 900, letterSpacing: "-2px", lineHeight: 1 }}>{s.number}</span>
                                    <span style={{ fontFamily: faro, fontSize: 22, fontWeight: 700, marginLeft: 6, color: "#3a5c48" }}>{s.unit}</span>
                                    <SketchUnderline color={i === 1 ? colors.accent : colors.lavender} style={{ width: "100%", bottom: -6, left: 0 }} />
                                </div>
                                <p style={{ fontFamily: inter, fontSize: 15, color: "#3a5c48", lineHeight: 1.6, margin: "16px 0 0", maxWidth: 220, marginLeft: "auto", marginRight: "auto" }}>{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Sketchy divider line in the middle */}
                    <div style={{ margin: "56px 0 0", position: "relative", height: 40 }}>
                        <svg viewBox="0 0 900 40" fill="none" style={{ width: "100%", height: 40 }}>
                            <path d="M 10 20 Q 150 8 300 22 Q 450 36 600 18 Q 750 4 890 22"
                                  stroke={colors.primary} strokeWidth="2.5" strokeLinecap="round" opacity="0.2" />
                            <path d="M 10 28 Q 200 18 400 28 Q 600 38 890 24"
                                  stroke={colors.accent} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
                        </svg>
                    </div>
                </div>
            </section>
            {/* ─────────────────────────────────────────────────────────────────────── */}

            {/* FEATURES */}
            <section id="features" style={{ padding: "80px 48px", maxWidth: 1100, margin: "0 auto", position: "relative" }}>
                {/* CHANGE 7: SVG decorations in features */}
                <Swoosh color={colors.accent} style={{ width: 180, top: 20, right: 0, opacity: 0.6 }} />

                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#3a5c48", marginBottom: 16 }}>Features</div>
                <h2 style={{ fontFamily: faro, fontSize: 52, fontWeight: 900, letterSpacing: "-1.5px", margin: "0 0 16px", lineHeight: 1.05 }}>
                    Everything you need to connect.
                </h2>
                <p style={{ fontSize: 17, color: "#3a5c48", lineHeight: 1.7, maxWidth: 560, margin: "0 0 56px", fontFamily: inter }}>
                    Built with real architecture decisions — not a tutorial clone. Every feature was designed before a single line of code was written.
                </p>

                {/* CHANGE 8: feature-card class for hover effect */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
                    {features.map((f) => {
                        const Icon = f.icon;
                        return (
                            <div key={f.title} className="feature-card" style={{ background: f.bg }}>
                                <div style={{ marginBottom: 18, color: "#3a5c48" }}>
                                    <Icon style={{ width: 34, height: 34 }} />
                                </div>
                                <h3 style={{ fontFamily: faro, fontSize: 22, fontWeight: 700, margin: "0 0 10px" }}>{f.title}</h3>
                                <p style={{ fontSize: 15, lineHeight: 1.6, color: "#3a5c48", margin: 0, fontFamily: inter }}>{f.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            <div style={{ borderTop: `2px solid ${colors.primary}`, margin: "0 48px" }} />

            {/* TECH STACK */}
            <section id="tech" style={{ background: colors.bg, padding: "100px 48px 25px", position: "relative" }}>
                {/* CHANGE 9: SVG in tech section */}
                <CurlyLine color={colors.accent} style={{ width: 50, top: 30, right: 80, opacity: 0.5 }} />

                <div style={{ maxWidth: 1200, margin: "0 auto", background: colors.primary, borderRadius: "48px", padding: "70px", boxShadow: "0 20px 60px rgba(0,0,0,.12)", position: "relative", overflow: "hidden" }}>
                    {/* SVG inside dark card */}
                    <Swoosh color="rgba(239,248,122,0.15)" style={{ width: 300, top: 20, right: -20 }} />
                    <Scribble color="rgba(239,248,122,0.2)" style={{ width: 120, bottom: 20, left: 20, opacity: 1 }} />

                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,.5)", marginBottom: 18, fontFamily: inter }}>Built With</div>
                    <h2 style={{ fontFamily: faro, fontSize: 54, fontWeight: 900, color: "#fff", marginBottom: 20, lineHeight: 1.05 }}>Production-grade stack.</h2>
                    <p style={{ fontSize: 18, color: "rgba(255,255,255,.65)", maxWidth: 650, lineHeight: 1.8, marginBottom: 60, fontFamily: inter }}>
                        Every technology choice was intentional. Reliable, scalable and built for real-world applications.
                    </p>

                    {/* CHANGE 10: tech-card hover class + CHANGE 11: fixed plus icon centering */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "24px" }}>
                        {tech.map((t) => (
                            <div key={t.name} className="tech-card">
                                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "18px" }}>
                                    {/* CHANGE 11: Fixed plus icon — using flexbox centering properly */}
                                    <div style={{
                                        width: 38, height: 38, borderRadius: "50%",
                                        background: "#CBD7FF",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        flexShrink: 0,
                                        lineHeight: 1,
                                    }}>
                    <span style={{
                        color: colors.primary,
                        fontSize: 20,
                        fontWeight: 900,
                        display: "block",
                        lineHeight: 1,
                        marginTop: 0,
                    }}>+</span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#68806F", fontFamily: inter }}>{t.label}</div>
                                        <h3 style={{ margin: "4px 0 0", fontFamily: faro, fontSize: 24, fontWeight: 900, color: colors.primary }}>{t.name}</h3>
                                    </div>
                                </div>
                                <p style={{ margin: 0, fontSize: 15, color: "#5B6B62", lineHeight: 1.7, fontFamily: inter }}>{t.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" style={{ padding: "80px 48px", maxWidth: 1100, margin: "0 auto", position: "relative" }}>
                {/* CHANGE 12: SVG in FAQ */}
                <ArrowSketch color={colors.primary} style={{ width: 60, top: 30, right: 40, opacity: 1 }} />

                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#3a5c48", marginBottom: 16 }}>FAQ</div>
                <h2 style={{ fontFamily: faro, fontSize: 52, fontWeight: 900, letterSpacing: "-1.5px", margin: "0 0 48px", lineHeight: 1.05, position: "relative", display: "inline-block" }}>
                    Common questions.
                    <SketchUnderline color={colors.lavender} style={{ width: "100%", bottom: -8, left: 0 }} />
                </h2>
                <div style={{ borderTop: `1.5px solid ${colors.primary}` }}>
                    {faqs.map((faq, i) => (
                        <div key={i} className="faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ borderBottom: `1.5px solid ${colors.primary}` }}>
                            <div style={{ fontFamily: faro, fontSize: 18, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                {faq.q}
                                <span style={{ fontSize: 28, fontWeight: 300, transition: "transform 0.2s", display: "inline-block", transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
                            </div>
                            {openFaq === i && <p style={{ fontSize: 16, color: "#3a5c48", lineHeight: 1.7, marginTop: 16, fontFamily: inter }}>{faq.a}</p>}
                        </div>
                    ))}
                </div>
            </section>

            <div style={{ borderTop: `2px solid ${colors.primary}`, margin: "0 48px" }} />

            {/* CTA */}
            <section style={{ background: colors.accent, padding: "80px 48px", textAlign: "center", borderBottom: `2px solid ${colors.primary}`, position: "relative", overflow: "hidden" }}>
                {/* CHANGE 13: SVG in CTA */}
                <Swoosh color="rgba(30,58,43,0.12)" style={{ width: 300, top: 10, left: -20 }} />
                <CurlyLine color="rgba(30,58,43,0.12)" style={{ width: 55, top: 10, right: 40 }} />

                <h2 style={{ fontFamily: faro, fontSize: 60, fontWeight: 900, color: colors.primary, margin: "0 0 20px", letterSpacing: "-2px", lineHeight: 1.05, position: "relative" }}>
                    Ready to start chatting?
                </h2>
                <p style={{ fontSize: 18, color: "#3a5c48", margin: "0 0 40px", fontFamily: inter, position: "relative" }}>
                    Create your account in seconds. No credit card required.
                </p>
                <button onClick={() => navigate("/signup")} className="ripple-btn-cta" style={{ position: "relative" }}>
                    Create free account
                </button>
            </section>

            {/* FOOTER */}
            <footer style={{ background: colors.bg, padding: "70px 48px" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", background: "#CBD7FF", borderRadius: "36px", padding: "36px 48px", boxShadow: "0 18px 45px rgba(0,0,0,0.08)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "20px" }}>
                        <div>
                            <p style={{ margin: 0, color: "#42554A", fontSize: "15px", fontFamily: inter }}>Built with Spring Boot + Kotlin + WebSocket</p>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <span style={{ fontFamily: faro, fontSize: "36px", fontWeight: 900, color: colors.primary, letterSpacing: "-1px" }}>Ripple^</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <p style={{ margin: 0, color: "#42554A", fontSize: "15px", fontFamily: inter }}>© 2026 Ripple</p>
                        </div>
                    </div>
                    <div style={{ height: "1px", background: "rgba(32,53,45,0.15)", margin: "28px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                        <p style={{ margin: 0, color: "#42554A", fontSize: "14px", fontFamily: inter }}>Secure, real-time messaging built for modern conversations.</p>
                        <div style={{ display: "flex", gap: "24px" }}>
                            {[["Features", "#features"], ["Tech Stack", "#tech"], ["FAQ", "#faq"], ["Get Started", "/signup"]].map(([label, href]) => (
                                <a key={label} href={href} style={{ textDecoration: "none", color: colors.primary, fontFamily: inter, fontWeight: 600 }}>{label}</a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
