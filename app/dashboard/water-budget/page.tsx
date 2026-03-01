"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Calculator, Save, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

const CROPS = ["Wheat", "Rice", "Maize", "Cotton", "Soybean", "Sugarcane", "Groundnut", "Tomato", "Millet", "Sorghum"];
const SOIL_TYPES = [
    { value: "sandy", label: "Sandy" }, { value: "loamy", label: "Loamy" },
    { value: "clay", label: "Clay" }, { value: "silty", label: "Silty" },
    { value: "peaty", label: "Peaty" }, { value: "chalky", label: "Chalky" },
];
const GROWTH_STAGES = [
    { value: "initial", label: "Initial / Germination" }, { value: "crop_development", label: "Crop Development" },
    { value: "mid_season", label: "Mid-Season (Peak)" }, { value: "late_season", label: "Late Season / Maturity" },
];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface CalcResult {
    et0: number; et0Monthly: number; kc: number; etc: number; etcMonthly: number;
    rainfall: number; effectiveRainfall: number; soilMoistureStart: number;
    soilMoistureEnd: number; soilFieldCapacity: number; soilWiltingPoint: number;
    waterDeficit: number; waterSurplus: number; irrigationRequired: number;
    waterStressIndex: number; riskLevel: "critical" | "high" | "moderate" | "low";
    totalIrrigationVolume: number; meanTemp: number; recommendations: string[];
}

const RISK = {
    critical: { text: "#DC2626", bg: "#FEF2F2", border: "#FECACA", pill: "#FEE2E2" },
    high: { text: "#EA580C", bg: "#FFEDD5", border: "#FED7AA", pill: "#FFEDD5" },
    moderate: { text: "#D97706", bg: "#FFFBEB", border: "#FDE68A", pill: "#FEF3C7" },
    low: { text: "#059669", bg: "#F0FDF4", border: "#A7F3D0", pill: "#D1FAE5" },
};

const TT = { background: "#fff", border: "1px solid #E2F5F8", borderRadius: 10, color: "#334155", fontSize: 12, padding: "8px 12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" };

