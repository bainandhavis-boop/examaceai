import { v } from "convex/values";

/** Active exam types shown in the product UI. */
export const examTypeValidator = v.union(
  v.literal("JAMB"),
  v.literal("WAEC"),
  v.literal("NECO"),
);

/**
 * Schema validator including legacy values still present in the shared
 * Convex deployment so schema pushes succeed without wiping old data.
 */
export const storedExamTypeValidator = v.union(
  v.literal("JAMB"),
  v.literal("WAEC"),
  v.literal("NECO"),
  v.literal("ICAN"),
  v.literal("TRCN"),
);

export type ExamType = "JAMB" | "WAEC" | "NECO";

export const EXAM_DURATION_MINUTES: Record<ExamType, number> = {
  JAMB: 180,
  WAEC: 120,
  NECO: 120,
};
