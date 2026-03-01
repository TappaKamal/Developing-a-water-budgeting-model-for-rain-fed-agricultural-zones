"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useClerk } from "@clerk/nextjs";
import {
    LayoutDashboard, Droplets, MapPin, Cloud, Bell,
    BarChart3, Settings, ChevronLeft, ChevronRight, AlignLeft, LogOut
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/water-budget", label: "Water Budget", icon: Droplets },
    { href: "/dashboard/farms", label: "Farms", icon: MapPin },
    { href: "/dashboard/weather", label: "Climate", icon: Cloud },
    { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
    { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function Sidebar({
    collapsed, onCollapse, onClose,
}: { collapsed: boolean; onCollapse: () => void; onClose?: () => void }) {
    const pathname = usePathname();
    const { signOut } = useClerk();

    return (
        <div style={{
            width: collapsed ? 64 : 240,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "#FFFFFF",
            borderRight: "1px solid #E2F5F8",
            transition: "width 0.25s cubic-bezier(0.16,1,0.3,1)",
            overflow: "hidden",
            flexShrink: 0,
        }}>
            {/* Logo */}
            <div style={{
                height: 56,
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
                borderBottom: "1px solid #E2F5F8",
                gap: 10,
                flexShrink: 0,
            }}>
                <div style={{
                    width: 32, height: 32,
                    flexShrink: 0,
                    background: "linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)",
                    borderRadius: 9,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(8,145,178,0.30)",
                }}>
                    <Droplets size={16} color="white" />
                </div>
                {!collapsed && (
                    <span style={{ fontWeight: 700, fontSize: 16, color: "#0F172A", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
                        Aqua<span style={{ color: "#0891B2" }}>Sync</span>
                    </span>
                )}
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: "10px 6px", overflowY: "auto" }}>
                {!collapsed && (
                    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94A3B8", padding: "8px 8px 6px" }}>
                        Navigation
                    </p>
                )}
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: collapsed ? "9px" : "8px 10px",
                                justifyContent: collapsed ? "center" : "flex-start",
                                borderRadius: 9,
                                marginBottom: 2,
                                textDecoration: "none",
                                transition: "all 0.12s ease",
                                background: isActive ? "#EFF9FC" : "transparent",
                                color: isActive ? "#0891B2" : "#64748B",
                                fontWeight: isActive ? 600 : 500,
                                fontSize: 13.5,
                                borderLeft: isActive ? "2px solid #0891B2" : "2px solid transparent",
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = "#F0FDFD";
                                    e.currentTarget.style.color = "#0891B2";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = "transparent";
                                    e.currentTarget.style.color = "#64748B";
                                }
                            }}
                        >
                            <Icon size={16} style={{ flexShrink: 0 }} />
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div style={{
                padding: "10px 6px",
                borderTop: "1px solid #E2F5F8",
                display: "flex", flexDirection: "column", gap: 4,
                flexShrink: 0,
            }}>
                <button
                    onClick={onCollapse}
                    style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 10px",
                        justifyContent: collapsed ? "center" : "flex-start",
                        background: "transparent", border: "none",
                        borderRadius: 9, cursor: "pointer",
                        color: "#94A3B8", fontSize: 13,
                        transition: "all 0.12s ease", width: "100%",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#F0FDFD"; e.currentTarget.style.color = "#0891B2"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94A3B8"; }}
                >
                    {collapsed ? <ChevronRight size={15} /> : <><ChevronLeft size={15} /><span>Collapse</span></>}
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px" }}>
                    <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: { width: 28, height: 28 } } }} />
                    {!collapsed && <span style={{ fontSize: 12, color: "#94A3B8" }}>Account</span>}
                </div>
                <button
                    onClick={() => signOut({ redirectUrl: "/" })}
                    style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 10px",
                        justifyContent: collapsed ? "center" : "flex-start",
                        background: "transparent", border: "none",
                        borderRadius: 9, cursor: "pointer",
                        color: "#EF4444", fontSize: 13,
                        transition: "all 0.12s ease", width: "100%",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = "#DC2626"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#EF4444"; }}
                    title="Sign out"
                >
                    <LogOut size={15} style={{ flexShrink: 0 }} />
                    {!collapsed && <span>Sign Out</span>}
                </button>
            </div>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    const currentPage = navItems.find(n =>
        pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href))
    );

    return (
        <div style={{ display: "flex", height: "100vh", background: "#F0FDFD", overflow: "hidden" }}>
            {/* Desktop sidebar */}
            <div className="hidden md:flex" style={{ height: "100%", flexShrink: 0 }}>
                <Sidebar collapsed={collapsed} onCollapse={() => setCollapsed(c => !c)} />
            </div>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}
                    onClick={() => setMobileOpen(false)}>
                    <div style={{ height: "100%", width: 240 }} onClick={e => e.stopPropagation()}>
                        <Sidebar collapsed={false} onCollapse={() => setMobileOpen(false)} onClose={() => setMobileOpen(false)} />
                    </div>
                </div>
            )}

            {/* Main */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
                {/* Header */}
                <header style={{
                    height: 56,
                    background: "#FFFFFF",
                    borderBottom: "1px solid #E2F5F8",
                    display: "flex", alignItems: "center",
                    padding: "0 20px", gap: 14, flexShrink: 0,
                    boxShadow: "0 1px 4px rgba(8,145,178,0.06)",
                }}>
                    <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}
                        style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer" }}>
                        <AlignLeft size={18} />
                    </button>
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#475569", letterSpacing: "-0.01em" }}>
                            {currentPage?.label ?? "Dashboard"}
                        </span>
                    </div>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "#ECFEFF", border: "1px solid #A5F3FC",
                        borderRadius: 999, padding: "5px 12px",
                    }}>
                        <span className="status-dot live" />
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#0891B2", letterSpacing: "0.03em" }}>
                            Rain-Fed Zone
                        </span>
                    </div>
                </header>

                <main style={{ flex: 1, overflowY: "auto", background: "#F0FDFD" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
