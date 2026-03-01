"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download, TrendingDown, Droplets, Activity, FileText } from "lucide-react";

const waterHistory = [
    { month: "Aug '25", et0: 140, etc: 161, rainfall: 95, deficit: 66 },
    { month: "Sep '25", et0: 120, etc: 138, rainfall: 78, deficit: 60 },
    { month: "Oct '25", et0: 95, etc: 109, rainfall: 45, deficit: 64 },
    { month: "Nov '25", et0: 70, etc: 80, rainfall: 22, deficit: 58 },
    { month: "Dec '25", et0: 55, etc: 63, rainfall: 15, deficit: 48 },
    { month: "Jan '26", et0: 60, etc: 69, rainfall: 18, deficit: 51 },
    { month: "Feb '26", et0: 75, etc: 86, rainfall: 30, deficit: 56 },
];

const farmEfficiency = [
    { name: "Farm A — Wheat", efficiency: 72, deficit: 45 },
    { name: "Farm B — Maize", efficiency: 85, deficit: 28 },
    { name: "Farm C — Cotton", efficiency: 60, deficit: 62 },
];

const TT = { background: "#fff", border: "1px solid #E2F5F8", borderRadius: 10, color: "#334155", fontSize: 12, padding: "8px 12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" };

const RISK_COLOR: Record<string, { text: string; bg: string; border: string }> = {
    critical: { text: "#DC2626", bg: "#FEE2E2", border: "#FECACA" },
    high: { text: "#EA580C", bg: "#FFEDD5", border: "#FED7AA" },
    moderate: { text: "#D97706", bg: "#FEF3C7", border: "#FDE68A" },
    low: { text: "#059669", bg: "#D1FAE5", border: "#A7F3D0" },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ReportsPage() {
    const { user } = useUser();
    const userBudgets = useQuery(api.waterBudgets.getUserWaterBudgets, { clerkId: user?.id ?? "" });

    return (
        <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
                <div>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#0891B2", marginBottom: 5 }}>Analytics</p>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.025em" }}>Reports</h1>
                    <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 3 }}>Seasonal water budget summaries and efficiency metrics</p>
                </div>
                <button onClick={() => window.print()}
                    style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "#FFFFFF", border: "1.5px solid #E2F5F8", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer", transition: "all 0.14s ease", boxShadow: "0 1px 4px rgba(8,145,178,0.06)" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#0891B2"; e.currentTarget.style.color = "#0891B2"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2F5F8"; e.currentTarget.style.color = "#475569"; }}>
                    <Download size={15} /> Export PDF
                </button>
            </div>

            {/* KPI strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10, marginBottom: 16 }}>
                {[
                    { label: "Budgets Saved", value: userBudgets?.length ?? 0, unit: "", color: "#0891B2", bg: "#ECFEFF", icon: FileText },
                    { label: "Avg Monthly Deficit", value: "52.4", unit: "mm", color: "#DC2626", bg: "#FEF2F2", icon: TrendingDown },
                    { label: "Water Use Efficiency", value: "72", unit: "%", color: "#059669", bg: "#F0FDF4", icon: Activity },
                    { label: "Irrigation Saved", value: "280", unit: "m³", color: "#6366F1", bg: "#EEF2FF", icon: Droplets },
                ].map((k, i) => {
                    const Icon = k.icon; return (
                        <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: i * 0.05 }}
                            style={{ background: "#FFFFFF", border: "1px solid #E2F5F8", borderRadius: 14, padding: "20px", boxShadow: "0 1px 4px rgba(8,145,178,0.06)" }}>
                            <div style={{ width: 32, height: 32, background: k.bg, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: k.color, marginBottom: 12 }}>
                                <Icon size={15} />
                            </div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 700, color: k.color, letterSpacing: "-0.02em" }}>{k.value}</span>
                                <span style={{ fontSize: 12, color: "#94A3B8" }}>{k.unit}</span>
                            </div>
                            <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 5 }}>{k.label}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Trend chart */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E2F5F8", borderRadius: 14, padding: "22px 24px", marginBottom: 12, boxShadow: "0 1px 4px rgba(8,145,178,0.06)" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 2 }}>Seasonal Water Budget Trend</p>
                <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 18 }}>ET₀ · ETc · Rainfall · Deficit — Kharif + Rabi 2025–26 (mm)</p>
                <ResponsiveContainer width="100%" height={230}>
                    <AreaChart data={waterHistory}>
                        <defs>
                            {[{ id: "et0G", c: "#F59E0B" }, { id: "etcG", c: "#6366F1" }, { id: "rainG", c: "#0891B2" }, { id: "defG", c: "#DC2626" }].map(({ id, c }) => (
                                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={c} stopOpacity={0.18} /><stop offset="95%" stopColor={c} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2F5F8" />
                        <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={TT} />
                        <Legend wrapperStyle={{ fontSize: 11, color: "#64748B" }} />
                        <Area type="monotone" dataKey="et0" stroke="#F59E0B" fill="url(#et0G)" strokeWidth={2} name="ET₀" dot={false} />
                        <Area type="monotone" dataKey="etc" stroke="#6366F1" fill="url(#etcG)" strokeWidth={2} name="ETc" dot={false} />
                        <Area type="monotone" dataKey="rainfall" stroke="#0891B2" fill="url(#rainG)" strokeWidth={2} name="Rainfall" dot={false} />
                        <Area type="monotone" dataKey="deficit" stroke="#DC2626" fill="url(#defG)" strokeWidth={2} name="Deficit" dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Farm efficiency */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E2F5F8", borderRadius: 14, padding: "22px 24px", marginBottom: userBudgets && userBudgets.length > 0 ? 12 : 0, boxShadow: "0 1px 4px rgba(8,145,178,0.06)" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 20 }}>Farm-wise Water Use Efficiency</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    {farmEfficiency.map(farm => {
                        const barColor = farm.efficiency >= 80 ? "#059669" : farm.efficiency >= 65 ? "#D97706" : "#DC2626";
                        return (
                            <div key={farm.name}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{farm.name}</span>
                                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                        <span style={{ fontSize: 12, color: "#94A3B8" }}>Deficit: <span style={{ color: "#DC2626", fontWeight: 600 }}>{farm.deficit}mm</span></span>
                                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: barColor }}>{farm.efficiency}%</span>
                                    </div>
                                </div>
                                <div style={{ height: 6, background: "#E2F5F8", borderRadius: 999, overflow: "hidden" }}>
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${farm.efficiency}%` }} transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                        style={{ height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${barColor}88, ${barColor})` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Budget history table */}
            {userBudgets && userBudgets.length > 0 && (
                <div style={{ background: "#FFFFFF", border: "1px solid #E2F5F8", borderRadius: 14, padding: "22px 24px", overflow: "hidden", boxShadow: "0 1px 4px rgba(8,145,178,0.06)" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 18 }}>Saved Budget History</p>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                            <thead>
                                <tr>
                                    {["Period", "ET₀", "ETc", "Kc", "Rainfall", "Deficit", "Risk", "Irrigation"].map(h => (
                                        <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#94A3B8", fontWeight: 600, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #E2F5F8" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {userBudgets.map(b => {
                                    const r = RISK_COLOR[b.riskLevel] ?? RISK_COLOR.moderate;
                                    return (
                                        <tr key={b._id} style={{ borderBottom: "1px solid #F0F9FF" }}>
                                            <td style={{ padding: "11px 12px", fontWeight: 600, color: "#334155" }}>{MONTHS[b.month - 1]} {b.year}</td>
                                            <td style={{ padding: "11px 12px", fontFamily: "'JetBrains Mono', monospace", color: "#D97706" }}>{b.et0.toFixed(1)}</td>
                                            <td style={{ padding: "11px 12px", fontFamily: "'JetBrains Mono', monospace", color: "#6366F1" }}>{b.etc.toFixed(1)}</td>
                                            <td style={{ padding: "11px 12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748B" }}>{b.kc.toFixed(2)}</td>
                                            <td style={{ padding: "11px 12px", fontFamily: "'JetBrains Mono', monospace", color: "#0891B2" }}>{b.rainfall}</td>
                                            <td style={{ padding: "11px 12px", fontFamily: "'JetBrains Mono', monospace", color: "#DC2626" }}>{b.waterDeficit.toFixed(1)}</td>
                                            <td style={{ padding: "11px 12px" }}>
                                                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: r.text, background: r.bg, padding: "2px 9px", borderRadius: 999, border: `1px solid ${r.border}` }}>{b.riskLevel}</span>
                                            </td>
                                            <td style={{ padding: "11px 12px", fontFamily: "'JetBrains Mono', monospace", color: "#0891B2" }}>{b.irrigationRequired.toFixed(0)} mm</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
