"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { User, Globe, Info, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    const { user } = useUser();
    const updateUser = useMutation(api.users.updateUser);
    const [form, setForm] = useState({ role: "farmer", region: "", tempUnit: "C", rainUnit: "mm" });
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await updateUser({ clerkId: user.id, role: form.role as any, region: form.region, units: { temperature: form.tempUnit as any, precipitation: form.rainUnit as any } });
            setSaved(true); toast.success("Settings saved");
            setTimeout(() => setSaved(false), 2500);
        } catch { toast.error("Failed"); } finally { setLoading(false); }
    };

    const inp: React.CSSProperties = { width: "100%", padding: "9px 13px", background: "#FFF", border: "1.5px solid #E2E8F0", borderRadius: 10, color: "#0F172A", fontSize: 14, fontFamily: "Inter,sans-serif", outline: "none", transition: "all 0.14s", appearance: "none" as any };
    const lbl: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as any, color: "#94A3B8", marginBottom: 7 };
    const card: React.CSSProperties = { background: "#FFF", border: "1px solid #E2F5F8", borderRadius: 14, padding: "22px", marginBottom: 12, boxShadow: "0 1px 4px rgba(8,145,178,0.06)" };
    const focus = (e: React.FocusEvent<any>) => { e.target.style.borderColor = "#0891B2"; e.target.style.boxShadow = "0 0 0 3px rgba(8,145,178,0.10)"; };
    const blur = (e: React.FocusEvent<any>) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; };

    return (
        <div style={{ padding: "28px 32px", maxWidth: 660, margin: "0 auto" }}>
            <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#0891B2", marginBottom: 5 }}>Configuration</p>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.025em" }}>Settings</h1>
                <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 3 }}>Manage account preferences and measurement units</p>
            </div>

            {/* Profile */}
            <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
                    <User size={14} color="#94A3B8" />
                    <span style={{ fontWeight: 600, fontSize: 13, color: "#334155" }}>Profile</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: "#F8FFFE", borderRadius: 12, border: "1px solid #E2F5F8", marginBottom: 18 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#0891B2,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 18, flexShrink: 0, boxShadow: "0 4px 12px rgba(8,145,178,0.25)" }}>
                        {(user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0] ?? "?").toUpperCase()}
                    </div>
                    <div>
                        <p style={{ fontWeight: 600, fontSize: 14, color: "#0F172A" }}>{user?.fullName ?? "User"}</p>
                        <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{user?.primaryEmailAddress?.emailAddress}</p>
                    </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                        <label style={lbl}>Role</label>
                        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={inp} onFocus={focus} onBlur={blur}>
                            <option value="farmer">Farmer</option>
                            <option value="agronomist">Agronomist</option>
                            <option value="researcher">Researcher</option>
                        </select>
                    </div>
                    <div>
                        <label style={lbl}>Region</label>
                        <input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} style={inp} placeholder="e.g., Vidarbha, Rajasthan" onFocus={focus} onBlur={blur} />
                    </div>
                </div>
            </div>

            {/* Units */}
            <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
                    <Globe size={14} color="#94A3B8" />
                    <span style={{ fontWeight: 600, fontSize: 13, color: "#334155" }}>Measurement Units</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    {[
                        { key: "tempUnit", label: "Temperature", opts: [{ v: "C", l: "°C" }, { v: "F", l: "°F" }] },
                        { key: "rainUnit", label: "Precipitation", opts: [{ v: "mm", l: "mm" }, { v: "in", l: "inches" }] },
                    ].map(({ key, label, opts }) => (
                        <div key={key}>
                            <label style={lbl}>{label}</label>
                            <div style={{ display: "flex", gap: 8 }}>
                                {opts.map(({ v, l }) => {
                                    const active = (form as any)[key] === v;
                                    return <button key={v} onClick={() => setForm({ ...form, [key]: v })} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "1.5px solid", borderColor: active ? "#0891B2" : "#E2E8F0", background: active ? "#ECFEFF" : "#FFF", color: active ? "#0891B2" : "#64748B", cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.14s" }}>{l}</button>;
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* About */}
            <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
                    <Info size={14} color="#94A3B8" />
                    <span style={{ fontWeight: 600, fontSize: 13, color: "#334155" }}>About AquaSync</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                        { label: "ET₀ Method", value: "Hargreaves-Samani (FAO-56)" },
                        { label: "Crop Standard", value: "FAO Irrigation Paper 56" },
                        { label: "Crop Profiles", value: "10 FAO-56 standard crops" },
                        { label: "Soil Types", value: "6 types (Sandy → Chalky)" },
                    ].map(item => (
                        <div key={item.label} style={{ padding: "13px 14px", background: "#F8FFFE", borderRadius: 10, border: "1px solid #E2F5F8" }}>
                            <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</p>
                            <p style={{ fontSize: 12.5, color: "#334155", fontWeight: 500 }}>{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            <motion.button onClick={handleSave} disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                style={{ width: "100%", padding: "12px", background: saved ? "#059669" : "#0891B2", border: "none", borderRadius: 12, color: "white", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.3s", boxShadow: saved ? "0 4px 16px rgba(5,150,105,0.28)" : "0 4px 16px rgba(8,145,178,0.30)" }}>
                {loading ? <><Loader2 size={16} className="spin" />Saving...</> : saved ? <><Check size={16} />Saved</> : "Save Settings"}
            </motion.button>
        </div>
    );
}
