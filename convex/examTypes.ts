import { v } from "convex/values";

export const examTypeValidator = v.union(
  v.literal("JAMB"),
  v.literal("WAEC"),
  v.literal("NECO"),
);

export type ExamType = "JAMB" | "WAEC" | "NECO";

export const EXAM_DURATION_MINUTES: Record<ExamType, number> = {
  JAMB: 180,
  WAEC: 120,
  NECO: 120,
};
