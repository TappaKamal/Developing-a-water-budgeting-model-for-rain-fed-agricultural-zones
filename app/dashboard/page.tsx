"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import {
    TrendingDown, CloudRain, Thermometer, Activity,
    AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight,
    Sprout, BarChart3, Droplets, Zap
} from "lucide-react";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    ReferenceLine
} from "recharts";
import Link from "next/link";

/* ─── Animated counter ─── */
function AnimCounter({ value, decimals = 0 }: { value: number; decimals?: number }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    const mv = useMotionValue(0);
    const spring = useSpring(mv, { duration: 1600, bounce: 0 });
    const [display, setDisplay] = useState("0");
    useEffect(() => { if (inView) mv.set(value); }, [inView, mv, value]);
    useEffect(() => spring.on("change", (l) => setDisplay(l.toFixed(decimals))), [spring, decimals]);
    return <span ref={ref}>{display}</span>;
}

/* ─── Sparkline mini chart ─── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const w = 80, h = 32;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / (max - min || 1)) * h;
        return `${x},${y}`;
    }).join(" ");
    const area = `M ${pts.split(" ")[0]} L ${pts} L ${w},${h} L 0,${h} Z`;
    return (
        <svg width={w} height={h} style={{ overflow: "visible" }}>
            <defs>
                <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <path d={area} fill={`url(#sg-${color.replace("#", "")})`} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
}

/* ─── SVG Radial Gauge ─── */
function Gauge({ value, max = 100, color }: { value: number; max?: number; color: string }) {
    const r = 38, cx = 48, cy = 48;
    const circumference = Math.PI * r; // half-circle
    const pct = Math.min(value / max, 1);
    const strokeDashoffset = circumference * (1 - pct);
    return (
        <svg width={96} height={56} viewBox="0 0 96 60">
            <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#E2F5F8" strokeWidth={8} strokeLinecap="round" />
            <motion.path
                d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={circumference}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.4, ease: "easeOut" }}
            />
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize={13} fontWeight={700} fill={color} fontFamily="JetBrains Mono, monospace">
                {value.toFixed(0)}%
            </text>
        </svg>
    );
}

const monthlyData = [
    { month: "Aug", rainfall: 95, et0: 140, deficit: 45, surplus: 0 },
    { month: "Sep", rainfall: 78, et0: 120, deficit: 42, surplus: 0 },
    { month: "Oct", rainfall: 45, et0: 95, deficit: 50, surplus: 0 },
    { month: "Nov", rainfall: 22, et0: 70, deficit: 48, surplus: 0 },
    { month: "Dec", rainfall: 15, et0: 55, deficit: 40, surplus: 0 },
    { month: "Jan", rainfall: 18, et0: 60, deficit: 42, surplus: 0 },
    { month: "Feb", rainfall: 30, et0: 75, deficit: 45, surplus: 0 },
    { month: "Mar", rainfall: 55, et0: 100, deficit: 45, surplus: 0 },
    { month: "Apr", rainfall: 80, et0: 120, deficit: 40, surplus: 0 },
    { month: "May", rainfall: 120, et0: 145, deficit: 25, surplus: 0 },
    { month: "Jun", rainfall: 180, et0: 155, deficit: 0, surplus: 25 },
    { month: "Jul", rainfall: 220, et0: 165, deficit: 0, surplus: 55 },
];

const SPARKLINES: Record<string, number[]> = {
    "Water Deficit": [55, 52, 48, 51, 49, 47, 45, 47],
    "Soil Moisture": [60, 62, 65, 63, 66, 68, 67, 68],
    "Monthly Rainfall": [62, 58, 55, 45, 38, 42, 38, 42],
    "ET₀ Today": [4.0, 4.1, 4.2, 4.1, 4.3, 4.2, 4.1, 4.2],
};

const kpis = [
    { label: "Water Deficit", value: 47.3, unit: "mm", change: "-12%", dir: "down", color: "#DC2626", dimBg: "#FEF2F2", icon: TrendingDown, sub: "vs last month", decimals: 1 },
    { label: "Soil Moisture", value: 68, unit: "%", change: "+5%", dir: "up", color: "#059669", dimBg: "#D1FAE5", icon: Activity, sub: "of field capacity", decimals: 0 },
    { label: "Monthly Rainfall", value: 42, unit: "mm", change: "-18%", dir: "down", color: "#0891B2", dimBg: "#CFFAFE", icon: CloudRain, sub: "below seasonal avg", decimals: 0 },
    { label: "ET₀ Today", value: 4.2, unit: "mm/day", change: "stable", dir: "neutral", color: "#D97706", dimBg: "#FEF3C7", icon: Thermometer, sub: "reference ET", decimals: 1 },
];

const TT = { background: "#fff", border: "1px solid #E2F5F8", borderRadius: 10, color: "#334155", fontSize: 12, padding: "8px 12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" };

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const itemVariant = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };

