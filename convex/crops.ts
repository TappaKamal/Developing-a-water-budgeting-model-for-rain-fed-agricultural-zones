import { query } from "./_generated/server";
import { v } from "convex/values";

// Crop coefficient database (FAO-56 standard)
export const CROP_PROFILES = [
    {
        name: "wheat", commonName: "Wheat", category: "Cereals", totalDays: 120,
        growthStages: { initial: { days: 20, kc: 0.3 }, cropDevelopment: { days: 30, kcStart: 0.3, kcEnd: 1.15 }, midSeason: { days: 40, kc: 1.15 }, lateSeason: { days: 30, kcEnd: 0.4 } },
        rootDepth: 1.5, soilWaterDepletionFactor: 0.55
    },
    {
        name: "rice", commonName: "Rice (Paddy)", category: "Cereals", totalDays: 130,
        growthStages: { initial: { days: 30, kc: 1.05 }, cropDevelopment: { days: 30, kcStart: 1.05, kcEnd: 1.2 }, midSeason: { days: 40, kc: 1.2 }, lateSeason: { days: 30, kcEnd: 0.75 } },
        rootDepth: 0.5, soilWaterDepletionFactor: 0.2
    },
    {
        name: "maize", commonName: "Maize / Corn", category: "Cereals", totalDays: 125,
        growthStages: { initial: { days: 20, kc: 0.3 }, cropDevelopment: { days: 35, kcStart: 0.3, kcEnd: 1.2 }, midSeason: { days: 40, kc: 1.2 }, lateSeason: { days: 30, kcEnd: 0.6 } },
        rootDepth: 1.2, soilWaterDepletionFactor: 0.55
    },
    {
        name: "cotton", commonName: "Cotton", category: "Fiber", totalDays: 180,
        growthStages: { initial: { days: 30, kc: 0.35 }, cropDevelopment: { days: 50, kcStart: 0.35, kcEnd: 1.15 }, midSeason: { days: 55, kc: 1.15 }, lateSeason: { days: 45, kcEnd: 0.7 } },
        rootDepth: 1.0, soilWaterDepletionFactor: 0.65
    },
    {
        name: "soybean", commonName: "Soybean", category: "Legumes", totalDays: 140,
        growthStages: { initial: { days: 20, kc: 0.4 }, cropDevelopment: { days: 30, kcStart: 0.4, kcEnd: 1.15 }, midSeason: { days: 40, kc: 1.15 }, lateSeason: { days: 25, kcEnd: 0.5 } },
        rootDepth: 0.9, soilWaterDepletionFactor: 0.5
    },
    {
        name: "sugarcane", commonName: "Sugarcane", category: "Sugar Crops", totalDays: 365,
        growthStages: { initial: { days: 35, kc: 0.4 }, cropDevelopment: { days: 60, kcStart: 0.4, kcEnd: 1.25 }, midSeason: { days: 190, kc: 1.25 }, lateSeason: { days: 120, kcEnd: 0.75 } },
        rootDepth: 1.2, soilWaterDepletionFactor: 0.65
    },
    {
        name: "groundnut", commonName: "Groundnut / Peanut", category: "Legumes", totalDays: 130,
        growthStages: { initial: { days: 25, kc: 0.4 }, cropDevelopment: { days: 35, kcStart: 0.4, kcEnd: 1.15 }, midSeason: { days: 45, kc: 1.15 }, lateSeason: { days: 25, kcEnd: 0.6 } },
        rootDepth: 0.5, soilWaterDepletionFactor: 0.5
    },
    {
        name: "tomato", commonName: "Tomato", category: "Vegetables", totalDays: 125,
        growthStages: { initial: { days: 30, kc: 0.6 }, cropDevelopment: { days: 40, kcStart: 0.6, kcEnd: 1.15 }, midSeason: { days: 40, kc: 1.15 }, lateSeason: { days: 25, kcEnd: 0.8 } },
        rootDepth: 0.7, soilWaterDepletionFactor: 0.4
    },
    {
        name: "millet", commonName: "Pearl Millet", category: "Cereals", totalDays: 105,
        growthStages: { initial: { days: 15, kc: 0.3 }, cropDevelopment: { days: 25, kcStart: 0.3, kcEnd: 1.0 }, midSeason: { days: 40, kc: 1.0 }, lateSeason: { days: 25, kcEnd: 0.3 } },
        rootDepth: 1.5, soilWaterDepletionFactor: 0.55
    },
    {
        name: "sorghum", commonName: "Sorghum", category: "Cereals", totalDays: 130,
        growthStages: { initial: { days: 20, kc: 0.3 }, cropDevelopment: { days: 30, kcStart: 0.3, kcEnd: 1.0 }, midSeason: { days: 40, kc: 1.0 }, lateSeason: { days: 30, kcEnd: 0.55 } },
        rootDepth: 1.5, soilWaterDepletionFactor: 0.55
    },
];

export const getCropProfiles = query({
    args: {},
    handler: async (ctx) => {
        return CROP_PROFILES;
    },
});
