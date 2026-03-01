import { SignUp } from "@clerk/nextjs";
import { Droplets } from "lucide-react";

export default function SignUpPage() {
    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(150deg, #F0FDFD 0%, #ECFEFF 40%, #CFFAFE 100%)",
            padding: "24px",
        }}>
            {/* Decorative orbs */}
            <div style={{ position: "fixed", top: "10%", right: "5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(8,145,178,0.10) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
            <div style={{ position: "fixed", bottom: "10%", left: "5%", width: 300, height: 300, background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

            <div style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 1 }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <div style={{ width: 54, height: 54, background: "linear-gradient(135deg,#0891B2,#06B6D4)", borderRadius: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14, boxShadow: "0 8px 24px rgba(8,145,178,0.30)" }}>
                        <Droplets size={26} color="white" />
                    </div>
                    <h1 style={{ color: "#0F172A", fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em" }}>
                        Aqua<span style={{ color: "#0891B2" }}>Sync</span>
                    </h1>
                    <p style={{ color: "#64748B", fontSize: 14, marginTop: 5 }}>Create your free account</p>
                </div>

                <SignUp
                    appearance={{
                        elements: {
                            rootBox: { width: "100%" },
                            card: {
                                background: "#FFFFFF",
                                border: "1px solid rgba(8,145,178,0.15)",
                                borderRadius: "20px",
                                boxShadow: "0 8px 40px rgba(8,145,178,0.12)",
                            },
                            headerTitle: { color: "#0F172A", fontSize: "20px", fontWeight: 700 },
                            headerSubtitle: { color: "#64748B" },
                            formFieldLabel: { color: "#475569", fontWeight: 600, fontSize: "13px" },
                            formFieldInput: {
                                background: "#F8FFFE",
                                border: "1.5px solid #E2F5F8",
                                color: "#0F172A",
                                borderRadius: "10px",
                            },
                            formButtonPrimary: {
                                background: "linear-gradient(135deg,#0891B2,#0E7490)",
                                borderRadius: "10px",
                                fontWeight: 700,
                                boxShadow: "0 4px 14px rgba(8,145,178,0.35)",
                            },
                            footerActionLink: { color: "#0891B2", fontWeight: 600 },
                            identityPreviewText: { color: "#475569" },
                            dividerLine: { background: "#E2F5F8" },
                            dividerText: { color: "#94A3B8" },
                            socialButtonsBlockButton: {
                                background: "#FFFFFF",
                                border: "1.5px solid #E2E8F0",
                                color: "#334155",
                            },
                            socialButtonsBlockButtonText: { color: "#334155", fontWeight: 600 },
                        },
                    }}
                />
            </div>
        </div>
    );
}