export default function DashboardPage() {
    const { user } = useUser();
    const farms = useQuery(api.farms.getFarms, { clerkId: user?.id ?? "" });
    const alerts = useQuery(api.alerts.getAlerts, { clerkId: user?.id ?? "" });

    const firstName = user?.firstName ?? "there";
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    return (
        <div style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#0891B2", marginBottom: 5 }}>{greeting}</p>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.025em", marginBottom: 3 }}>{firstName}&apos;s Dashboard</h1>
                    <p style={{ fontSize: 13, color: "#94A3B8" }}>Water budget overview &middot; {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
                </div>
                {/* Live badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F0FDF4", border: "1px solid #A7F3D0", borderRadius: 999, padding: "6px 14px" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#059669", display: "inline-block", animation: "pulse-green 2s ease-in-out infinite" }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#059669" }}>Live Monitoring</span>
                </div>
            </motion.div>

            {/* No farms banner */}
            {farms !== undefined && farms.length === 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
                    style={{ background: "#ECFEFF", border: "1px solid #A5F3FC", borderRadius: 14, padding: "16px 20px", marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 38, height: 38, background: "#CFFAFE", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Sprout size={18} color="#0891B2" />
                        </div>
                        <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 2 }}>Add your first farm to get started</p>
                            <p style={{ fontSize: 12, color: "#64748B" }}>Farms are required to calculate and save water budgets</p>
                        </div>
                    </div>
                    <Link href="/dashboard/farms" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "#0891B2", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "white", textDecoration: "none", boxShadow: "0 4px 12px rgba(8,145,178,0.28)" }}>
                        Add Farm <ArrowUpRight size={13} />
                    </Link>
                </motion.div>
            )}

            {/* KPI tiles */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible"
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12, marginBottom: 16 }}>
                {kpis.map(k => {
                    const Icon = k.icon;
                    const spark = SPARKLINES[k.label] ?? [];
                    return (
                        <motion.div key={k.label} variants={itemVariant}
                            style={{ background: "#FFFFFF", border: "1px solid #E2F5F8", borderRadius: 16, padding: "20px 22px", position: "relative", overflow: "hidden", boxShadow: "0 1px 4px rgba(8,145,178,0.06)", cursor: "default" }}
                            whileHover={{ boxShadow: "0 6px 20px rgba(8,145,178,0.13)", y: -2 }}>
                            {/* Subtle corner glow */}
                            <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, background: `radial-gradient(circle, ${k.dimBg} 0%, transparent 70%)`, pointerEvents: "none" }} />

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                                <div style={{ width: 36, height: 36, background: k.dimBg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: k.color }}>
                                    <Icon size={17} />
                                </div>
                                <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, color: k.dir === "up" ? "#059669" : k.dir === "down" ? "#DC2626" : "#94A3B8", background: k.dir === "up" ? "#F0FDF4" : k.dir === "down" ? "#FEF2F2" : "#F1F5F9", padding: "3px 8px", borderRadius: 999 }}>
                                    {k.dir === "up" ? <ArrowUpRight size={10} /> : k.dir === "down" ? <ArrowDownRight size={10} /> : null}
                                    {k.change}
                                </span>
                            </div>

                            <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 4 }}>{k.label}</p>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 10 }}>
                                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 30, fontWeight: 800, color: k.color, letterSpacing: "-0.03em", lineHeight: 1 }}>
                                    <AnimCounter value={k.value} decimals={k.decimals} />
                                </span>
                                <span style={{ fontSize: 12, color: "#94A3B8" }}>{k.unit}</span>
                            </div>

                            {/* Sparkline */}
                            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                                <p style={{ fontSize: 11, color: "#CBD5E1" }}>{k.sub}</p>
                                <Sparkline data={spark} color={k.color} />
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Soil moisture gauge row */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.28 }}
                style={{ background: "#FFFFFF", border: "1px solid #E2F5F8", borderRadius: 14, padding: "20px 24px", marginBottom: 14, boxShadow: "0 1px 4px rgba(8,145,178,0.06)", display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
                <div>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 4 }}>System Health</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>Real-time soil & crop indicators</p>
                </div>
                <div style={{ display: "flex", gap: 32, flexWrap: "wrap", flex: 1 }}>
                    {[
                        { label: "Soil Moisture", value: 68, color: "#059669" },
                        { label: "Water Deficit Risk", value: 47, color: "#DC2626" },
                        { label: "Irrigation Need", value: 62, color: "#D97706" },
                        { label: "Crop Water Stress", value: 33, color: "#6366F1" },
                    ].map(g => (
                        <div key={g.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            <Gauge value={g.value} color={g.color} />
                            <p style={{ fontSize: 11, color: "#64748B", fontWeight: 500, textAlign: "center", maxWidth: 80 }}>{g.label}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Charts row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }} className="grid-cols-1 md:grid-cols-2">
                <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.32 }}
                    style={{ background: "#FFFFFF", border: "1px solid #E2F5F8", borderRadius: 14, padding: "22px 24px", boxShadow: "0 1px 4px rgba(8,145,178,0.06)" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 2 }}>Rainfall vs ET₀ — 12 Month</p>
                    <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 16 }}>Monthly values in mm — shaded area = active zone</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={monthlyData}>
                            <defs>
                                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0891B2" stopOpacity={0.22} /><stop offset="95%" stopColor="#0891B2" stopOpacity={0} /></linearGradient>
                                <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D97706" stopOpacity={0.18} /><stop offset="95%" stopColor="#D97706" stopOpacity={0} /></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2F5F8" />
                            <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={TT} />
                            <Legend wrapperStyle={{ fontSize: 11, color: "#64748B" }} />
                            <ReferenceLine y={100} stroke="#0891B2" strokeDasharray="4 4" strokeOpacity={0.3} />
                            <Area type="monotone" dataKey="rainfall" stroke="#0891B2" fill="url(#rg)" strokeWidth={2.5} name="Rainfall" dot={false} animationDuration={1200} />
                            <Area type="monotone" dataKey="et0" stroke="#D97706" fill="url(#eg)" strokeWidth={2.5} name="ET₀" dot={false} animationDuration={1400} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.36 }}
                    style={{ background: "#FFFFFF", border: "1px solid #E2F5F8", borderRadius: 14, padding: "22px 24px", boxShadow: "0 1px 4px rgba(8,145,178,0.06)" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 2 }}>Water Balance</p>
                    <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 16 }}>Monthly deficit (red) & surplus (green) in mm</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2F5F8" />
                            <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={TT} />
                            <Legend wrapperStyle={{ fontSize: 11, color: "#64748B" }} />
                            <Bar dataKey="deficit" name="Deficit" fill="#F87171" radius={[4, 4, 0, 0]} maxBarSize={14} animationDuration={1200} />
                            <Bar dataKey="surplus" name="Surplus" fill="#34D399" radius={[4, 4, 0, 0]} maxBarSize={14} animationDuration={1400} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Alerts + Quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 12 }} className="grid-cols-1 lg:grid-cols-[1fr_300px]">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}
                    style={{ background: "#FFFFFF", border: "1px solid #E2F5F8", borderRadius: 14, padding: "22px 24px", boxShadow: "0 1px 4px rgba(8,145,178,0.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>Active Alerts</p>
                        <Link href="/dashboard/alerts" style={{ fontSize: 12, color: "#0891B2", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
                            View all <ArrowUpRight size={12} />
                        </Link>
                    </div>
                    {(alerts?.length ?? 0) === 0 ? (
                        <div style={{ textAlign: "center", padding: "28px 0" }}>
                            <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                                <CheckCircle size={36} color="#059669" style={{ margin: "0 auto 12px", display: "block" }} />
                            </motion.div>
                            <p style={{ color: "#059669", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>All clear</p>
                            <p style={{ color: "#64748B", fontSize: 12 }}>No active alerts — water budget is healthy</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {alerts?.slice(0, 4).map((alert: { _id: string; severity: string; title: string; message: string }, i: number) => (
                                <motion.div key={alert._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                                    style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 14px", borderRadius: 10, background: alert.severity === "critical" ? "#FEF2F2" : alert.severity === "warning" ? "#FFFBEB" : "#ECFEFF", border: `1px solid ${alert.severity === "critical" ? "#FECACA" : alert.severity === "warning" ? "#FDE68A" : "#A5F3FC"}` }}>
                                    <AlertTriangle size={14} color={alert.severity === "critical" ? "#DC2626" : alert.severity === "warning" ? "#D97706" : "#0891B2"} style={{ flexShrink: 0, marginTop: 2 }} />
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: 13, color: "#0F172A", marginBottom: 2 }}>{alert.title}</p>
                                        <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.5 }}>{alert.message}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.44 }}
                    style={{ background: "#FFFFFF", border: "1px solid #E2F5F8", borderRadius: 14, padding: "22px 24px", boxShadow: "0 1px 4px rgba(8,145,178,0.06)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                        <Zap size={14} color="#0891B2" />
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>Quick Actions</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {[
                            { href: "/dashboard/water-budget", label: "Calculate Budget", icon: Droplets, color: "#0891B2", bg: "#ECFEFF" },
                            { href: "/dashboard/farms", label: "Manage Farms", icon: Sprout, color: "#059669", bg: "#F0FDF4" },
                            { href: "/dashboard/weather", label: "View Climate", icon: CloudRain, color: "#6366F1", bg: "#EEF2FF" },
                            { href: "/dashboard/reports", label: "View Reports", icon: BarChart3, color: "#D97706", bg: "#FFFBEB" },
                        ].map(a => {
                            const Icon = a.icon;
                            return (
                                <Link key={a.href} href={a.href}
                                    style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 13px", borderRadius: 10, border: "1px solid #E2F5F8", textDecoration: "none", color: "#334155", fontSize: 13, fontWeight: 500, transition: "all 0.16s ease", background: "transparent" }}
                                    onMouseEnter={e => { e.currentTarget.style.background = a.bg; e.currentTarget.style.borderColor = a.color + "30"; e.currentTarget.style.color = a.color; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#E2F5F8"; e.currentTarget.style.color = "#334155"; }}>
                                    <div style={{ width: 30, height: 30, background: a.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: a.color, flexShrink: 0 }}>
                                        <Icon size={14} />
                                    </div>
                                    {a.label}
                                    <ArrowUpRight size={12} style={{ marginLeft: "auto", opacity: 0.4 }} />
                                </Link>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
