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
    {
        icon: ChatIcon,
        title: "Real-time messaging",
        desc: "Instant delivery via WebSocket. Your messages arrive the moment you send them, no polling, no delays.",
        bg: colors.accent,
    },
    {
        icon: GroupIcon,
        title: "Groups & roles",
        desc: "Create groups, manage members, assign admin roles. Full control over who can do what.",
        bg: colors.lavender,
    },
    {
        icon: LockIcon,
        title: "Privacy controls",
        desc: "Go private anytime. Control who can find you, view your profile, or see your friends list.",
        bg: colors.white,
    },
    {
        icon: FriendsIcon,
        title: "Friend connections",
        desc: "Send requests, accept connections, remove friends. Your social graph, your rules.",
        bg: colors.white,
    },
    {
        icon: SearchIcon,
        title: "Smart search",
        desc: "Find anyone by username with typeahead search. Results update as you type.",
        bg: colors.accent,
    },
    {
        icon: MessageIcon,
        title: "Message control",
        desc: "Edit sent messages, delete for yourself or everyone. Full control over your words.",
        bg: colors.lavender,
    },
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
    {
        q: "Is Ripple open source?",
        a: "Yes — the full backend is available on GitHub. Built with Spring Boot and Kotlin, fully documented with a REST API and WebSocket protocol spec.",
    },
    {
        q: "How does real-time messaging work?",
        a: "Ripple uses raw WebSocket connections with a custom JSON message protocol. No STOMP, no third-party messaging middleware — just a clean, hand-rolled protocol with typed message envelopes.",
    },
    {
        q: "What happens when I'm offline?",
        a: "Every message is saved to the database before being pushed via WebSocket. When you come back online, your full message history loads from the server automatically.",
    },
    {
        q: "Can I control who sees my profile?",
        a: "Yes. Set your account to private and you disappear from search results and friend lists. Only people you're already connected with can still see you.",
    },
];

