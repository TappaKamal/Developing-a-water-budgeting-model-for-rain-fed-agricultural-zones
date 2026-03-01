"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  Droplets, BarChart3, CloudRain, Bell, Map, Brain,
  ChevronRight, ArrowRight, CheckCircle, Menu, X,
  Sprout, Wind, Thermometer, Activity, Shield, Zap
} from "lucide-react";

/* ─── Animated counter ─── */
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 2000 });
  const [display, setDisplay] = useState(0);
  useEffect(() => { if (inView) motionValue.set(value); }, [inView, motionValue, value]);
  useEffect(() => spring.on("change", (l) => setDisplay(Math.round(l))), [spring]);
  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

/* ─── Content data ─── */
const features = [
  { icon: <Droplets size={22} />, title: "ET₀ / ETc Calculator", description: "Hargreaves-Samani method with FAO-56 crop coefficients for precise evapotranspiration.", color: "#0891B2", bg: "#ECFEFF" },
  { icon: <CloudRain size={22} />, title: "Rainfall Analysis", description: "Assess rainfall adequacy, effective precipitation, surplus & deficit across seasons.", color: "#06B6D4", bg: "#CFFAFE" },
  { icon: <BarChart3 size={22} />, title: "Soil Moisture Modelling", description: "Dynamic water balance simulation with field capacity and wilting point by soil type.", color: "#6366F1", bg: "#EEF2FF" },
  { icon: <Map size={22} />, title: "Multi-Farm Management", description: "Manage multiple farms with individual crop profiles and real-time budget comparisons.", color: "#059669", bg: "#D1FAE5" },
  { icon: <Bell size={22} />, title: "Smart Alerts", description: "Proactive alerts for water deficit, heat stress, excessive rainfall and irrigation scheduling.", color: "#D97706", bg: "#FEF3C7" },
  { icon: <Brain size={22} />, title: "AI Recommendations", description: "Data-driven irrigation guidance tailored to crop type, growth stage and weather conditions.", color: "#8B5CF6", bg: "#F5F3FF" },
];

const steps = [
  { step: "01", title: "Set Up Your Farm", icon: <Sprout size={26} />, description: "Add location, crop type, soil type and area. Our system calibrates all models to your conditions." },
  { step: "02", title: "Input Weather Data", icon: <Wind size={26} />, description: "Enter temperature, humidity, wind speed and rainfall. The engine computes ET₀ and ETc in real time." },
  { step: "03", title: "Get Actionable Insights", icon: <Activity size={26} />, description: "Receive water budget reports, risk assessments, irrigation schedules and smart recommendations." },
];

const testimonials = [
  { name: "Dr. Priya Sharma", role: "Agronomist, ICAR-CRIDA", quote: "AquaSync's Hargreaves-Samani implementation is the most accurate tool I've used for rain-fed zone calculations. Replaced our Excel sheets completely.", avatar: "PS", color: "#0891B2" },
  { name: "Ramesh Patil", role: "Progressive Farmer, Maharashtra", quote: "I manage 3 farms with different crops. AquaSync tells me exactly when to irrigate and how much. Saved 35% water last season.", avatar: "RP", color: "#059669" },
  { name: "Dr. Anjali Nair", role: "Water Resources Researcher, NIT", quote: "The soil moisture balance model with soil type calibration is scientifically rigorous. Perfect for my research on semi-arid agriculture.", avatar: "AN", color: "#6366F1" },
];

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Testimonials", href: "#testimonials" },
];

