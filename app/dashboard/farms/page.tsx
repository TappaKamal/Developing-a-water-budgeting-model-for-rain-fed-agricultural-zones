"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const SOIL_TYPES = ["sandy", "loamy", "clay", "silty", "peaty", "chalky"];
const IRRIGATION = ["rain-fed", "drip", "sprinkler", "flood"];
const CROPS = ["Wheat", "Rice", "Maize", "Cotton", "Soybean", "Sugarcane", "Groundnut", "Tomato", "Millet", "Sorghum", "Barley", "Chickpea", "Lentil", "Mustard"];

const SOIL_COLOR: Record<string, { text: string; bg: string; border: string }> = {
    sandy: { text: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
    loamy: { text: "#059669", bg: "#F0FDF4", border: "#A7F3D0" },
    clay: { text: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE" },
    silty: { text: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
    peaty: { text: "#8B5CF6", bg: "#F5F3FF", border: "#DDD6FE" },
    chalky: { text: "#EC4899", bg: "#FDF2F8", border: "#FBCFE8" },
};

export default function FarmsPage() {
    const { user } = useUser();
    const farms = useQuery(api.farms.getFarms, { clerkId: user?.id ?? "" });
    const createFarm = useMutation(api.farms.createFarm);
    const deleteFarm = useMutation(api.farms.deleteFarm);

    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: "", location: "", state: "", area: 1, soilType: "loamy", cropType: "Wheat", irrigationType: "rain-fed" as const, latitude: 18.5, longitude: 73.8, elevation: 0 });

    const handleCreate = async () => {
        if (!user || !form.name.trim() || !form.location.trim()) { toast.error("Farm name and location are required"); return; }
        setLoading(true);
        try {
            await createFarm({ clerkId: user.id, ...form });
            toast.success(`"${form.name}" created`);
            setShowModal(false);
            setForm({ name: "", location: "", state: "", area: 1, soilType: "loamy", cropType: "Wheat", irrigationType: "rain-fed", latitude: 18.5, longitude: 73.8, elevation: 0 });
        } catch { toast.error("Failed to create"); } finally { setLoading(false); }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"?`)) return;
        try { await deleteFarm({ farmId: id as any }); toast.success(`"${name}" deleted`); }
        catch { toast.error("Failed"); }
    };

    const inp: React.CSSProperties = { width: "100%", padding: "9px 13px", background: "#FFF", border: "1.5px solid #E2E8F0", borderRadius: 10, color: "#0F172A", fontSize: 14, fontFamily: "Inter,sans-serif", outline: "none", transition: "all 0.14s", appearance: "none" as any };
    const lbl: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as any, color: "#94A3B8", marginBottom: 7 };
    const onFocus = (e: React.FocusEvent<any>) => { e.target.style.borderColor = "#0891B2"; e.target.style.boxShadow = "0 0 0 3px rgba(8,145,178,0.10)"; };
    const onBlur = (e: React.FocusEvent<any>) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; };

    return (
        <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
                <div>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#0891B2", marginBottom: 5 }}>Farm Management</p>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.025em" }}>Farms</h1>
                    <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 3 }}>{farms?.length ?? 0} farm{(farms?.length ?? 0) !== 1 ? "s" : ""} registered</p>
                </div>
                <button onClick={() => setShowModal(true)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "#0891B2", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "white", cursor: "pointer", boxShadow: "0 4px 14px rgba(8,145,178,0.30)", transition: "all 0.14s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#0E7490"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#0891B2"; }}>
                    <Plus size={15} /> Add Farm
                </button>
            </div>

            {/* Grid */}
            {farms === undefined ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 190, borderRadius: 14 }} />)}
                </div>
            ) : farms.length === 0 ? (
                <div style={{ background: "#FFF", border: "1px solid #E2F5F8", borderRadius: 16, padding: "72px 40px", textAlign: "center", boxShadow: "0 1px 4px rgba(8,145,178,0.06)" }}>
                    <div style={{ width: 64, height: 64, background: "#ECFEFF", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                        <MapPin size={28} color="#0891B2" />
                    </div>
                    <p style={{ fontWeight: 600, fontSize: 16, color: "#0F172A", marginBottom: 8 }}>No farms yet</p>
                    <p style={{ fontSize: 13, color: "#64748B", maxWidth: 280, margin: "0 auto 22px", lineHeight: 1.6 }}>Add your first farm to start tracking water budgets.</p>
                    <button onClick={() => setShowModal(true)} style={{ padding: "10px 22px", background: "#0891B2", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "white", cursor: "pointer", boxShadow: "0 4px 14px rgba(8,145,178,0.28)" }}>Add First Farm</button>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
                    {farms.map((farm, i) => {
                        const sc = SOIL_COLOR[farm.soilType] ?? SOIL_COLOR.loamy;
                        return (
                            <motion.div key={farm._id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.06 }}
                                style={{ background: "#FFF", border: "1px solid #E2F5F8", borderRadius: 14, padding: "22px", position: "relative", overflow: "hidden", boxShadow: "0 1px 4px rgba(8,145,178,0.06)", transition: "all 0.2s" }}
                                whileHover={{ boxShadow: "0 4px 16px rgba(8,145,178,0.12)", y: -1 }}>
                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${sc.text},${sc.text}55)` }} />
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 40, height: 40, background: sc.bg, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", color: sc.text, fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                                            {farm.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 700, fontSize: 14.5, color: "#0F172A", lineHeight: 1.2 }}>{farm.name}</p>
                                            <p style={{ fontSize: 11.5, color: "#94A3B8", marginTop: 2 }}>{farm.location}{farm.state ? `, ${farm.state}` : ""}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(farm._id, farm.name)} style={{ background: "none", border: "none", cursor: "pointer", color: "#CBD5E1", padding: 4, borderRadius: 6, transition: "color 0.12s" }}
                                        onMouseEnter={e => (e.currentTarget.style.color = "#DC2626")} onMouseLeave={e => (e.currentTarget.style.color = "#CBD5E1")}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                                    {[
                                        { label: "Area", value: `${farm.area} ha` },
                                        { label: "Crop", value: farm.cropType },
                                        { label: "Soil", value: farm.soilType.charAt(0).toUpperCase() + farm.soilType.slice(1) },
                                        { label: "Irrigation", value: farm.irrigationType },
                                    ].map(item => (
                                        <div key={item.label} style={{ background: "#F8FFFE", borderRadius: 9, padding: "9px 10px", border: "1px solid #E2F5F8" }}>
                                            <p style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: "#334155", marginTop: 3 }}>{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                        style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
                        onClick={() => setShowModal(false)}>
                        <motion.div initial={{ scale: 0.96, y: 14, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, y: 14, opacity: 0 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            onClick={e => e.stopPropagation()}
                            style={{ background: "#FFF", border: "1px solid #E2F5F8", borderRadius: 18, padding: "28px", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(8,145,178,0.15)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: 17, color: "#0F172A" }}>Add New Farm</p>
                                    <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 3 }}>Register a new agricultural plot</p>
                                </div>
                                <button onClick={() => setShowModal(false)} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, cursor: "pointer", color: "#64748B", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <X size={16} />
                                </button>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                <div>
                                    <label style={lbl}>Farm Name *</label>
                                    <input style={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Main Plot" onFocus={onFocus} onBlur={onBlur} />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div><label style={lbl}>Location *</label><input style={inp} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Village / District" onFocus={onFocus} onBlur={onBlur} /></div>
                                    <div><label style={lbl}>State</label><input style={inp} value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="Maharashtra" onFocus={onFocus} onBlur={onBlur} /></div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div><label style={lbl}>Area (ha)</label><input type="number" style={inp} value={form.area} onChange={e => setForm({ ...form, area: parseFloat(e.target.value) })} min={0.1} step={0.1} onFocus={onFocus} onBlur={onBlur} /></div>
                                    <div><label style={lbl}>Elevation (m)</label><input type="number" style={inp} value={form.elevation} onChange={e => setForm({ ...form, elevation: parseFloat(e.target.value) })} onFocus={onFocus} onBlur={onBlur} /></div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div><label style={lbl}>Crop Type</label><select style={inp} value={form.cropType} onChange={e => setForm({ ...form, cropType: e.target.value })} onFocus={onFocus} onBlur={onBlur}>{CROPS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                                    <div><label style={lbl}>Soil Type</label><select style={inp} value={form.soilType} onChange={e => setForm({ ...form, soilType: e.target.value })} onFocus={onFocus} onBlur={onBlur}>{SOIL_TYPES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></div>
                                </div>
                                <div><label style={lbl}>Irrigation Type</label><select style={inp} value={form.irrigationType} onChange={e => setForm({ ...form, irrigationType: e.target.value as any })} onFocus={onFocus} onBlur={onBlur}>{IRRIGATION.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}</select></div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div><label style={lbl}>Latitude</label><input type="number" style={inp} value={form.latitude} onChange={e => setForm({ ...form, latitude: parseFloat(e.target.value) })} step={0.01} onFocus={onFocus} onBlur={onBlur} /></div>
                                    <div><label style={lbl}>Longitude</label><input type="number" style={inp} value={form.longitude} onChange={e => setForm({ ...form, longitude: parseFloat(e.target.value) })} step={0.01} onFocus={onFocus} onBlur={onBlur} /></div>
                                </div>
                                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                                    <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 10, color: "#64748B", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                                    <button onClick={handleCreate} disabled={loading} style={{ flex: 2, padding: "10px", background: "#0891B2", border: "none", borderRadius: 10, color: "white", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: "0 4px 14px rgba(8,145,178,0.28)", transition: "all 0.14s" }}
                                        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#0E7490"; }}
                                        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#0891B2"; }}>
                                        {loading ? <><Loader2 size={15} className="spin" />Creating...</> : <><Plus size={15} />Create Farm</>}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
