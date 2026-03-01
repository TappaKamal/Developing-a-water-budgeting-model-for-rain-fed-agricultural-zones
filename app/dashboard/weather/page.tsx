"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Thermometer, CloudRain, Wind, Droplets, Sun, TrendingDown, TrendingUp } from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Legend, ComposedChart, Line
} from "recharts";

const history = [
    { month: "Mar", maxT: 34, minT: 20, rain: 28, humidity: 52, wind: 3.2 },
    { month: "Apr", maxT: 37, minT: 24, rain: 15, humidity: 45, wind: 3.8 },
    { month: "May", maxT: 40, minT: 28, rain: 42, humidity: 58, wind: 4.1 },
    { month: "Jun", maxT: 36, minT: 26, rain: 140, humidity: 74, wind: 5.2 },
    { month: "Jul", maxT: 31, minT: 24, rain: 215, humidity: 82, wind: 4.8 },
    { month: "Aug", maxT: 30, minT: 23, rain: 195, humidity: 84, wind: 4.2 },
    { month: "Sep", maxT: 31, minT: 23, rain: 98, humidity: 76, wind: 3.5 },
    { month: "Oct", maxT: 33, minT: 21, rain: 46, humidity: 62, wind: 2.8 },
    { month: "Nov", maxT: 30, minT: 17, rain: 22, humidity: 55, wind: 2.5 },
    { month: "Dec", maxT: 28, minT: 14, rain: 12, humidity: 48, wind: 2.2 },
    { month: "Jan", maxT: 27, minT: 12, rain: 18, humidity: 50, wind: 2.0 },
    { month: "Feb", maxT: 30, minT: 15, rain: 30, humidity: 53, wind: 2.6 },
];

const TT = { background: "#fff", border: "1px solid #E2F5F8", borderRadius: 10, color: "#334155", fontSize: 12, padding: "8px 12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" };

const currentConditions = [
    { label: "Max Temp", value: "34", unit: "°C", icon: Thermometer, color: "#D97706", bg: "#FFFBEB", trend: +2 },
    { label: "Min Temp", value: "21", unit: "°C", icon: Thermometer, color: "#0891B2", bg: "#ECFEFF", trend: -1 },
    { label: "Humidity", value: "62", unit: "%", icon: Droplets, color: "#6366F1", bg: "#EEF2FF", trend: +4 },
    { label: "Wind Speed", value: "3.2", unit: "m/s", icon: Wind, color: "#8B5CF6", bg: "#F5F3FF", trend: 0 },
    { label: "Rainfall", value: "0", unit: "mm", icon: CloudRain, color: "#0891B2", bg: "#ECFEFF", trend: 0 },
    { label: "Solar Rad.", value: "18.4", unit: "MJ/m²", icon: Sun, color: "#F59E0B", bg: "#FFFBEB", trend: +1 },
];

const seasons = [
    { season: "Kharif", period: "Jun – Sep", months: [5, 6, 7, 8], stress: "Low – Moderate", color: "#059669", top: "#34D399", pct: 20, note: "Monsoon provides 70–85% ETc" },
    { season: "Post-Kharif", period: "Oct – Nov", months: [9, 10], stress: "Moderate", color: "#D97706", top: "#FBBF24", pct: 50, note: "Declining rainfall, deficit starts" },
    { season: "Rabi", period: "Nov – Feb", months: [10, 11, 0, 1], stress: "High", color: "#EA580C", top: "#FB923C", pct: 75, note: "Rainfall <30mm/mo, critical period" },
    { season: "Pre-Kharif", period: "Mar – May", months: [2, 3, 4], stress: "Critical", color: "#DC2626", top: "#F87171", pct: 95, note: "Peak heat stress, maximum ET₀" },
];

/* ─── Circular wind dial ─── */
function WindDial({ speed }: { speed: number }) {
    const max = 8;
    const pct = Math.min(speed / max, 1);
    const r = 28, cx = 36, cy = 36;
    const c = 2 * Math.PI * r;
    return (
        <svg width={72} height={72} viewBox="0 0 72 72">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E2F5F8" strokeWidth={5} />
            <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke="#8B5CF6" strokeWidth={5}
                strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c}
                animate={{ strokeDashoffset: c * (1 - pct) }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
            />
            <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize={11} fontWeight={700} fill="#334155" fontFamily="JetBrains Mono,monospace">{speed}</text>
            <text x={cx} y={cy + 13} textAnchor="middle" fontSize={8} fill="#94A3B8">m/s</text>
        </svg>
    );
}