export default function WaterBudgetPage() {
    const { user } = useUser();
    const farms = useQuery(api.farms.getFarms, { clerkId: user?.id ?? "" });
    const saveWaterBudget = useMutation(api.waterBudgets.saveWaterBudget);

    const [form, setForm] = useState({
        farmId: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(),
        cropType: "Wheat", growthStage: "mid_season", soilType: "loamy",
        maxTemp: 32, minTemp: 20, humidity: 60, windSpeed: 2.5,
        rainfall: 45, latitude: 18.5, soilMoistureStart: 120, area: 2,
    });
    const [result, setResult] = useState<CalcResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const set = (field: string, value: string | number) => setForm(p => ({ ...p, [field]: value }));

    const calculate = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/calculate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
            const data = await res.json();
            if (data.success) { setResult(data.results); toast.success("Water budget calculated!"); }
            else toast.error(data.error || "Calculation failed");
        } catch { toast.error("Network error"); } finally { setLoading(false); }
    };

    const save = async () => {
        if (!result || !form.farmId || !user) return;
        setSaving(true);
        try {
            await saveWaterBudget({ clerkId: user.id, farmId: form.farmId as Id<"farms">, month: form.month, year: form.year, maxTemp: form.maxTemp, minTemp: form.minTemp, meanTemp: result.meanTemp, rainfall: form.rainfall, effectiveRainfall: result.effectiveRainfall, humidity: form.humidity, windSpeed: form.windSpeed, growthStage: form.growthStage as any, et0: result.et0, kc: result.kc, etc: result.etc, soilMoistureStart: form.soilMoistureStart, soilMoistureEnd: result.soilMoistureEnd, waterDeficit: result.waterDeficit, waterSurplus: result.waterSurplus, waterStressIndex: result.waterStressIndex, riskLevel: result.riskLevel, irrigationRequired: result.irrigationRequired, recommendations: result.recommendations });
            toast.success("Budget saved!");
        } catch { toast.error("Failed to save"); } finally { setSaving(false); }
    };

    /* ─── Shared styles ─── */
    const inp: React.CSSProperties = { width: "100%", padding: "9px 13px", background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: 10, color: "#0F172A", fontSize: 14, fontFamily: "Inter,sans-serif", outline: "none", transition: "border-color 0.14s, box-shadow 0.14s", appearance: "none" as any };
    const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as any, color: "#94A3B8", marginBottom: 6, display: "block" };
    const card: React.CSSProperties = { background: "#FFFFFF", border: "1px solid #E2F5F8", borderRadius: 14, padding: "20px", boxShadow: "0 1px 4px rgba(8,145,178,0.06)" };
    const onFocus = (e: React.FocusEvent<any>) => { e.target.style.borderColor = "#0891B2"; e.target.style.boxShadow = "0 0 0 3px rgba(8,145,178,0.10)"; };
    const onBlur = (e: React.FocusEvent<any>) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; };

    const riskSt = result ? RISK[result.riskLevel] : RISK.low;

    const pieData = result ? [
        { name: "Effective Rainfall", value: result.effectiveRainfall, color: "#0891B2" },
        { name: "Water Deficit", value: result.waterDeficit, color: "#F87171" },
    ] : [];

    const barData = result ? [
        { label: "ET₀ ref", value: result.et0Monthly, color: "#F59E0B" },
        { label: "ETc crop", value: result.etcMonthly, color: "#6366F1" },
        { label: "Eff. Rain", value: result.effectiveRainfall, color: "#0891B2" },
        { label: "Deficit", value: result.waterDeficit, color: "#F87171" },
    ] : [];

    return (
        <div style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#0891B2", marginBottom: 5 }}>Scientific Modelling</p>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.025em" }}>Water Budget Calculator</h1>
                <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 3 }}>ET₀/ETc via Hargreaves-Samani &middot; FAO-56 crop coefficients &middot; Soil moisture balance</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 22 }} className="grid-cols-1 xl:grid-cols-[420px_1fr]">

                {/* ─── INPUT PANEL ─── */}
                <div style={{ background: "#FFFFFF", border: "1px solid #E2F5F8", borderRadius: 16, padding: "22px", display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 1px 4px rgba(8,145,178,0.06)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, paddingBottom: 14, borderBottom: "1px solid #E2F5F8" }}>
                        <div style={{ width: 32, height: 32, background: "#ECFEFF", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Calculator size={15} color="#0891B2" />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>Input Parameters</span>
                    </div>

                    {/* Farm */}
                    <div><label style={lbl}>Farm (optional)</label>
                        <select value={form.farmId} onChange={e => set("farmId", e.target.value)} style={inp} onFocus={onFocus} onBlur={onBlur}>
                            <option value="">No specific farm</option>
                            {farms?.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                        </select>
                    </div>

                    {/* Month + Year */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div><label style={lbl}>Month</label>
                            <select value={form.month} onChange={e => set("month", parseInt(e.target.value))} style={inp} onFocus={onFocus} onBlur={onBlur}>
                                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                            </select>
                        </div>
                        <div><label style={lbl}>Year</label>
                            <input type="number" value={form.year} onChange={e => set("year", parseInt(e.target.value))} style={inp} min={2020} max={2030} onFocus={onFocus} onBlur={onBlur} />
                        </div>
                    </div>

                    {/* Crop + Growth */}
                    <div><label style={lbl}>Crop Type</label>
                        <select value={form.cropType} onChange={e => set("cropType", e.target.value)} style={inp} onFocus={onFocus} onBlur={onBlur}>
                            {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div><label style={lbl}>Growth Stage</label>
                        <select value={form.growthStage} onChange={e => set("growthStage", e.target.value)} style={inp} onFocus={onFocus} onBlur={onBlur}>
                            {GROWTH_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>

                    {/* Soil */}
                    <div><label style={lbl}>Soil Type</label>
                        <select value={form.soilType} onChange={e => set("soilType", e.target.value)} style={inp} onFocus={onFocus} onBlur={onBlur}>
                            {SOIL_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>

                    {/* Temp */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div><label style={lbl}>Max Temp (°C)</label><input type="number" value={form.maxTemp} onChange={e => set("maxTemp", parseFloat(e.target.value))} style={inp} step={0.1} onFocus={onFocus} onBlur={onBlur} /></div>
                        <div><label style={lbl}>Min Temp (°C)</label><input type="number" value={form.minTemp} onChange={e => set("minTemp", parseFloat(e.target.value))} style={inp} step={0.1} onFocus={onFocus} onBlur={onBlur} /></div>
                    </div>

                    {/* Humidity + Wind */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div><label style={lbl}>Humidity (%)</label><input type="number" value={form.humidity} onChange={e => set("humidity", parseFloat(e.target.value))} style={inp} min={0} max={100} onFocus={onFocus} onBlur={onBlur} /></div>
                        <div><label style={lbl}>Wind (m/s)</label><input type="number" value={form.windSpeed} onChange={e => set("windSpeed", parseFloat(e.target.value))} style={inp} step={0.1} onFocus={onFocus} onBlur={onBlur} /></div>
                    </div>

                    {/* Rainfall + Lat */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div><label style={lbl}>Rainfall (mm)</label><input type="number" value={form.rainfall} onChange={e => set("rainfall", parseFloat(e.target.value))} style={inp} min={0} onFocus={onFocus} onBlur={onBlur} /></div>
                        <div><label style={lbl}>Latitude (°)</label><input type="number" value={form.latitude} onChange={e => set("latitude", parseFloat(e.target.value))} style={inp} step={0.1} onFocus={onFocus} onBlur={onBlur} /></div>
                    </div>

                    {/* Soil moisture + Area */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div><label style={lbl}>Init. Soil Moisture (mm)</label><input type="number" value={form.soilMoistureStart} onChange={e => set("soilMoistureStart", parseFloat(e.target.value))} style={inp} onFocus={onFocus} onBlur={onBlur} /></div>
                        <div><label style={lbl}>Farm Area (ha)</label><input type="number" value={form.area} onChange={e => set("area", parseFloat(e.target.value))} style={inp} step={0.1} min={0.1} onFocus={onFocus} onBlur={onBlur} /></div>
                    </div>

                    {/* Calculate button */}
                    <button onClick={calculate} disabled={loading}
                        style={{ width: "100%", padding: "13px", background: "#0891B2", border: "none", borderRadius: 12, color: "white", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, boxShadow: "0 4px 14px rgba(8,145,178,0.30)", transition: "all 0.14s", marginTop: 4 }}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#0E7490"; }}
                        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#0891B2"; }}>
                        {loading ? <><Loader2 size={17} className="spin" /> Calculating...</> : <><Calculator size={17} /> Calculate Water Budget</>}
                    </button>
                </div>

                {/* ─── RESULTS PANEL ─── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {!result ? (
                        <div style={{ background: "#FFFFFF", border: "1px solid #E2F5F8", borderRadius: 16, padding: "72px 40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", flex: 1, boxShadow: "0 1px 4px rgba(8,145,178,0.06)" }}>
                            <div style={{ width: 64, height: 64, background: "#ECFEFF", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                                <Droplets size={28} color="#0891B2" />
                            </div>
                            <h3 style={{ color: "#0F172A", fontWeight: 600, fontSize: 17, marginBottom: 8 }}>Configure and calculate</h3>
                            <p style={{ color: "#94A3B8", fontSize: 13.5, maxWidth: 340, lineHeight: 1.65 }}>
                                Enter weather data, crop type, and soil conditions to compute your farm's scientific water budget.
                            </p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                                {/* Risk banner */}
                                <div style={{ background: riskSt.bg, border: `1px solid ${riskSt.border}`, borderRadius: 16, padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        {result.riskLevel === "low"
                                            ? <CheckCircle size={26} color={riskSt.text} />
                                            : <AlertTriangle size={26} color={riskSt.text} />}
                                        <div>
                                            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: riskSt.text, background: riskSt.pill, padding: "2px 10px", borderRadius: 999, border: `1px solid ${riskSt.border}` }}>
                                                {result.riskLevel} risk
                                            </span>
                                            <p style={{ fontWeight: 700, fontSize: 17, color: "#0F172A", marginTop: 6 }}>
                                                Water Stress Index: {(result.waterStressIndex * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={save} disabled={saving || !form.farmId}
                                        style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", background: form.farmId ? "#0891B2" : "#E2E8F0", border: "none", borderRadius: 10, color: form.farmId ? "white" : "#94A3B8", fontSize: 13, fontWeight: 600, cursor: form.farmId && !saving ? "pointer" : "not-allowed", boxShadow: form.farmId ? "0 4px 12px rgba(8,145,178,0.25)" : "none", transition: "all 0.14s" }}>
                                        {saving ? <><Loader2 size={14} className="spin" />Saving...</> : <><Save size={14} />{form.farmId ? "Save to Farm" : "Select farm to save"}</>}
                                    </button>
                                </div>

                                {/* KPI tiles */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
                                    {[
                                        { label: "ET₀ (daily)", value: result.et0.toFixed(2), unit: "mm/day", color: "#D97706", bg: "#FFFBEB" },
                                        { label: "ETc (crop)", value: result.etc.toFixed(2), unit: "mm/day", color: "#6366F1", bg: "#EEF2FF" },
                                        { label: "Kc Factor", value: result.kc.toFixed(2), unit: "", color: "#059669", bg: "#F0FDF4" },
                                        { label: "Monthly ET₀", value: result.et0Monthly.toFixed(0), unit: "mm", color: "#D97706", bg: "#FFFBEB" },
                                        { label: "Monthly ETc", value: result.etcMonthly.toFixed(0), unit: "mm", color: "#6366F1", bg: "#EEF2FF" },
                                        { label: "Eff. Rainfall", value: result.effectiveRainfall.toFixed(0), unit: "mm", color: "#0891B2", bg: "#ECFEFF" },
                                        { label: "Water Deficit", value: result.waterDeficit.toFixed(0), unit: "mm", color: result.waterDeficit > 30 ? "#DC2626" : "#059669", bg: result.waterDeficit > 30 ? "#FEF2F2" : "#F0FDF4" },
                                        { label: "Irrigation Req.", value: result.irrigationRequired.toFixed(0), unit: "mm", color: "#0891B2", bg: "#ECFEFF" },
                                    ].map(k => (
                                        <div key={k.label} style={{ background: "#FFFFFF", border: "1px solid #E2F5F8", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 4px rgba(8,145,178,0.06)" }}>
                                            <div style={{ width: 30, height: 30, background: k.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                                                <Droplets size={13} color={k.color} />
                                            </div>
                                            <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{k.label}</p>
                                            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 21, fontWeight: 800, color: k.color, letterSpacing: "-0.02em", lineHeight: 1 }}>
                                                {k.value}<span style={{ fontSize: 11, color: "#94A3B8", fontFamily: "Inter,sans-serif", fontWeight: 500 }}> {k.unit}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Charts */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div style={card}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 16 }}>Water Components (mm)</p>
                                        <ResponsiveContainer width="100%" height={180}>
                                            <BarChart data={barData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#E2F5F8" />
                                                <XAxis dataKey="label" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                                                <Tooltip contentStyle={TT} />
                                                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={32}>
                                                    {barData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div style={card}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 16 }}>Rainfall vs Deficit</p>
                                        <ResponsiveContainer width="100%" height={150}>
                                            <PieChart>
                                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" stroke="none">
                                                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                                </Pie>
                                                <Tooltip contentStyle={TT} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 8 }}>
                                            {pieData.map(d => (
                                                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: d.color }} />
                                                    <span style={{ fontSize: 11, color: "#64748B" }}>{d.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Soil moisture */}
                                <div style={card}>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 18 }}>Soil Moisture Balance</p>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
                                        {[
                                            { label: "Field Capacity", value: result.soilFieldCapacity, color: "#0891B2" },
                                            { label: "Current Moisture", value: result.soilMoistureEnd, color: "#059669" },
                                            { label: "Wilting Point", value: result.soilWiltingPoint, color: "#DC2626" },
                                        ].map(item => (
                                            <div key={item.label}>
                                                <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 8, fontWeight: 600 }}>{item.label}</p>
                                                <div style={{ height: 6, background: "#E2F5F8", borderRadius: 999, overflow: "hidden" }}>
                                                    <div style={{ height: "100%", width: `${(item.value / result.soilFieldCapacity) * 100}%`, background: item.color, borderRadius: 999, transition: "width 1s ease" }} />
                                                </div>
                                                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 700, color: item.color, marginTop: 5 }}>{item.value} mm</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recommendations */}
                                <div style={card}>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 16 }}>Recommendations</p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {result.recommendations.map((rec, i) => (
                                            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "11px 14px", background: "#F0FDFD", borderRadius: 10, border: "1px solid #A5F3FC" }}>
                                                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#0891B2", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                                                <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.65 }}>{rec}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {result.irrigationRequired > 0 && (
                                        <div style={{ marginTop: 12, padding: "13px 16px", background: "#ECFEFF", borderRadius: 10, border: "1px solid #A5F3FC", display: "flex", gap: 10, alignItems: "center" }}>
                                            <Droplets size={17} color="#0891B2" />
                                            <div>
                                                <span style={{ fontWeight: 700, color: "#0891B2", fontSize: 14 }}>Total Volume: {result.totalIrrigationVolume.toLocaleString()} m³</span>
                                                <span style={{ color: "#64748B", fontSize: 12, marginLeft: 8 }}>for {form.area} ha</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}
