/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
    ApiFromModules,
    FilterApi,
    FunctionReference,
} from "convex/server";
import type * as alerts from "../alerts.js";
import type * as crops from "../crops.js";
import type * as farms from "../farms.js";
import type * as users from "../users.js";
import type * as waterBudgets from "../waterBudgets.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
    alerts: typeof alerts;
    crops: typeof crops;
    farms: typeof farms;
    users: typeof users;
    waterBudgets: typeof waterBudgets;
}>;
export declare const api: FilterApi<
    typeof fullApi,
    FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
    typeof fullApi,
    FunctionReference<any, "internal">
>;
