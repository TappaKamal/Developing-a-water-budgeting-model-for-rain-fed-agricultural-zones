"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, ChevronRight, ChevronLeft, Sprout, User, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const STEPS = ["Profile Setup", "Add First Farm", "Done!"];

export default function OnboardingPage() {
    const { user } = useUser();
    const router = useRouter();
    const createUser = useMutation(api.users.createUser);
    const updateUser = useMutation(api.users.updateUser);
    const createFarm = useMutation(api.farms.createFarm);

    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({ role: "farmer", region: "" });
    const [farm, setFarm] = useState({
        name: "", location: "", area: 1,
        soilType: "loamy", cropType: "Wheat", irrigationType: "rain-fed" as const,
    });

    const handleFinish = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Ensure user exists in Convex DB
            await createUser({
                clerkId: user.id,
                name: user.fullName || user.firstName || "User",
                email: user.primaryEmailAddress?.emailAddress || "",
                role: profile.role as "farmer" | "agronomist" | "researcher",
            });

            // Update profile
            await updateUser({
                clerkId: user.id,
                role: profile.role as "farmer" | "agronomist" | "researcher",
                region: profile.region,
                onboardingComplete: true,
            });

            // Create first farm if name provided
            if (farm.name) {
                await createFarm({
                    clerkId: user.id,
                    ...farm,
                });
            }

            toast.success("Welcome to AquaSync! 🌊");
            router.push("/dashboard");
        } catch (err) {
            toast.error("Setup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: "100%", padding: "12px 14px",
        background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)",
        borderRadius: "12px", color: "white", fontSize: "14px", fontFamily: "Inter, sans-serif", outline: "none",
    };

    const labelStyle = {
        display: "block" as const, fontSize: "12px", fontWeight: 600 as const,
        color: "rgba(255,255,255,0.55)", textTransform: "uppercase" as const,
        letterSpacing: "0.05em", marginBottom: "8px",
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #060B14 0%, #0A1628 50%, #0C1F3D 100%)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
        }}>
            <div style={{ position: "fixed", top: "15%", left: "50%", transform: "translateX(-50%)", width: 500, height: 500, background: "radial-gradient(circle, rgba(0,120,212,0.1) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

            <div style={{ width: "100%", maxWidth: 560, position: "relative", zIndex: 1 }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <div style={{ width: 56, height: 56, background: "linear-gradient(135deg, #0078D4, #00B4D8)", borderRadius: "16px", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", boxShadow: "0 8px 24px rgba(0,120,212,0.4)" }}>
                        <Droplets size={28} color="white" />
                    </div>
                    <h1 style={{ color: "white", fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em" }}>
                        Welcome to AquaSync
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginTop: "6px" }}>
                        Let's set up your account in 2 quick steps
                    </p>
                </div>

                {/* Progress */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px", justifyContent: "center" }}>
                    {STEPS.map((s, i) => (
                        <div key={s} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{
                                width: i <= step ? 28 : 24, height: i <= step ? 28 : 24,
                                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                                background: i < step ? "#10B981" : i === step ? "#0078D4" : "rgba(255,255,255,0.1)",
                                border: i === step ? "2px solid #0078D4" : "none",
                                fontSize: "11px", fontWeight: 700, color: "white",
                                transition: "all 0.3s ease",
                            }}>
                                {i < step ? <CheckCircle size={14} /> : i + 1}
                            </div>
                            {i < STEPS.length - 1 && (
                                <div style={{
                                    width: 60, height: 2,
                                    background: i < step ? "#10B981" : "rgba(255,255,255,0.1)",
                                    borderRadius: "1px", transition: "background 0.3s ease",
                                }} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div style={{ background: "rgba(22, 27, 34, 0.9)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "32px" }}>
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                                    <User size={20} color="#0078D4" />
                                    <h2 style={{ color: "white", fontWeight: 700, fontSize: "18px" }}>Your Profile</h2>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    <div>
                                        <label style={labelStyle}>I am a...</label>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                                            {["farmer", "agronomist", "researcher"].map((role) => (
                                                <button key={role} onClick={() => setProfile({ ...profile, role })}
                                                    style={{
                                                        padding: "12px", borderRadius: "12px", border: "1.5px solid",
                                                        borderColor: profile.role === role ? "#0078D4" : "rgba(255,255,255,0.12)",
                                                        background: profile.role === role ? "rgba(0,120,212,0.15)" : "rgba(255,255,255,0.03)",
                                                        color: profile.role === role ? "#2899F5" : "rgba(255,255,255,0.5)",
                                                        cursor: "pointer", fontWeight: 600, fontSize: "13px",
                                                        textTransform: "capitalize",
                                                    }}>{role}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Your Region</label>
                                        <input style={inputStyle} value={profile.region} onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                                            placeholder="e.g., Vidarbha, Rajasthan, Tamil Nadu" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div key="farm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                                    <Sprout size={20} color="#10B981" />
                                    <h2 style={{ color: "white", fontWeight: 700, fontSize: "18px" }}>Add Your First Farm</h2>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                    <div>
                                        <label style={labelStyle}>Farm Name</label>
                                        <input style={inputStyle} value={farm.name} onChange={(e) => setFarm({ ...farm, name: e.target.value })} placeholder="e.g., Main Plot, Kharif Field" />
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                        <div>
                                            <label style={labelStyle}>Location</label>
                                            <input style={inputStyle} value={farm.location} onChange={(e) => setFarm({ ...farm, location: e.target.value })} placeholder="Village / District" />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Area (ha)</label>
                                            <input type="number" style={inputStyle} value={farm.area} onChange={(e) => setFarm({ ...farm, area: parseFloat(e.target.value) })} min={0.1} step={0.1} />
                                        </div>
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                        <div>
                                            <label style={labelStyle}>Crop</label>
                                            <select style={{ ...inputStyle, appearance: "none" }} value={farm.cropType} onChange={(e) => setFarm({ ...farm, cropType: e.target.value })}>
                                                {["Wheat", "Rice", "Maize", "Cotton", "Soybean", "Sugarcane", "Groundnut", "Tomato", "Millet", "Sorghum"].map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Soil Type</label>
                                            <select style={{ ...inputStyle, appearance: "none" }} value={farm.soilType} onChange={(e) => setFarm({ ...farm, soilType: e.target.value })}>
                                                {["sandy", "loamy", "clay", "silty", "peaty", "chalky"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
                                        You can skip this and add farms later from the dashboard.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation buttons */}
                    <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
                        {step > 0 && (
                            <button onClick={() => setStep(s => s - 1)} className="btn btn-ghost"
                                style={{ color: "rgba(255,255,255,0.5)", gap: "8px" }}>
                                <ChevronLeft size={18} /> Back
                            </button>
                        )}
                        {step < 1 ? (
                            <button onClick={() => setStep(s => s + 1)} className="btn btn-primary" style={{ flex: 1, gap: "8px" }}>
                                Continue <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button onClick={handleFinish} disabled={loading} className="btn btn-primary" style={{ flex: 1, gap: "8px" }}>
                                {loading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle size={18} />}
                                {loading ? "Setting up..." : "Go to Dashboard"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
