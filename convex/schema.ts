import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        role: v.union(v.literal("farmer"), v.literal("agronomist"), v.literal("researcher")),
        region: v.optional(v.string()),
        units: v.optional(v.object({
            temperature: v.union(v.literal("C"), v.literal("F")),
            precipitation: v.union(v.literal("mm"), v.literal("inches")),
        })),
        onboardingComplete: v.boolean(),
        createdAt: v.number(),
    }).index("by_clerk_id", ["clerkId"]),

    farms: defineTable({
        userId: v.id("users"),
        name: v.string(),
        location: v.string(),
        state: v.optional(v.string()),
        area: v.number(), // hectares
        soilType: v.union(
            v.literal("sandy"),
            v.literal("loamy"),
            v.literal("clay"),
            v.literal("silty"),
            v.literal("peaty"),
            v.literal("chalky")
        ),
        cropType: v.string(),
        irrigationType: v.union(
            v.literal("rain-fed"),
            v.literal("drip"),
            v.literal("sprinkler"),
            v.literal("flood")
        ),
        latitude: v.optional(v.number()),
        longitude: v.optional(v.number()),
        elevation: v.optional(v.number()), // meters
        createdAt: v.number(),
    }).index("by_user", ["userId"]),

    waterBudgets: defineTable({
        farmId: v.id("farms"),
        userId: v.id("users"),
        month: v.number(), // 1-12
        year: v.number(),
        // Inputs
        maxTemp: v.number(), // °C
        minTemp: v.number(), // °C
        meanTemp: v.number(), // °C
        rainfall: v.number(), // mm
        effectiveRainfall: v.number(), // mm (80% of rainfall)
        humidity: v.number(), // %
        windSpeed: v.number(), // m/s
        solarRadiation: v.optional(v.number()), // MJ/m²/day
        growthStage: v.union(
            v.literal("initial"),
            v.literal("crop_development"),
            v.literal("mid_season"),
            v.literal("late_season")
        ),
        // Calculated outputs
        et0: v.number(), // Reference ET (mm/day)
        kc: v.number(), // Crop coefficient
        etc: v.number(), // Crop ET (mm/day)
        soilMoistureStart: v.number(), // mm
        soilMoistureEnd: v.number(), // mm
        waterDeficit: v.number(), // mm
        waterSurplus: v.number(), // mm
        waterStressIndex: v.number(), // 0-1
        riskLevel: v.union(
            v.literal("critical"),
            v.literal("high"),
            v.literal("moderate"),
            v.literal("low")
        ),
        irrigationRequired: v.number(), // mm
        recommendations: v.array(v.string()),
        createdAt: v.number(),
    })
        .index("by_farm", ["farmId"])
        .index("by_user", ["userId"])
        .index("by_farm_month_year", ["farmId", "month", "year"]),

    weatherData: defineTable({
        farmId: v.id("farms"),
        userId: v.id("users"),
        date: v.string(), // ISO date string YYYY-MM-DD
        maxTemp: v.number(),
        minTemp: v.number(),
        humidity: v.number(),
        windSpeed: v.number(),
        rainfall: v.number(),
        solarRadiation: v.optional(v.number()),
        evaporation: v.optional(v.number()),
        source: v.union(v.literal("manual"), v.literal("api"), v.literal("sensor")),
        createdAt: v.number(),
    })
        .index("by_farm", ["farmId"])
        .index("by_farm_date", ["farmId", "date"]),

    alerts: defineTable({
        userId: v.id("users"),
        farmId: v.optional(v.id("farms")),
        type: v.union(
            v.literal("water_deficit"),
            v.literal("soil_moisture_low"),
            v.literal("excessive_rainfall"),
            v.literal("heat_stress"),
            v.literal("irrigation_due"),
            v.literal("season_warning")
        ),
        severity: v.union(
            v.literal("critical"),
            v.literal("warning"),
            v.literal("info")
        ),
        title: v.string(),
        message: v.string(),
        isRead: v.boolean(),
        isDismissed: v.boolean(),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_user_read", ["userId", "isRead"]),

    cropProfiles: defineTable({
        name: v.string(),
        commonName: v.string(),
        category: v.string(),
        totalDays: v.number(),
        growthStages: v.object({
            initial: v.object({ days: v.number(), kc: v.number() }),
            cropDevelopment: v.object({ days: v.number(), kcStart: v.number(), kcEnd: v.number() }),
            midSeason: v.object({ days: v.number(), kc: v.number() }),
            lateSeason: v.object({ days: v.number(), kcEnd: v.number() }),
        }),
        rootDepth: v.number(), // meters
        soilWaterDepletionFactor: v.number(), // fraction
        description: v.optional(v.string()),
    }).index("by_name", ["name"]),
});