export default function LandingPage() {
    const [openFaq, setOpenFaq] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div style={{ background: colors.bg, fontFamily: inter, color: colors.primary, minHeight: "100vh", overflowX: "hidden" }}>

            {/* NAV */}
            <nav
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px 48px",
                    borderBottom: `2px solid ${colors.primary}`,
                    background: colors.bg,
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    boxShadow: scrolled
                        ? "0 2px 20px rgba(30,58,43,0.08)"
                        : "none",
                }}
            >
                {/* Left */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                    }}
                >
                    <Logo
                        style={{
                            height: "34px",
                            width: "auto",
                            color: colors.primary,
                            display: "block",
                        }}
                    />

                    <span
                        style={{
                            fontSize: 22,
                            fontWeight: 900,
                            fontFamily: faro,
                            letterSpacing: "-0.5px",
                            color: colors.primary,
                        }}
                    >
            Ripple^
        </span>
                </div>

                {/* Center */}
                <ul
                    style={{
                        display: "flex",
                        gap: 32,
                        listStyle: "none",
                        margin: 0,
                        padding: 0,
                    }}
                >
                    {[
                        ["Features", "features"],
                        ["Tech Stack", "tech"],
                        ["FAQ", "faq"],
                    ].map(([label, id]) => (
                        <li key={id}>
                <span
                    onClick={() => scrollTo(id)}
                    style={{
                        color: colors.primary,
                        fontSize: 15,
                        fontWeight: 500,
                        cursor: "pointer",
                    }}
                >
                    {label}
                </span>
                        </li>
                    ))}
                </ul>

                {/* Right */}
                <div
                    style={{
                        display: "flex",
                        gap: 12,
                    }}
                >
                    <button
                        onClick={() => navigate("/login")}
                        style={{
                            background: "transparent",
                            color: colors.primary,
                            padding: "10px 24px",
                            borderRadius: 100,
                            fontSize: 14,
                            fontWeight: 600,
                            border: `2px solid ${colors.primary}`,
                            cursor: "pointer",
                        }}
                    >
                        Log in
                    </button>

                    <button
                        onClick={() => navigate("/signup")}
                        style={{
                            background: colors.lavender,
                            color: colors.primary,
                            padding: "10px 24px",
                            borderRadius: 100,
                            fontSize: 14,
                            fontWeight: 600,
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        Get started
                    </button>
                </div>
            </nav>

            {/* HERO */}
            <section style={{ borderBottom: `2px solid ${colors.primary}` }}>
                <div style={{
                    padding: "100px 48px 80px", maxWidth: 1100, margin: "0 auto",
                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center",
                }}>
                    <div>
            <span style={{
                display: "inline-block", background: colors.lavender, color: colors.primary,
                padding: "6px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600,
                marginBottom: 20, border: `1.5px solid ${colors.primary}`,
            }}>✦ Real-time messaging</span>

                        <h1 style={{
                            fontFamily: faro, fontSize: 68, lineHeight: 1.05, fontWeight: 900,
                            margin: "0 0 24px", letterSpacing: "-2px",
                        }}>
                            Chat that feels{" "}
                            <span style={{ background: colors.accent, borderRadius: 8, padding: "0 8px" }}>instant.</span>
                            {" "}Always.
                        </h1>

                        <p style={{ fontSize: 18, lineHeight: 1.7, color: "#3a5c48", margin: "0 0 40px", maxWidth: 480, fontFamily: inter }}>
                            Ripple is a full-featured messaging app built from scratch — real-time WebSocket delivery, friend connections, group chats, and full privacy controls.
                        </p>

                        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                            <button onClick={() => navigate("/signup")} style={{
                                background: colors.primary, color: colors.accent, padding: "14px 32px",
                                borderRadius: 100, fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: inter,
                            }}>Create account</button>
                            <button onClick={() => scrollTo("features")} style={{
                                background: "transparent", color: colors.primary, padding: "14px 32px",
                                borderRadius: 100, fontSize: 16, fontWeight: 600, border: `2px solid ${colors.primary}`, cursor: "pointer", fontFamily: inter,
                            }}>See features</button>
                        </div>
                    </div>

                    {/* CHAT MOCKUP */}
                    <div style={{ background: colors.primary, borderRadius: 24, padding: 32, border: `3px solid ${colors.primary}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: "50%", background: colors.accent,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 14, fontWeight: 700, color: colors.primary, flexShrink: 0,
                            }}>AJ</div>
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

                        <div style={{
                            display: "flex", gap: 8, marginTop: 16,
                            background: "rgba(255,255,255,0.08)", borderRadius: 100, padding: "10px 16px", alignItems: "center",
                        }}>
                            <span style={{ flex: 1, color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Type a message...</span>
                            <div style={{
                                background: colors.accent, borderRadius: "50%", width: 32, height: 32,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: colors.primary, fontWeight: 700, fontSize: 16, cursor: "pointer",
                            }}>↑</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section
                id="features"
                style={{
                    padding: "80px 48px",
                    maxWidth: 1100,
                    margin: "0 auto",
                }}
            >
                <div
                    style={{
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        color: "#3a5c48",
                        marginBottom: 16,
                    }}
                >
                    Features
                </div>

                <h2
                    style={{
                        fontFamily: faro,
                        fontSize: 52,
                        fontWeight: 900,
                        letterSpacing: "-1.5px",
                        margin: "0 0 16px",
                        lineHeight: 1.05,
                    }}
                >
                    Everything you need to connect.
                </h2>

                <p
                    style={{
                        fontSize: 17,
                        color: "#3a5c48",
                        lineHeight: 1.7,
                        maxWidth: 560,
                        margin: "0 0 56px",
                        fontFamily: inter,
                    }}
                >
                    Built with real architecture decisions — not a tutorial clone.
                    Every feature was designed before a single line of code was written.
                </p>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 24,
                    }}
                >
                    {features.map((f) => {
                        const Icon = f.icon;

                        return (
                            <div
                                key={f.title}
                                style={{
                                    background: f.bg,
                                    border: `2px solid ${colors.primary}`,
                                    borderRadius: 20,
                                    padding: 32,
                                }}
                            >
                                {/* SVG Icon */}
                                <div
                                    style={{
                                        marginBottom: 18,
                                        color: "#3a5c48", // Same color as the text
                                    }}
                                >
                                    <Icon
                                        style={{
                                            width: 34,
                                            height: 34,
                                        }}
                                    />
                                </div>

                                <h3
                                    style={{
                                        fontFamily: faro,
                                        fontSize: 22,
                                        fontWeight: 700,
                                        margin: "0 0 10px",
                                    }}
                                >
                                    {f.title}
                                </h3>

                                <p
                                    style={{
                                        fontSize: 15,
                                        lineHeight: 1.6,
                                        color: "#3a5c48",
                                        margin: 0,
                                        fontFamily: inter,
                                    }}
                                >
                                    {f.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>

            <div style={{ borderTop: `2px solid ${colors.primary}`, margin: "0 48px" }} />

            {/* TECH STACK */}
            <section
                id="tech"
                style={{
                    background: colors.bg,
                    padding: "100px 48px 25px",
                }}
            >
                <div
                    style={{
                        maxWidth: 1200,
                        margin: "0 auto",
                        background: colors.primary,
                        borderRadius: "48px",
                        padding: "70px",
                        boxShadow: "0 20px 60px rgba(0,0,0,.12)",
                    }}
                >
                    <div
                        style={{
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: "2px",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,.5)",
                            marginBottom: 18,
                            fontFamily: inter,
                        }}
                    >
                        Built With
                    </div>

                    <h2
                        style={{
                            fontFamily: faro,
                            fontSize: 54,
                            fontWeight: 900,
                            color: "#fff",
                            marginBottom: 20,
                            lineHeight: 1.05,
                        }}
                    >
                        Production-grade stack.
                    </h2>

                    <p
                        style={{
                            fontSize: 18,
                            color: "rgba(255,255,255,.65)",
                            maxWidth: 650,
                            lineHeight: 1.8,
                            marginBottom: 60,
                            fontFamily: inter,
                        }}
                    >
                        Every technology choice was intentional. Reliable,
                        scalable and built for real-world applications.
                    </p>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4,1fr)",
                            gap: "24px",
                        }}
                    >
                        {tech.map((t) => (
                            <div
                                key={t.name}
                                style={{
                                    background: "#fff",
                                    borderRadius: "28px",
                                    padding: "28px",
                                    boxShadow: "0 18px 40px rgba(0,0,0,.10)",
                                    transition: "0.3s",
                                }}
                            >
                                {/* Name Row */}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "14px",
                                        marginBottom: "18px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 38,
                                            height: 38,
                                            borderRadius: "50%",
                                            background: "#CBD7FF",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            color: colors.primary,
                                            fontSize: 22,
                                            fontWeight: 900,
                                            flexShrink: 0,
                                        }}
                                    >
                                        +
                                    </div>

                                    <div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                fontWeight: 700,
                                                textTransform: "uppercase",
                                                letterSpacing: "2px",
                                                color: "#68806F",
                                                fontFamily: inter,
                                            }}
                                        >
                                            {t.label}
                                        </div>

                                        <h3
                                            style={{
                                                margin: "4px 0 0",
                                                fontFamily: faro,
                                                fontSize: 24,
                                                fontWeight: 900,
                                                color: colors.primary,
                                            }}
                                        >
                                            {t.name}
                                        </h3>
                                    </div>
                                </div>

                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 15,
                                        color: "#5B6B62",
                                        lineHeight: 1.7,
                                        fontFamily: inter,
                                    }}
                                >
                                    {t.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" style={{ padding: "80px 48px", maxWidth: 1100, margin: "0 auto" }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#3a5c48", marginBottom: 16 }}>FAQ</div>
                <h2 style={{ fontFamily: faro, fontSize: 52, fontWeight: 900, letterSpacing: "-1.5px", margin: "0 0 48px", lineHeight: 1.05 }}>Common questions.</h2>
                <div style={{ borderTop: `1.5px solid ${colors.primary}` }}>
                    {faqs.map((faq, i) => (
                        <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ padding: "20px 0", cursor: "pointer" }}>
                            <div style={{ fontFamily: faro, fontSize: 18, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                {faq.q}
                                <span style={{ fontSize: 28, fontWeight: 300, transition: "transform 0.2s", display: "inline-block", transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
                            </div>
                            {openFaq === i && (
                                <p style={{ fontSize: 16, color: "#3a5c48", lineHeight: 1.7, marginTop: 16, fontFamily: inter }}>{faq.a}</p>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <div style={{ borderTop: `2px solid ${colors.primary}`, margin: "0 48px" }} />

            {/* CTA */}
            <section style={{ background: colors.accent, padding: "80px 48px", textAlign: "center", borderBottom: `2px solid ${colors.primary}` }}>
                <h2 style={{ fontFamily: faro, fontSize: 60, fontWeight: 900, color: colors.primary, margin: "0 0 20px", letterSpacing: "-2px", lineHeight: 1.05 }}>
                    Ready to start chatting?
                </h2>
                <p style={{ fontSize: 18, color: "#3a5c48", margin: "0 0 40px", fontFamily: inter }}>
                    Create your account in seconds. No credit card required.
                </p>
                <button onClick={() => navigate("/signup")} style={{
                    background: colors.primary, color: colors.accent, padding: "16px 48px",
                    borderRadius: 100, fontSize: 18, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: inter,
                }}>Create free account</button>
            </section>

            {/* FOOTER */}
            <footer
                style={{
                    background: colors.bg,
                    padding: "70px 48px",
                }}
            >
                <div
                    style={{
                        maxWidth: "1200px",
                        margin: "0 auto",
                        background: "#CBD7FF",
                        borderRadius: "36px",
                        padding: "36px 48px",
                        boxShadow: "0 18px 45px rgba(0,0,0,0.08)",
                    }}
                >
                    {/* Top Row */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr auto 1fr",
                            alignItems: "center",
                            gap: "20px",
                        }}
                    >
                        {/* Left */}
                        <div>
                            <p
                                style={{
                                    margin: 0,
                                    color: "#42554A",
                                    fontSize: "15px",
                                    fontFamily: inter,
                                }}
                            >
                                Built with Spring Boot + Kotlin + WebSocket
                            </p>
                        </div>

                        {/* Center */}
                        <div style={{ textAlign: "center" }}>
        <span
            style={{
                fontFamily: faro,
                fontSize: "36px",
                fontWeight: 900,
                color: colors.primary,
                letterSpacing: "-1px",
            }}
        >
          Ripple^
        </span>
                        </div>

                        {/* Right */}
                        <div style={{ textAlign: "right" }}>
                            <p
                                style={{
                                    margin: 0,
                                    color: "#42554A",
                                    fontSize: "15px",
                                    fontFamily: inter,
                                }}
                            >
                                © 2026 Ripple
                            </p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div
                        style={{
                            height: "1px",
                            background: "rgba(32,53,45,0.15)",
                            margin: "28px 0",
                        }}
                    />

                    {/* Bottom Row */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "16px",
                        }}
                    >
                        <p
                            style={{
                                margin: 0,
                                color: "#42554A",
                                fontSize: "14px",
                                fontFamily: inter,
                            }}
                        >
                            Secure, real-time messaging built for modern conversations.
                        </p>

                        <div
                            style={{
                                display: "flex",
                                gap: "24px",
                            }}
                        >
                            <a
                                href="#features"
                                style={{
                                    textDecoration: "none",
                                    color: colors.primary,
                                    fontFamily: inter,
                                    fontWeight: 600,
                                }}
                            >
                                Features
                            </a>

                            <a
                                href="#tech"
                                style={{
                                    textDecoration: "none",
                                    color: colors.primary,
                                    fontFamily: inter,
                                    fontWeight: 600,
                                }}
                            >
                                Tech Stack
                            </a>

                            <a
                                href="#faq"
                                style={{
                                    textDecoration: "none",
                                    color: colors.primary,
                                    fontFamily: inter,
                                    fontWeight: 600,
                                }}
                            >
                                FAQ
                            </a>

                            <a
                                href="/signup"
                                style={{
                                    textDecoration: "none",
                                    color: colors.primary,
                                    fontFamily: inter,
                                    fontWeight: 600,
                                }}
                            >
                                Get Started
                            </a>
                        </div>
                    </div>
                </div>
            </footer>        </div>
    );
}