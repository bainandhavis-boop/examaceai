export type ExamType = "JAMB" | "WAEC" | "NECO";

export const EXAM_TYPES: Array<{ value: ExamType; label: string }> = [
  { value: "JAMB", label: "JAMB (Joint Admissions and Matriculation Board)" },
  { value: "WAEC", label: "WAEC (West African Examinations Council)" },
  { value: "NECO", label: "NECO (National Examinations Council)" },
];

export const SSCE_SUBJECTS = [
  "Mathematics",
  "English Language",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Government",
  "Literature in English",
  "Geography",
  "History",
  "Further Mathematics",
  "Agricultural Science",
  "Commerce",
  "Accounting",
];

export const SUBJECTS_BY_EXAM: Record<ExamType, string[]> = {
  JAMB: [
    "Mathematics",
    "English Language",
    "Physics",
    "Chemistry",
    "Biology",
    "Economics",
    "Government",
    "Literature in English",
    "Geography",
    "History",
  ],
  WAEC: SSCE_SUBJECTS,
  NECO: SSCE_SUBJECTS,
};

export const EXAM_DURATION_MINUTES: Record<ExamType, number> = {
  JAMB: 180,
  WAEC: 120,
  NECO: 120,
};