/* ─── Humidity arc ─── */
function HumidityArc({ value }: { value: number }) {
    const pct = value / 100;
    const r = 28, cx = 36, cy = 36;
    const c = 2 * Math.PI * r;
    const color = value > 70 ? "#0891B2" : value > 50 ? "#6366F1" : "#D97706";
    return (
        <svg width={72} height={72} viewBox="0 0 72 72">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E2F5F8" strokeWidth={5} />
            <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={5}
                strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c}
                animate={{ strokeDashoffset: c * (1 - pct) }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
            />
            <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize={12} fontWeight={700} fill={color} fontFamily="JetBrains Mono,monospace">{value}%</text>
        </svg>
    );
}

// Colored tab selector
const CHART_TABS = ["Temperature", "Rainfall", "Humidity & Wind"] as const;

export default function WeatherPage() {
    const [tab, setTab] = useState<typeof CHART_TABS[number]>("Temperature");

    return (
        <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }}>
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#0891B2", marginBottom: 5 }}>Environmental Data</p>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.025em" }}>Climate Overview</h1>
                <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 3 }}>Historical weather patterns for evapotranspiration modelling</p>
            </motion.div>

            {/* Current condition tiles */}
            <motion.div
                initial="hidden" animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 16 }}>
                {currentConditions.map(c => {
                    const Icon = c.icon;
                    return (
                        <motion.div key={c.label}
                            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }}
                            style={{ background: "#FFFFFF", border: "1px solid #E2F5F8", borderRadius: 14, padding: "16px 18px", boxShadow: "0 1px 4px rgba(8,145,178,0.06)", position: "relative", overflow: "hidden" }}
                            whileHover={{ boxShadow: "0 4px 16px rgba(8,145,178,0.12)", y: -2 }}>
                            {/* Bg tint */}
                            <div style={{ position: "absolute", top: -16, right: -16, width: 64, height: 64, background: `radial-gradient(circle, ${c.bg} 0%, transparent 70%)`, pointerEvents: "none" }} />
                            <div style={{ width: 32, height: 32, background: c.bg, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: c.color, marginBottom: 10 }}>
                                <Icon size={15} />
                            </div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 24, fontWeight: 800, color: c.color, letterSpacing: "-0.02em" }}>{c.value}</span>
                                <span style={{ fontSize: 11, color: "#94A3B8" }}>{c.unit}</span>
                            </div>
                            <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 3 }}>{c.label}</p>
                            {c.trend !== 0 && (
                                <div style={{ position: "absolute", top: 14, right: 14, display: "flex", alignItems: "center", gap: 2 }}>
                                    {c.trend > 0 ? <TrendingUp size={11} color="#DC2626" /> : <TrendingDown size={11} color="#059669" />}
                                    <span style={{ fontSize: 10, fontWeight: 600, color: c.trend > 0 ? "#DC2626" : "#059669" }}>{Math.abs(c.trend)}</span>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Wind + Humidity visual row */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.4 }}
                style={{ background: "#FFFFFF", border: "1px solid #E2F5F8", borderRadius: 14, padding: "20px 24px", marginBottom: 14, boxShadow: "0 1px 4px rgba(8,145,178,0.06)", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
                <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#0F172A", marginBottom: 3 }}>Current Day Dials</p>
                    <p style={{ fontSize: 11, color: "#94A3B8" }}>Wind speed & humidity — key ET₀ drivers</p>
                </div>
                <div style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <WindDial speed={3.2} />
                        <p style={{ fontSize: 11, color: "#94A3B8" }}>Wind</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <HumidityArc value={62} />
                        <p style={{ fontSize: 11, color: "#94A3B8" }}>Humidity</p>
                    </div>
                </div>
                {/* Quick stats */}
                <div style={{ display: "flex", gap: 24, flex: 1, flexWrap: "wrap" }}>
                    {[
                        { label: "Annual Rainfall", value: "801 mm", note: "12-mo total" },
                        { label: "Peak Temp", value: "40°C", note: "May 2025" },
                        { label: "Driest Month", value: "Dec", note: "12 mm only" },
                        { label: "Avg Humidity", value: "62%", note: "annual avg" },
                    ].map(s => (
                        <div key={s.label}>
                            <p style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "-0.02em" }}>{s.value}</p>
                            <p style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", marginTop: 1 }}>{s.label}</p>
                            <p style={{ fontSize: 10, color: "#CBD5E1" }}>{s.note}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Tabbed charts */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34, duration: 0.4 }}
                style={{ background: "#FFFFFF", border: "1px solid #E2F5F8", borderRadius: 14, padding: "22px 24px", marginBottom: 14, boxShadow: "0 1px 4px rgba(8,145,178,0.06)" }}>
                {/* Tabs */}
                <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid #E2F5F8", paddingBottom: 12 }}>
                    {CHART_TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 16px", borderRadius: 8, border: "none", fontSize: 12.5, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", background: tab === t ? "#ECFEFF" : "transparent", color: tab === t ? "#0891B2" : "#64748B", boxShadow: tab === t ? "0 0 0 1px #A5F3FC" : "none" }}>
                            {t}
                        </button>
                    ))}
                </div>

                {tab === "Temperature" && (
                    <ResponsiveContainer width="100%" height={220}>
                        <ComposedChart data={history}>
                            <defs>
                                <linearGradient id="maxTG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F59E0B" stopOpacity={0.22} /><stop offset="95%" stopColor="#F59E0B" stopOpacity={0} /></linearGradient>
                                <linearGradient id="minTG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0891B2" stopOpacity={0.18} /><stop offset="95%" stopColor="#0891B2" stopOpacity={0} /></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2F5F8" />
                            <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={TT} />
                            <Legend wrapperStyle={{ fontSize: 11, color: "#64748B" }} />
                            <Area type="monotone" dataKey="maxT" stroke="#F59E0B" fill="url(#maxTG)" strokeWidth={2.5} name="Max Temp °C" dot={false} animationDuration={1200} />
                            <Area type="monotone" dataKey="minT" stroke="#0891B2" fill="url(#minTG)" strokeWidth={2.5} name="Min Temp °C" dot={false} animationDuration={1400} />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
                {tab === "Rainfall" && (
                    <ResponsiveContainer width="100%" height={220}>
                        <ComposedChart data={history}>
                            <defs>
                                <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0891B2" stopOpacity={0.25} /><stop offset="95%" stopColor="#0891B2" stopOpacity={0} /></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2F5F8" />
                            <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={TT} />
                            <Legend wrapperStyle={{ fontSize: 11, color: "#64748B" }} />
                            <Bar dataKey="rain" fill="#0891B2" name="Rainfall mm" radius={[4, 4, 0, 0]} maxBarSize={16} animationDuration={1200} fillOpacity={0.85} />
                            <Line type="monotone" dataKey="rain" stroke="#0E7490" strokeWidth={2} dot={false} name="Trend" strokeDasharray="4 2" />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
                {tab === "Humidity & Wind" && (
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={history}>
                            <defs>
                                <linearGradient id="humG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06B6D4" stopOpacity={0.22} /><stop offset="95%" stopColor="#06B6D4" stopOpacity={0} /></linearGradient>
                                <linearGradient id="windG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.18} /><stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} /></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2F5F8" />
                            <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={TT} />
                            <Legend wrapperStyle={{ fontSize: 11, color: "#64748B" }} />
                            <Area type="monotone" dataKey="humidity" stroke="#06B6D4" fill="url(#humG)" strokeWidth={2.5} name="Humidity %" dot={false} animationDuration={1200} />
                            <Area type="monotone" dataKey="wind" stroke="#8B5CF6" fill="url(#windG)" strokeWidth={2.5} name="Wind m/s" dot={false} animationDuration={1400} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </motion.div>

            {/* Seasonal timeline */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42, duration: 0.4 }}
                style={{ background: "#FFFFFF", border: "1px solid #E2F5F8", borderRadius: 14, padding: "22px 24px", boxShadow: "0 1px 4px rgba(8,145,178,0.06)" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 3 }}>Seasonal Water Stress Calendar</p>
                <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 20 }}>Agronomic guidance for rain-fed zone planning</p>

                {/* Timeline bar */}
                <div style={{ display: "flex", borderRadius: 12, overflow: "hidden", height: 10, marginBottom: 20, gap: 1 }}>
                    {seasons.map(s => (
                        <motion.div key={s.season} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}
                            style={{ flex: s.months.length, background: `linear-gradient(90deg, ${s.top}, ${s.color})`, transformOrigin: "left" }} />
                    ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                    {seasons.map((s, i) => (
                        <motion.div key={s.season} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 + i * 0.06 }}
                            style={{ background: "#FAFEFF", border: "1px solid #E2F5F8", borderTop: `3px solid ${s.top}`, borderRadius: 12, padding: "16px", position: "relative", overflow: "hidden" }}>
                            {/* Stress % bar filling */}
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, pointerEvents: "none" }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ duration: 1, delay: 0.6 + i * 0.08, ease: "easeOut" }}
                                    style={{ height: 3, background: `linear-gradient(90deg, ${s.top}, ${s.color})`, opacity: 0.4 }} />
                            </div>
                            <p style={{ fontWeight: 700, fontSize: 14.5, color: "#0F172A", marginBottom: 2 }}>{s.season}</p>
                            <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 10 }}>{s.period}</p>
                            <span style={{ display: "inline-flex", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: s.color, background: `${s.top}22`, padding: "3px 10px", borderRadius: 999, border: `1px solid ${s.top}44`, marginBottom: 10 }}>
                                {s.stress}
                            </span>
                            <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6, marginTop: 4 }}>{s.note}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
