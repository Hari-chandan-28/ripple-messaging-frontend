import { useState, useEffect } from "react";

const colors = {
    bg: "#f8f4f0",
    primary: "#1e3a2b",
    accent: "#eff87a",
    lavender: "#cfdcff",
    white: "#ffffff",
};

const styles = {
    page: {
        background: colors.bg,
        fontFamily: "'Inter', sans-serif",
        color: colors.primary,
        minHeight: "100vh",
        overflowX: "hidden",
    },
    nav: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 48px",
        borderBottom: `2px solid ${colors.primary}`,
        background: colors.bg,
        position: "sticky",
        top: 0,
        zIndex: 100,
    },
    navLogo: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        textDecoration: "none",
        color: colors.primary,
    },
    logoMark: {
        width: 36,
        height: 36,
        background: colors.primary,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: colors.accent,
        fontWeight: 800,
        fontSize: 16,
        fontFamily: "'Faro', sans-serif",
    },
    logoText: {
        fontSize: 20,
        fontWeight: 700,
        fontFamily: "'Faro', sans-serif",
        letterSpacing: "-0.5px",
    },
    navLinks: {
        display: "flex",
        gap: "32px",
        listStyle: "none",
        margin: 0,
        padding: 0,
    },
    navLink: {
        color: colors.primary,
        textDecoration: "none",
        fontSize: 15,
        fontWeight: 500,
        cursor: "pointer",
        transition: "opacity 0.2s",
    },
    navCta: {
        background: colors.primary,
        color: colors.accent,
        padding: "10px 24px",
        borderRadius: 100,
        fontSize: 14,
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        textDecoration: "none",
    },
    hero: {
        padding: "100px 48px 80px",
        maxWidth: 1100,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 60,
        alignItems: "center",
    },
    heroEyebrow: {
        display: "inline-block",
        background: colors.lavender,
        color: colors.primary,
        padding: "6px 16px",
        borderRadius: 100,
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 20,
        border: `1.5px solid ${colors.primary}`,
    },
    heroTitle: {
        fontFamily: "'Faro', sans-serif",
        fontSize: 64,
        lineHeight: 1.05,
        fontWeight: 400,
        margin: "0 0 24px",
        letterSpacing: "-1.5px",
    },
    heroAccent: {
        background: colors.accent,
        borderRadius: 8,
        padding: "0 8px",
        display: "inline",
    },
    heroSub: {
        fontSize: 18,
        lineHeight: 1.7,
        color: "#3a5c48",
        margin: "0 0 40px",
        maxWidth: 480,
    },
    heroBtns: {
        display: "flex",
        gap: 16,
        alignItems: "center",
    },
    btnPrimary: {
        background: colors.primary,
        color: colors.accent,
        padding: "14px 32px",
        borderRadius: 100,
        fontSize: 16,
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        textDecoration: "none",
        display: "inline-block",
    },
    btnSecondary: {
        background: "transparent",
        color: colors.primary,
        padding: "14px 32px",
        borderRadius: 100,
        fontSize: 16,
        fontWeight: 600,
        border: `2px solid ${colors.primary}`,
        cursor: "pointer",
        textDecoration: "none",
        display: "inline-block",
    },
    heroVisual: {
        background: colors.primary,
        borderRadius: 24,
        padding: 32,
        border: `3px solid ${colors.primary}`,
        position: "relative",
        overflow: "hidden",
    },
    chatMockup: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    chatHeader: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 8,
        paddingBottom: 16,
        borderBottom: "1px solid rgba(255,255,255,0.15)",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: colors.accent,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 700,
        color: colors.primary,
        flexShrink: 0,
    },
    chatName: {
        color: "#fff",
        fontWeight: 600,
        fontSize: 15,
    },
    chatStatus: {
        color: colors.accent,
        fontSize: 12,
        display: "flex",
        alignItems: "center",
        gap: 4,
    },
    bubble: (isOwn) => ({
        background: isOwn ? colors.accent : "rgba(255,255,255,0.12)",
        color: isOwn ? colors.primary : "#fff",
        padding: "10px 16px",
        borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        fontSize: 14,
        maxWidth: "75%",
        alignSelf: isOwn ? "flex-end" : "flex-start",
        lineHeight: 1.5,
    }),
    chatInput: {
        display: "flex",
        gap: 8,
        marginTop: 8,
        background: "rgba(255,255,255,0.08)",
        borderRadius: 100,
        padding: "10px 16px",
        alignItems: "center",
    },
    chatInputText: {
        flex: 1,
        color: "rgba(255,255,255,0.5)",
        fontSize: 14,
    },
    sendBtn: {
        background: colors.accent,
        border: "none",
        borderRadius: "50%",
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: colors.primary,
        fontWeight: 700,
        fontSize: 16,
    },
    section: {
        padding: "80px 48px",
        maxWidth: 1100,
        margin: "0 auto",
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "2px",
        textTransform: "uppercase",
        color: "#3a5c48",
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: "'Faro', sans-serif",
        fontSize: 48,
        fontWeight: 400,
        letterSpacing: "-1px",
        margin: "0 0 16px",
        lineHeight: 1.1,
    },
    sectionSub: {
        fontSize: 17,
        color: "#3a5c48",
        lineHeight: 1.7,
        maxWidth: 560,
        margin: "0 0 56px",
    },
    featuresGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 24,
    },
    featureCard: (accentBg) => ({
        background: accentBg || colors.white,
        border: `2px solid ${colors.primary}`,
        borderRadius: 20,
        padding: 32,
    }),
    featureIcon: {
        fontSize: 32,
        marginBottom: 16,
    },
    featureTitle: {
        fontFamily: "'Faro', sans-serif",
        fontSize: 22,
        fontWeight: 400,
        margin: "0 0 10px",
    },
    featureDesc: {
        fontSize: 15,
        lineHeight: 1.6,
        color: "#3a5c48",
        margin: 0,
    },
    divider: {
        borderTop: `2px solid ${colors.primary}`,
        margin: "0 48px",
    },
    techSection: {
        background: colors.primary,
        padding: "80px 48px",
    },
    techInner: {
        maxWidth: 1100,
        margin: "0 auto",
    },
    techTitle: {
        fontFamily: "'Faro', sans-serif",
        fontSize: 48,
        fontWeight: 400,
        color: colors.accent,
        margin: "0 0 16px",
        letterSpacing: "-1px",
    },
    techSub: {
        fontSize: 17,
        color: "rgba(255,255,255,0.65)",
        margin: "0 0 56px",
        lineHeight: 1.7,
    },
    techGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
    },
    techCard: {
        background: "rgba(255,255,255,0.07)",
        border: "1.5px solid rgba(255,255,255,0.15)",
        borderRadius: 16,
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    techCardLabel: {
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.4)",
    },
    techCardName: {
        fontSize: 18,
        fontWeight: 600,
        color: "#fff",
    },
    techCardDesc: {
        fontSize: 13,
        color: "rgba(255,255,255,0.5)",
        lineHeight: 1.5,
    },
    faqSection: {
        padding: "80px 48px",
        maxWidth: 1100,
        margin: "0 auto",
    },
    faqItem: {
        borderBottom: `1.5px solid ${colors.primary}`,
        padding: "24px 0",
        cursor: "pointer",
    },
    faqQ: {
        fontFamily: "'Faro', sans-serif",
        fontSize: 22,
        fontWeight: 400,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        margin: 0,
    },
    faqA: {
        fontSize: 16,
        color: "#3a5c48",
        lineHeight: 1.7,
        marginTop: 16,
        margin: "16px 0 0",
    },
    footer: {
        background: colors.primary,
        padding: "48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    footerLogo: {
        fontFamily: "'Faro', sans-serif",
        fontSize: 24,
        color: colors.accent,
        fontWeight: 400,
    },
    footerText: {
        color: "rgba(255,255,255,0.4)",
        fontSize: 14,
    },
};

