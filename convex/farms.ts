import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createFarm = mutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        location: v.string(),
        state: v.optional(v.string()),
        area: v.number(),
        soilType: v.union(
            v.literal("sandy"), v.literal("loamy"), v.literal("clay"),
            v.literal("silty"), v.literal("peaty"), v.literal("chalky")
        ),
        cropType: v.string(),
        irrigationType: v.union(
            v.literal("rain-fed"), v.literal("drip"), v.literal("sprinkler"), v.literal("flood")
        ),
        latitude: v.optional(v.number()),
        longitude: v.optional(v.number()),
        elevation: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { clerkId, ...farmData } = args;
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .first();
        if (!user) throw new Error("User not found");

        return await ctx.db.insert("farms", {
            ...farmData,
            userId: user._id,
            createdAt: Date.now(),
        });
    },
});

export const getFarms = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();
        if (!user) return [];

        return await ctx.db
            .query("farms")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();
    },
});

export const getFarm = query({
    args: { farmId: v.id("farms") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.farmId);
    },
});

export const updateFarm = mutation({
    args: {
        farmId: v.id("farms"),
        name: v.optional(v.string()),
        location: v.optional(v.string()),
        area: v.optional(v.number()),
        soilType: v.optional(v.union(
            v.literal("sandy"), v.literal("loamy"), v.literal("clay"),
            v.literal("silty"), v.literal("peaty"), v.literal("chalky")
        )),
        cropType: v.optional(v.string()),
        irrigationType: v.optional(v.union(
            v.literal("rain-fed"), v.literal("drip"), v.literal("sprinkler"), v.literal("flood")
        )),
    },
    handler: async (ctx, args) => {
        const { farmId, ...rest } = args;
        return await ctx.db.patch(farmId, rest);
    },
});

export const deleteFarm = mutation({
    args: { farmId: v.id("farms") },
    handler: async (ctx, args) => {
        return await ctx.db.delete(args.farmId);
    },
});
