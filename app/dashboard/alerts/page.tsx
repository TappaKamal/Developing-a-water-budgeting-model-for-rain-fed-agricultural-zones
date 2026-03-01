"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, X, Info, Flame } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const SEV = {
    critical: { label: "Critical", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", pill: "#FEE2E2" },
    warning: { label: "Warning", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", pill: "#FEF3C7" },
    info: { label: "Info", color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC", pill: "#CFFAFE" },
};

const TYPE_LABEL: Record<string, string> = {
    water_deficit: "Water Deficit", soil_moisture_low: "Soil Moisture Low",
    excessive_rainfall: "Excessive Rainfall", heat_stress: "Heat Stress",
    irrigation_due: "Irrigation Due", season_warning: "Season Warning",
};

export default function AlertsPage() {
    const { user } = useUser();
    const alerts = useQuery(api.alerts.getAlerts, { clerkId: user?.id ?? "" });
    const markRead = useMutation(api.alerts.markAlertRead);
    const dismiss = useMutation(api.alerts.dismissAlert);

    const handleDismiss = async (id: string) => { try { await dismiss({ alertId: id as any }); toast.success("Dismissed"); } catch { toast.error("Failed"); } };
    const handleRead = async (id: string) => { try { await markRead({ alertId: id as any }); } catch { } };

    const counts = {
        critical: alerts?.filter(a => a.severity === "critical").length ?? 0,
        warning: alerts?.filter(a => a.severity === "warning").length ?? 0,
        info: alerts?.filter(a => a.severity === "info").length ?? 0,
    };
    const unread = alerts?.filter(a => !a.isRead).length ?? 0;

    return (
        <div style={{ padding: "28px 32px", maxWidth: 900, margin: "0 auto" }}>

            <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#0891B2", marginBottom: 5 }}>Monitoring</p>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.025em" }}>Alerts</h1>
                <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 3 }}>{unread > 0 ? `${unread} unread alert${unread !== 1 ? "s" : ""}` : "All caught up"}</p>
            </div>

            {/* Summary strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 22 }}>
                {([
                    { key: "critical", label: "Critical", icon: Flame },
                    { key: "warning", label: "Warning", icon: AlertTriangle },
                    { key: "info", label: "Info", icon: Info },
                ] as const).map(({ key, label, icon: Icon }) => {
                    const s = SEV[key];
                    return (
                        <div key={key} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 34, height: 34, background: s.pill, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                                <Icon size={16} />
                            </div>
                            <div>
                                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{counts[key]}</p>
                                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: s.color + "99", marginTop: 3 }}>{label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* List */}
            {alerts === undefined ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 88, borderRadius: 12 }} />)}
                </div>
            ) : alerts.length === 0 ? (
                <div style={{ background: "#FFFFFF", border: "1px solid #E2F5F8", borderRadius: 14, padding: "64px 32px", textAlign: "center", boxShadow: "0 1px 4px rgba(8,145,178,0.06)" }}>
                    <CheckCircle size={40} color="#059669" style={{ margin: "0 auto 14px", display: "block", opacity: 0.7 }} />
                    <p style={{ fontWeight: 600, fontSize: 15, color: "#0F172A", marginBottom: 6 }}>No active alerts</p>
                    <p style={{ fontSize: 13, color: "#64748B" }}>Your water budget metrics are within acceptable bounds.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {alerts.map((alert, i) => {
                        const s = SEV[alert.severity as keyof typeof SEV] ?? SEV.info;
                        return (
                            <motion.div key={alert._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22, delay: i * 0.04 }}
                                onClick={() => !alert.isRead && handleRead(alert._id)}
                                style={{ background: alert.isRead ? "#FAFAFA" : s.bg, border: `1px solid ${alert.isRead ? "#E2E8F0" : s.border}`, borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", transition: "all 0.14s ease" }}>
                                <div style={{ width: 3, alignSelf: "stretch", borderRadius: 2, background: alert.isRead ? "#E2E8F0" : s.color, flexShrink: 0 }} />
                                <AlertTriangle size={15} color={s.color} style={{ flexShrink: 0, marginTop: 2, opacity: alert.isRead ? 0.4 : 1 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                                        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: s.color, background: s.pill, padding: "2px 8px", borderRadius: 999, border: `1px solid ${s.border}` }}>{s.label}</span>
                                        <span style={{ fontSize: 11, color: "#94A3B8" }}>{TYPE_LABEL[alert.type] ?? alert.type}</span>
                                        {!alert.isRead && <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, display: "inline-block" }} />}
                                    </div>
                                    <p style={{ fontWeight: 600, fontSize: 13.5, color: alert.isRead ? "#94A3B8" : "#0F172A", marginBottom: 3 }}>{alert.title}</p>
                                    <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6 }}>{alert.message}</p>
                                    <p style={{ fontSize: 11, color: "#CBD5E1", marginTop: 6 }}>{formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}</p>
                                </div>
                                <button onClick={e => { e.stopPropagation(); handleDismiss(alert._id); }}
                                    style={{ background: "none", border: "none", cursor: "pointer", color: "#CBD5E1", padding: 4, flexShrink: 0, borderRadius: 6, transition: "color 0.12s" }}
                                    onMouseEnter={e => (e.currentTarget.style.color = "#DC2626")}
                                    onMouseLeave={e => (e.currentTarget.style.color = "#CBD5E1")}>
                                    <X size={15} />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
