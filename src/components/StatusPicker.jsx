import {useState} from "react";
import NotIcon from "../assets/status/not.svg?react";
import SingleIcon from "../assets/status/single.svg?react";
import TwoIcon from "../assets/status/two.svg?react";
import MarriIcon from "../assets/status/marri.svg?react";
import MazeIcon from "../assets/status/maze.svg?react";

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
export  function StatusPicker({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const selected = STATUS_OPTIONS.find(o => o.value === value) || STATUS_OPTIONS[0];

    return (
        <div style={{ position: "relative" }}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: `2px solid ${C.primary}`,
                    borderRadius: open ? "14px 14px 0 0" : 14,
                    fontSize: 14,
                    fontFamily: inter,
                    background: C.white,
                    color: C.primary,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                    transition: "box-shadow 0.2s",
                    boxShadow: open ? `0 0 0 4px rgba(30,58,43,0.1)` : "none",
                }}
            >
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>{selected.emoji}</span>
          <span style={{ fontWeight: value ? 600 : 400, color: value ? C.primary : "rgba(30,58,43,0.35)" }}>
            {selected.label}
          </span>
        </span>
                <svg
                    width="14" height="14" viewBox="0 0 16 16" fill="none"
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
                >
                    <path d="M 3 5 L 8 11 L 13 5" stroke={C.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && (
                <div
                    className="status-dropdown"
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: C.white,
                        border: `2px solid ${C.primary}`,
                        borderTop: "none",
                        borderRadius: "0 0 14px 14px",
                        overflowY: "auto",
                        maxHeight: "96px",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        zIndex: 50,
                        boxShadow: "0 8px 24px rgba(30,58,43,0.12)",
                    }}
                >
                    {STATUS_OPTIONS.map((opt, i) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                            style={{
                                width: "100%",
                                padding: "11px 16px",
                                background: opt.value === value ? "rgba(239,248,122,0.4)" : "transparent",
                                border: "none",
                                borderTop: i === 0 ? "none" : `1px solid rgba(30,58,43,0.08)`,
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                cursor: "pointer",
                                fontFamily: inter,
                                fontSize: 14,
                                color: C.primary,
                                textAlign: "left",
                                transition: "background 0.15s",
                            }}
                            onMouseEnter={e => { if (opt.value !== value) e.currentTarget.style.background = "rgba(30,58,43,0.05)"; }}
                            onMouseLeave={e => { if (opt.value !== value) e.currentTarget.style.background = "transparent"; }}
                        >
                            <span
                                style={{
                                    width: 20,
                                    height: 20,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}>
                                {opt.icon}</span>
                            <span style={{ fontWeight: opt.value === value ? 700 : 400 }}>{opt.label}</span>
                            {opt.value === value && (
                                <svg style={{ marginLeft: "auto" }} width="14" height="14" viewBox="0 0 16 16" fill="none">
                                    <path d="M 3 8 L 7 12 L 13 4" stroke={C.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
const STATUS_OPTIONS = [
    {
        value: "",
        label: "Prefer not to say",
        icon: <NotIcon width={18} height={18} />,
    },
    {
        value: "SINGLE",
        label: "Single",
        icon: <SingleIcon width={18} height={18}  />,
    },
    {
        value: "COMMITTED",
        label: "In a relationship",
        icon: <TwoIcon width={18} height={18}  />,
    },
    {
        value: "MARRIED",
        label: "Married",
        icon: <MarriIcon width={18} height={18}  />,
    },
    {
        value: "COMPLICATED",
        label: "It's complicated",
        icon: <MazeIcon width={18} height={18} style={{ color: "#8B5CF6" }} />,
    },
];
