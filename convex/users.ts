import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        role: v.union(v.literal("farmer"), v.literal("agronomist"), v.literal("researcher")),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (existing) return existing._id;

        return await ctx.db.insert("users", {
            ...args,
            onboardingComplete: false,
            createdAt: Date.now(),
        });
    },
});

export const getUser = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();
    },
});

export const updateUser = mutation({
    args: {
        clerkId: v.string(),
        name: v.optional(v.string()),
        role: v.optional(v.union(v.literal("farmer"), v.literal("agronomist"), v.literal("researcher"))),
        region: v.optional(v.string()),
        units: v.optional(v.object({
            temperature: v.union(v.literal("C"), v.literal("F")),
            precipitation: v.union(v.literal("mm"), v.literal("inches")),
        })),
        onboardingComplete: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { clerkId, ...rest } = args;
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .first();
        if (!user) throw new Error("User not found");
        return await ctx.db.patch(user._id, rest);
    },
});