/* ─── Page ─── */
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handle);
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <div style={{ background: "#F0FDFD", color: "#0F172A", minHeight: "100vh" }}>

      {/* ═══════════ NAVBAR ═══════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: 64, padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "all 0.25s ease",
        background: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.75)",
        backdropFilter: "blur(16px)",
        borderBottom: scrolled ? "1px solid rgba(8,145,178,0.12)" : "1px solid transparent",
        boxShadow: scrolled ? "0 1px 16px rgba(8,145,178,0.08)" : "none",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#0891B2,#06B6D4)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(8,145,178,0.30)" }}>
            <Droplets size={19} color="white" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.03em" }}>
            Aqua<span style={{ color: "#0891B2" }}>Sync</span>
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden md:flex">
          {navLinks.map(l => (
            <a key={l.label} href={l.href} style={{ color: "#64748B", fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#0891B2")}
              onMouseLeave={e => (e.currentTarget.style.color = "#64748B")}>
              {l.label}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/sign-in" style={{ padding: "7px 16px", borderRadius: 9, fontSize: 14, fontWeight: 600, color: "#475569", textDecoration: "none", transition: "color 0.14s" }}
            onMouseEnter={(e: any) => (e.currentTarget.style.color = "#0891B2")}
            onMouseLeave={(e: any) => (e.currentTarget.style.color = "#475569")}>
            Sign in
          </Link>
          <Link href="/sign-up" style={{ padding: "8px 18px", background: "#0891B2", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "white", textDecoration: "none", boxShadow: "0 4px 12px rgba(8,145,178,0.30)", transition: "all 0.14s" }}
            onMouseEnter={(e: any) => (e.currentTarget.style.background = "#0E7490")}
            onMouseLeave={(e: any) => (e.currentTarget.style.background = "#0891B2")}>
            Get Started
          </Link>
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", padding: 8 }}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: "fixed", top: 64, left: 0, right: 0, background: "#fff", borderBottom: "1px solid #E2F5F8", padding: "16px 24px", zIndex: 49 }}>
          {navLinks.map(l => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
              style={{ display: "block", padding: "12px 0", color: "#334155", fontSize: 16, textDecoration: "none", borderBottom: "1px solid #E2F5F8" }}>
              {l.label}
            </a>
          ))}
        </div>
      )}

      {/* ═══════════ HERO ═══════════ */}
      <section style={{
        minHeight: "100vh",
        display: "flex", alignItems: "center",
        background: "linear-gradient(150deg, #F0FDFD 0%, #ECFEFF 40%, #CFFAFE 100%)",
        position: "relative", overflow: "hidden",
        paddingTop: 64,
      }}>
        {/* Background decoration */}
        <div style={{ position: "absolute", top: -100, right: -100, width: 500, height: 500, background: "radial-gradient(circle, rgba(8,145,178,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 400, height: 400, background: "radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 32px", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="grid-cols-1 lg:grid-cols-2">

          {/* Left: copy */}
          <div>
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#CFFAFE", border: "1px solid #A5F3FC", borderRadius: 999, padding: "5px 14px", marginBottom: 28 }}>
              <Shield size={13} color="#0891B2" />
              <span style={{ fontSize: 12.5, color: "#0891B2", fontWeight: 600 }}>Powered by FAO-56 Hargreaves-Samani Model</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              style={{ fontSize: "clamp(38px, 5vw, 60px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.04em", lineHeight: 1.08, marginBottom: 22 }}>
              Water Budgeting{" "}
              <span style={{ background: "linear-gradient(135deg,#0891B2,#06B6D4,#22D3EE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Reimagined
              </span>{" "}
              for Rain-Fed Farms
            </motion.h1>

            {/* Subline */}
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              style={{ fontSize: 17, color: "#475569", lineHeight: 1.75, marginBottom: 36, maxWidth: 480 }}>
              Scientifically compute ET₀, ETc, soil moisture balance, and irrigation requirements. Manage multiple farms with real-time risk assessment and smart recommendations.
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 36 }}>
              <Link href="/sign-up" style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "13px 26px", background: "#0891B2", borderRadius: 12, fontSize: 15, fontWeight: 700, color: "white", textDecoration: "none", boxShadow: "0 6px 20px rgba(8,145,178,0.35)", transition: "all 0.15s" }}
                onMouseEnter={(e: any) => { e.currentTarget.style.background = "#0E7490"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(8,145,178,0.45)"; }}
                onMouseLeave={(e: any) => { e.currentTarget.style.background = "#0891B2"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(8,145,178,0.35)"; }}>
                Start for Free <ArrowRight size={16} />
              </Link>
              <Link href="#how-it-works" style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "13px 26px", background: "white", border: "1.5px solid #A5F3FC", borderRadius: 12, fontSize: 15, fontWeight: 600, color: "#334155", textDecoration: "none", transition: "all 0.15s" }}
                onMouseEnter={(e: any) => { e.currentTarget.style.borderColor = "#0891B2"; e.currentTarget.style.color = "#0891B2"; }}
                onMouseLeave={(e: any) => { e.currentTarget.style.borderColor = "#A5F3FC"; e.currentTarget.style.color = "#334155"; }}>
                See How It Works
              </Link>
            </motion.div>

            {/* Trust row */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
              style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              {["No credit card required", "FAO-56 Standard", "10+ Crop Profiles"].map(item => (
                <span key={item} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#64748B", fontWeight: 500 }}>
                  <CheckCircle size={13} color="#059669" /> {item}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: hero image */}
          <motion.div initial={{ opacity: 0, x: 32, scale: 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "relative" }}>
            {/* Image card */}
            <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 64px rgba(8,145,178,0.22), 0 4px 16px rgba(0,0,0,0.10)", border: "1px solid rgba(8,145,178,0.15)" }}>
              <Image
                src="/hero-farm.jpg"
                alt="Rain-fed farm being irrigated — AquaSync water budgeting"
                width={600}
                height={420}
                style={{ display: "block", width: "100%", height: "auto", objectFit: "cover" }}
                priority
              />
              {/* Subtle overlay gradient at bottom to blend */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(to top, rgba(8,145,178,0.18), transparent)" }} />
            </div>

            {/* Floating stat card — top left */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}
              style={{ position: "absolute", top: -18, left: -18, background: "white", borderRadius: 14, padding: "12px 16px", boxShadow: "0 8px 28px rgba(8,145,178,0.18)", border: "1px solid #A5F3FC", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, background: "#CFFAFE", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Droplets size={18} color="#0891B2" />
              </div>
              <div>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "#0891B2", lineHeight: 1 }}>40%</p>
                <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Water Saved</p>
              </div>
            </motion.div>

            {/* Floating stat card — bottom right */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.85 }}
              style={{ position: "absolute", bottom: -18, right: -18, background: "white", borderRadius: 14, padding: "12px 16px", boxShadow: "0 8px 28px rgba(8,145,178,0.18)", border: "1px solid #A5F3FC", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, background: "#D1FAE5", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Activity size={18} color="#059669" />
              </div>
              <div>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "#059669", lineHeight: 1 }}>97%</p>
                <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>ET₀ Accuracy</p>
              </div>
            </motion.div>

            {/* Floating badge — bottom left */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.0 }}
              style={{ position: "absolute", bottom: 28, left: -14, background: "#0891B2", borderRadius: 10, padding: "8px 14px", boxShadow: "0 6px 18px rgba(8,145,178,0.35)", display: "flex", alignItems: "center", gap: 8 }}>
              <span className="status-dot live" style={{ background: "#FFFFFF", boxShadow: "0 0 6px rgba(255,255,255,0.6)" } as any} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "white" }}>Live Monitoring Active</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section style={{ padding: "72px 32px", background: "#0891B2" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32, textAlign: "center" }}>
          {[
            { value: 1200, suffix: "+", label: "Farms Monitored", icon: <Map size={26} /> },
            { value: 40, suffix: "%", label: "Avg Water Savings", icon: <Droplets size={26} /> },
            { value: 97, suffix: "%", label: "ET₀ Accuracy", icon: <Activity size={26} /> },
            { value: 10, suffix: "+", label: "Crop Profiles", icon: <Sprout size={26} /> },
          ].map(s => (
            <div key={s.label}>
              <div style={{ color: "rgba(255,255,255,0.60)", marginBottom: 10, display: "flex", justifyContent: "center" }}>{s.icon}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "clamp(32px,5vw,48px)", fontWeight: 900, color: "white", lineHeight: 1 }}>
                <Counter value={s.value} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", marginTop: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="features" style={{ padding: "96px 32px", background: "#F0FDFD" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#CFFAFE", border: "1px solid #A5F3FC", borderRadius: 999, padding: "5px 14px", marginBottom: 18 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "#0891B2" }}>Powerful Capabilities</span>
            </div>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#0F172A", marginBottom: 14 }}>
              Everything for precision<br />water management
            </h2>
            <p style={{ fontSize: 17, color: "#64748B", maxWidth: 500, margin: "0 auto" }}>
              Built on peer-reviewed agronomy science, designed for real-world farm operations.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.08 }}
                style={{ background: "#FFFFFF", border: "1px solid #E2F5F8", borderRadius: 16, padding: "26px", transition: "all 0.2s ease" }}
                whileHover={{ boxShadow: `0 8px 28px rgba(8,145,178,0.12)`, y: -3, borderColor: f.color + "40" } as any}>
                <div style={{ width: 48, height: 48, background: f.bg, border: `1px solid ${f.color}25`, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", color: f.color, marginBottom: 18 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16.5, fontWeight: 700, marginBottom: 9, color: "#0F172A", letterSpacing: "-0.02em" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7 }}>{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how-it-works" style={{ padding: "96px 32px", background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#0F172A", marginBottom: 14 }}>Up and running in minutes</h2>
            <p style={{ fontSize: 17, color: "#64748B", maxWidth: 460, margin: "0 auto" }}>No complex setup. No agronomist degree needed. AquaSync does the science for you.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 24 }}>
            {steps.map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.12 }}
                style={{ background: "#F8FFFE", border: "1px solid #E2F5F8", borderRadius: 20, padding: "30px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -16, right: -8, fontSize: 100, fontWeight: 900, color: "rgba(8,145,178,0.05)", lineHeight: 1, letterSpacing: "-0.05em", fontFamily: "'Inter',sans-serif" }}>{s.step}</div>
                <div style={{ width: 52, height: 52, background: "linear-gradient(135deg,#0891B2,#06B6D4)", borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "center", color: "white", marginBottom: 22, boxShadow: "0 6px 18px rgba(8,145,178,0.28)" }}>{s.icon}</div>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.09em", color: "#0891B2", textTransform: "uppercase", marginBottom: 9 }}>Step {s.step}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: "#0F172A", letterSpacing: "-0.02em" }}>{s.title}</h3>
                <p style={{ fontSize: 14.5, color: "#64748B", lineHeight: 1.7 }}>{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section id="testimonials" style={{ padding: "96px 32px", background: "#F0FDFD" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#0F172A", marginBottom: 12 }}>Trusted by agronomists & farmers</h2>
            <p style={{ fontSize: 16, color: "#64748B" }}>Real results from people managing real water challenges</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.10 }}
                style={{ background: "#FFFFFF", border: "1px solid #E2F5F8", borderRadius: 18, padding: "26px", boxShadow: "0 1px 4px rgba(8,145,178,0.06)" }}>
                <div style={{ color: "#F59E0B", marginBottom: 16, fontSize: 15, letterSpacing: 2 }}>{"★".repeat(5)}</div>
                <p style={{ fontSize: 14.5, color: "#475569", lineHeight: 1.75, marginBottom: 22, fontStyle: "italic" }}>&ldquo;{t.quote}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, background: `linear-gradient(135deg,${t.color},${t.color}99)`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 13 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: "#0F172A" }}>{t.name}</div>
                    <div style={{ fontSize: 12.5, color: "#94A3B8" }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section style={{ padding: "96px 32px", background: "linear-gradient(135deg,#EFF9FC 0%,#CFFAFE 50%,#A5F3FC 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(8,145,178,0.10) 0%, transparent 70%)" }} />
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div style={{ width: 68, height: 68, background: "#0891B2", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", boxShadow: "0 0 0 12px rgba(8,145,178,0.12), 0 8px 28px rgba(8,145,178,0.35)" }}>
              <Zap size={30} color="white" />
            </div>
            <h2 style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: 18 }}>
              Start optimizing your<br />water use today
            </h2>
            <p style={{ fontSize: 17, color: "#475569", marginBottom: 40, lineHeight: 1.65 }}>
              Join hundreds of farmers and agronomists making smarter water decisions powered by science.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
              <Link href="/sign-up" style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "13px 28px", background: "#0891B2", borderRadius: 12, fontSize: 15, fontWeight: 700, color: "white", textDecoration: "none", boxShadow: "0 6px 20px rgba(8,145,178,0.38)", transition: "all 0.15s" }}
                onMouseEnter={(e: any) => (e.currentTarget.style.background = "#0E7490")}
                onMouseLeave={(e: any) => (e.currentTarget.style.background = "#0891B2")}>
                Create Free Account <ChevronRight size={17} />
              </Link>
              <Link href="/sign-in" style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "13px 28px", background: "white", border: "1.5px solid #A5F3FC", borderRadius: 12, fontSize: 15, fontWeight: 600, color: "#334155", textDecoration: "none", transition: "all 0.15s" }}>
                Sign in
              </Link>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
              {["Free forever plan", "Science-based calculations", "Real-time monitoring"].map(item => (
                <span key={item} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748B", fontWeight: 500 }}>
                  <CheckCircle size={14} color="#059669" /> {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer style={{ padding: "32px 32px", background: "#FFFFFF", borderTop: "1px solid #E2F5F8", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#0891B2,#06B6D4)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Droplets size={14} color="white" />
          </div>
          <span style={{ fontWeight: 700, color: "#0F172A", fontSize: 15 }}>AquaSync</span>
        </div>
        <p style={{ fontSize: 12.5, color: "#94A3B8" }}>© 2026 AquaSync. Water Budgeting for Rain-Fed Agriculture. Built with FAO-56 standards.</p>
      </footer>
    </div>
  );
}
