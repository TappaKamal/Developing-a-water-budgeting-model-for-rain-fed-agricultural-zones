import { NextResponse } from "next/server";

interface WaterBudgetInput {
    maxTemp: number;
    minTemp: number;
    humidity: number;
    windSpeed: number;
    rainfall: number;
    latitude: number;
    month: number;
    cropType: string;
    growthStage: "initial" | "crop_development" | "mid_season" | "late_season";
    soilType: string;
    soilMoistureStart: number;
    area: number; // hectares
}

// Extraterrestrial Radiation (Ra) calculation using FAO-56 method
function calculateRa(latitude: number, dayOfYear: number): number {
    const latRad = (latitude * Math.PI) / 180;
    const dr = 1 + 0.033 * Math.cos((2 * Math.PI * dayOfYear) / 365);
    const deltaAngle = 0.409 * Math.sin((2 * Math.PI * dayOfYear) / 365 - 1.39);
    const ws = Math.acos(-Math.tan(latRad) * Math.tan(deltaAngle));
    const Gsc = 0.082; // Solar constant MJ/m²/min
    const Ra =
        (24 * 60) / Math.PI *
        Gsc *
        dr *
        (ws * Math.sin(latRad) * Math.sin(deltaAngle) +
            Math.cos(latRad) * Math.cos(deltaAngle) * Math.sin(ws));
    return Math.max(Ra, 0);
}

// ET0 - Hargreaves-Samani equation (FAO recommended for data-scarce regions)
function calculateET0(
    tmax: number, tmin: number, tmean: number,
    ra: number
): number {
    const td = tmax - tmin;
    return 0.0023 * (tmean + 17.8) * Math.sqrt(Math.max(td, 0)) * ra;
}

// Crop coefficient (Kc) by growth stage
const KC_MAP: Record<string, Record<string, number>> = {
    wheat: { initial: 0.3, crop_development: 0.7, mid_season: 1.15, late_season: 0.4 },
    rice: { initial: 1.05, crop_development: 1.1, mid_season: 1.2, late_season: 0.75 },
    maize: { initial: 0.3, crop_development: 0.7, mid_season: 1.2, late_season: 0.6 },
    cotton: { initial: 0.35, crop_development: 0.75, mid_season: 1.15, late_season: 0.7 },
    soybean: { initial: 0.4, crop_development: 0.75, mid_season: 1.15, late_season: 0.5 },
    sugarcane: { initial: 0.4, crop_development: 0.8, mid_season: 1.25, late_season: 0.75 },
    groundnut: { initial: 0.4, crop_development: 0.75, mid_season: 1.15, late_season: 0.6 },
    tomato: { initial: 0.6, crop_development: 0.85, mid_season: 1.15, late_season: 0.8 },
    millet: { initial: 0.3, crop_development: 0.65, mid_season: 1.0, late_season: 0.3 },
    sorghum: { initial: 0.3, crop_development: 0.65, mid_season: 1.0, late_season: 0.55 },
};

// Soil water holding capacity (mm/m) by soil type
const SOIL_WHC: Record<string, { fc: number; wp: number }> = {
    sandy: { fc: 100, wp: 40 },
    loamy: { fc: 180, wp: 80 },
    clay: { fc: 220, wp: 120 },
    silty: { fc: 200, wp: 90 },
    peaty: { fc: 250, wp: 100 },
    chalky: { fc: 150, wp: 70 },
};

function generateRecommendations(
    deficit: number, surplus: number, waterStressIndex: number,
    riskLevel: string, cropType: string, growthStage: string
): string[] {
    const recs: string[] = [];

    if (deficit > 50) {
        recs.push(`Critical irrigation needed: Apply ${deficit.toFixed(0)}mm of water over the next 7-10 days.`);
    } else if (deficit > 20) {
        recs.push(`Supplemental irrigation recommended: ${deficit.toFixed(0)}mm deficit detected.`);
    }

    if (waterStressIndex > 0.7) {
        recs.push("Severe water stress detected. Consider drought-tolerant variety substitution.");
    }

    if (surplus > 80) {
        recs.push("Excessive water logged conditions. Ensure proper field drainage to prevent root rot.");
    }

    if (growthStage === "mid_season") {
        recs.push(`${cropType.charAt(0).toUpperCase() + cropType.slice(1)} is in critical mid-season growth — maintain consistent soil moisture at 70-80% field capacity.`);
    }

    if (riskLevel === "critical") {
        recs.push("Consider crop insurance and contact local agricultural extension for emergency support.");
    }

    if (growthStage === "late_season" && deficit > 0) {
        recs.push("Late-season deficit: reduce irrigation to 75% requirement to improve crop quality and harvest conditions.");
    }

    recs.push("Monitor soil moisture bi-weekly using tensiometers placed at root zone depth.");

    if (recs.length < 3) {
        recs.push("Water budget is within acceptable range. Continue current irrigation schedule.");
    }

    return recs;
}

