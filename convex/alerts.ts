import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createAlert = mutation({
    args: {
        clerkId: v.string(),
        farmId: v.optional(v.id("farms")),
        type: v.union(
            v.literal("water_deficit"), v.literal("soil_moisture_low"),
            v.literal("excessive_rainfall"), v.literal("heat_stress"),
            v.literal("irrigation_due"), v.literal("season_warning")
        ),
        severity: v.union(v.literal("critical"), v.literal("warning"), v.literal("info")),
        title: v.string(),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const { clerkId, ...data } = args;
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .first();
        if (!user) throw new Error("User not found");

        return await ctx.db.insert("alerts", {
            ...data,
            userId: user._id,
            isRead: false,
            isDismissed: false,
            createdAt: Date.now(),
        });
    },
});

export const getAlerts = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();
        if (!user) return [];

        return await ctx.db
            .query("alerts")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .filter((q) => q.eq(q.field("isDismissed"), false))
            .collect();
    },
});

export const markAlertRead = mutation({
    args: { alertId: v.id("alerts") },
    handler: async (ctx, args) => {
        return await ctx.db.patch(args.alertId, { isRead: true });
    },
});

export const dismissAlert = mutation({
    args: { alertId: v.id("alerts") },
    handler: async (ctx, args) => {
        return await ctx.db.patch(args.alertId, { isDismissed: true, isRead: true });
    },
});

export const getUnreadCount = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();
        if (!user) return 0;

        const alerts = await ctx.db
            .query("alerts")
            .withIndex("by_user_read", (q) => q.eq("userId", user._id).eq("isRead", false))
            .filter((q) => q.eq(q.field("isDismissed"), false))
            .collect();
        return alerts.length;
    },
});
