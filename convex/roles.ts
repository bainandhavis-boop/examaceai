import { v } from "convex/values";

export const schoolRoleValidator = v.union(
  v.literal("student"),
  v.literal("teacher"),
  v.literal("school_admin"),
);

export type SchoolRole = "student" | "teacher" | "school_admin";

export const membershipStatusValidator = v.union(
  v.literal("active"),
  v.literal("invited"),
  v.literal("disabled"),
);