export async function POST(request: Request) {
    try {
        const body: WaterBudgetInput = await request.json();
        const {
            maxTemp, minTemp, humidity, windSpeed, rainfall,
            latitude, month, cropType, growthStage,
            soilType, soilMoistureStart, area
        } = body;

        // Day of year (mid-month)
        const doy = Math.round((month - 0.5) * (365 / 12));

        // Mean temperature
        const meanTemp = (maxTemp + minTemp) / 2;

        // Extraterrestrial Radiation
        const ra = calculateRa(latitude, doy);

        // ET0 using Hargreaves-Samani
        const et0 = calculateET0(maxTemp, minTemp, meanTemp, ra);

        // Crop Coefficient (Kc)
        const cropNormalized = cropType.toLowerCase().replace(" ", "_");
        const kcTable = KC_MAP[cropNormalized] || KC_MAP["maize"];
        const kc = kcTable[growthStage] || 1.0;

        // Crop ET
        const etc = et0 * kc;

        // Monthly values (assuming 30-day month)
        const daysInMonth = 30;
        const et0Monthly = et0 * daysInMonth;
        const etcMonthly = etc * daysInMonth;

        // Effective rainfall (80% of total, per USDA method)
        const effectiveRainfall = rainfall * 0.8;

        // Soil moisture balance
        const soil = SOIL_WHC[soilType] || SOIL_WHC["loamy"];
        const maxSoilMoisture = soil.fc;
        const soilMoistureEnd = Math.min(
            maxSoilMoisture,
            Math.max(soil.wp, soilMoistureStart + effectiveRainfall - etcMonthly)
        );

        // Water deficit and surplus
        const waterDeficit = Math.max(0, etcMonthly - effectiveRainfall);
        const waterSurplus = Math.max(0, effectiveRainfall - etcMonthly);

        // Water Stress Index (0 = no stress, 1 = full stress)
        const waterStressIndex = effectiveRainfall >= etcMonthly
            ? 0
            : Math.min(1, waterDeficit / etcMonthly);

        // Irrigation required (accounting for soil moisture reserve)
        const irrigationRequired = Math.max(
            0,
            waterDeficit - (soilMoistureStart - soil.wp)
        );

        // Risk classification
        let riskLevel: "critical" | "high" | "moderate" | "low";
        if (waterStressIndex >= 0.7) riskLevel = "critical";
        else if (waterStressIndex >= 0.4) riskLevel = "high";
        else if (waterStressIndex >= 0.2) riskLevel = "moderate";
        else riskLevel = "low";

        // Generate smart recommendations
        const recommendations = generateRecommendations(
            waterDeficit, waterSurplus, waterStressIndex, riskLevel, cropType, growthStage
        );

        return NextResponse.json({
            success: true,
            results: {
                // ET Calculations
                et0: parseFloat(et0.toFixed(2)),
                et0Monthly: parseFloat(et0Monthly.toFixed(1)),
                kc,
                etc: parseFloat(etc.toFixed(2)),
                etcMonthly: parseFloat(etcMonthly.toFixed(1)),
                // Rainfall
                rainfall,
                effectiveRainfall: parseFloat(effectiveRainfall.toFixed(1)),
                // Soil moisture
                soilMoistureStart,
                soilMoistureEnd: parseFloat(soilMoistureEnd.toFixed(1)),
                soilFieldCapacity: maxSoilMoisture,
                soilWiltingPoint: soil.wp,
                // Balance
                waterDeficit: parseFloat(waterDeficit.toFixed(1)),
                waterSurplus: parseFloat(waterSurplus.toFixed(1)),
                irrigationRequired: parseFloat(irrigationRequired.toFixed(1)),
                // Stress & Risk
                waterStressIndex: parseFloat(waterStressIndex.toFixed(3)),
                riskLevel,
                // Area-based totals
                totalIrrigationVolume: parseFloat((irrigationRequired * area * 10).toFixed(0)), // m³
                // Inputs echoed back
                meanTemp: parseFloat(meanTemp.toFixed(1)),
                ra: parseFloat(ra.toFixed(2)),
                doy,
                // Recommendations
                recommendations,
            },
        });
    } catch (error) {
        console.error("Water budget calculation error:", error);
        return NextResponse.json(
            { success: false, error: "Calculation failed. Please check your inputs." },
            { status: 400 }
        );
    }
}
