/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiActions from "../aiActions.js";
import type * as auth from "../auth.js";
import type * as examFunctions from "../examFunctions.js";
import type * as examTypes from "../examTypes.js";
import type * as http from "../http.js";
import type * as rbac from "../rbac.js";
import type * as roles from "../roles.js";
import type * as router from "../router.js";
import type * as schoolFunctions from "../schoolFunctions.js";
import type * as seedData from "../seedData.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aiActions: typeof aiActions;
  auth: typeof auth;
  examFunctions: typeof examFunctions;
  examTypes: typeof examTypes;
  http: typeof http;
  rbac: typeof rbac;
  roles: typeof roles;
  router: typeof router;
  schoolFunctions: typeof schoolFunctions;
  seedData: typeof seedData;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
