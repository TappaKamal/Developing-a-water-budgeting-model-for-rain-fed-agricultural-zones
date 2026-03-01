import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveWaterBudget = mutation({
    args: {
        clerkId: v.string(),
        farmId: v.id("farms"),
        month: v.number(),
        year: v.number(),
        maxTemp: v.number(),
        minTemp: v.number(),
        meanTemp: v.number(),
        rainfall: v.number(),
        effectiveRainfall: v.number(),
        humidity: v.number(),
        windSpeed: v.number(),
        solarRadiation: v.optional(v.number()),
        growthStage: v.union(
            v.literal("initial"), v.literal("crop_development"),
            v.literal("mid_season"), v.literal("late_season")
        ),
        et0: v.number(),
        kc: v.number(),
        etc: v.number(),
        soilMoistureStart: v.number(),
        soilMoistureEnd: v.number(),
        waterDeficit: v.number(),
        waterSurplus: v.number(),
        waterStressIndex: v.number(),
        riskLevel: v.union(
            v.literal("critical"), v.literal("high"),
            v.literal("moderate"), v.literal("low")
        ),
        irrigationRequired: v.number(),
        recommendations: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const { clerkId, ...data } = args;
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .first();
        if (!user) throw new Error("User not found");

        // Check for existing record for same farm/month/year
        const existing = await ctx.db
            .query("waterBudgets")
            .withIndex("by_farm_month_year", (q) =>
                q.eq("farmId", data.farmId).eq("month", data.month).eq("year", data.year)
            )
            .first();

        if (existing) {
            return await ctx.db.patch(existing._id, { ...data, userId: user._id });
        }

        return await ctx.db.insert("waterBudgets", {
            ...data,
            userId: user._id,
            createdAt: Date.now(),
        });
    },
});

export const getWaterBudgets = query({
    args: { farmId: v.id("farms") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("waterBudgets")
            .withIndex("by_farm", (q) => q.eq("farmId", args.farmId))
            .order("desc")
            .collect();
    },
});

export const getUserWaterBudgets = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();
        if (!user) return [];

        return await ctx.db
            .query("waterBudgets")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .take(50);
    },
});

export const getMonthlyBudget = query({
    args: { farmId: v.id("farms"), month: v.number(), year: v.number() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("waterBudgets")
            .withIndex("by_farm_month_year", (q) =>
                q.eq("farmId", args.farmId).eq("month", args.month).eq("year", args.year)
            )
            .first();
    },
});