const features = [
    {
        icon: "💬",
        title: "Real-time messaging",
        desc: "Instant delivery via WebSocket. Your messages arrive the moment you send them, no polling, no delays.",
        bg: colors.accent,
    },
    {
        icon: "👥",
        title: "Groups & roles",
        desc: "Create groups, manage members, assign admin roles. Full control over who can do what.",
        bg: colors.lavender,
    },
    {
        icon: "🔒",
        title: "Privacy controls",
        desc: "Go private anytime. Control who can find you, view your profile, or see your friends list.",
        bg: colors.white,
    },
    {
        icon: "🤝",
        title: "Friend connections",
        desc: "Send requests, accept connections, remove friends. Your social graph, your rules.",
        bg: colors.white,
    },
    {
        icon: "🔍",
        title: "Smart search",
        desc: "Find anyone by username with typeahead search. Results update as you type.",
        bg: colors.accent,
    },
    {
        icon: "✉️",
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

export default function RippleLanding() {
    const [openFaq, setOpenFaq] = useState(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700&display=swap";
        document.head.appendChild(link);

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div style={styles.page}>
            <nav style={{ ...styles.nav, boxShadow: scrolled ? "0 2px 20px rgba(30,58,43,0.08)" : "none" }}>
                <a href="#" style={styles.navLogo}>
                    <div style={styles.logoMark}>R</div>
                    <span style={styles.logoText}>Ripple</span>
                </a>
                <ul style={styles.navLinks}>
                    {[["Features", "features"], ["Tech Stack", "tech"], ["FAQ", "faq"]].map(([label, id]) => (
                        <li key={id}>
                            <span style={styles.navLink} onClick={() => scrollTo(id)}>{label}</span>
                        </li>
                    ))}
                </ul>
                <div style={{ display: "flex", gap: 12 }}>
                    <a href="/login" style={styles.btnSecondary}>Log in</a>
                    <a href="/signup" style={styles.btnPrimary}>Get started</a>
                </div>
            </nav>

            <section style={{ background: colors.bg, borderBottom: `2px solid ${colors.primary}` }}>
                <div style={styles.hero}>
                    <div>
                        <span style={styles.heroEyebrow}>✦ Real-time messaging</span>
                        <h1 style={styles.heroTitle}>
                            Chat that feels{" "}
                            <span style={styles.heroAccent}>instant.</span>
                            {" "}Always.
                        </h1>
                        <p style={styles.heroSub}>
                            Ripple is a full-featured messaging app built from scratch — real-time WebSocket delivery, friend connections, group chats, and full privacy controls.
                        </p>
                        <div style={styles.heroBtns}>
                            <a href="/signup" style={styles.btnPrimary}>Create account</a>
                            <a href="#features" onClick={(e) => { e.preventDefault(); scrollTo("features"); }} style={styles.btnSecondary}>See features</a>
                        </div>
                    </div>

                    <div style={styles.heroVisual}>
                        <div style={styles.chatMockup}>
                            <div style={styles.chatHeader}>
                                <div style={styles.avatar}>AJ</div>
                                <div>
                                    <div style={styles.chatName}>Arjun</div>
                                    <div style={styles.chatStatus}>
                                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                                        Online now
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                <div style={styles.bubble(false)}>Hey! Did you see the new update?</div>
                                <div style={styles.bubble(true)}>Just checked it out — looks great 🔥</div>
                                <div style={styles.bubble(false)}>Want to jump on a call later?</div>
                                <div style={styles.bubble(true)}>For sure, ping me after 5!</div>
                            </div>
                            <div style={styles.chatInput}>
                                <span style={styles.chatInputText}>Type a message...</span>
                                <button style={styles.sendBtn}>↑</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div style={styles.divider} />

            <section id="features" style={styles.section}>
                <div style={styles.sectionLabel}>Features</div>
                <h2 style={styles.sectionTitle}>Everything you need to connect.</h2>
                <p style={styles.sectionSub}>
                    Built with real architecture decisions — not a tutorial clone. Every feature was designed before a single line of code was written.
                </p>
                <div style={styles.featuresGrid}>
                    {features.map((f) => (
                        <div key={f.title} style={styles.featureCard(f.bg)}>
                            <div style={styles.featureIcon}>{f.icon}</div>
                            <h3 style={styles.featureTitle}>{f.title}</h3>
                            <p style={styles.featureDesc}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div style={styles.divider} />

            <section id="tech" style={styles.techSection}>
                <div style={styles.techInner}>
                    <div style={{ ...styles.sectionLabel, color: "rgba(255,255,255,0.4)" }}>Built with</div>
                    <h2 style={styles.techTitle}>Production-grade stack.</h2>
                    <p style={styles.techSub}>
                        Every technology choice was deliberate. No magic, no shortcuts — just solid engineering from the ground up.
                    </p>
                    <div style={styles.techGrid}>
                        {tech.map((t) => (
                            <div key={t.name} style={styles.techCard}>
                                <span style={styles.techCardLabel}>{t.label}</span>
                                <span style={styles.techCardName}>{t.name}</span>
                                <span style={styles.techCardDesc}>{t.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="faq" style={styles.faqSection}>
                <div style={styles.sectionLabel}>FAQ</div>
                <h2 style={styles.sectionTitle}>Common questions.</h2>
                <div style={{ borderTop: `1.5px solid ${colors.primary}` }}>
                    {faqs.map((faq, i) => (
                        <div key={i} style={styles.faqItem} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                            <p style={styles.faqQ}>
                                {faq.q}
                                <span style={{ fontSize: 24, fontWeight: 300, transition: "transform 0.2s", display: "inline-block", transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
                            </p>
                            {openFaq === i && <p style={styles.faqA}>{faq.a}</p>}
                        </div>
                    ))}
                </div>
            </section>

            <div style={styles.divider} />

            <section style={{ background: colors.accent, padding: "80px 48px", textAlign: "center", borderBottom: `2px solid ${colors.primary}` }}>
                <h2 style={{ fontFamily: "'Faro', sans-serif", fontSize: 56, fontWeight: 400, color: colors.primary, margin: "0 0 20px", letterSpacing: "-1.5px" }}>
                    Ready to start chatting?
                </h2>
                <p style={{ fontSize: 18, color: "#3a5c48", margin: "0 0 40px" }}>
                    Create your account in seconds. No credit card required.
                </p>
                <a href="/signup" style={{ ...styles.btnPrimary, fontSize: 18, padding: "16px 48px" }}>
                    Create free account
                </a>
            </section>

            <footer style={styles.footer}>
                <span style={styles.footerLogo}>Ripple</span>
                <span style={styles.footerText}>Built with Spring Boot + Kotlin + WebSocket</span>
                <span style={styles.footerText}>© 2026 Ripple</span>
            </footer>
        </div>
    );
}