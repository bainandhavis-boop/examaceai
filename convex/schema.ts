import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { storedExamTypeValidator } from "./examTypes";

const applicationTables = {
  // User profiles and progress
  userProfiles: defineTable({
    userId: v.id("users"),
    examType: storedExamTypeValidator,
    targetYear: v.number(),
    subjects: v.array(v.string()),
    totalPoints: v.number(),
    streak: v.number(),
    lastActiveDate: v.string(),
    badges: v.array(v.string()),
    weakSubjects: v.array(v.string()),
  }).index("by_user", ["userId"]),

  // Questions database
  questions: defineTable({
    examType: storedExamTypeValidator,
    subject: v.string(),
    year: v.number(),
    questionText: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.string(),
    explanation: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    topic: v.string(),
    imageUrl: v.optional(v.string()),
  }).index("by_exam_subject", ["examType", "subject"])
    .index("by_year", ["year"])
    .index("by_difficulty", ["difficulty"]),

  // Mock exams
  mockExams: defineTable({
    title: v.string(),
    examType: storedExamTypeValidator,
    subjects: v.array(v.string()),
    questionIds: v.array(v.id("questions")),
    duration: v.number(), // in minutes
    isPredictive: v.boolean(),
    createdBy: v.string(), // "AI" or userId
  }).index("by_exam_type", ["examType"])
    .index("by_predictive", ["isPredictive"]),

  // User test attempts
  testAttempts: defineTable({
    userId: v.id("users"),
    mockExamId: v.id("mockExams"),
    answers: v.array(v.object({
      questionId: v.id("questions"),
      selectedAnswer: v.string(),
      isCorrect: v.boolean(),
      timeSpent: v.number(), // in seconds
    })),
    score: v.number(),
    totalQuestions: v.number(),
    timeSpent: v.number(), // total time in seconds
    completedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_exam", ["mockExamId"]),

  // Weekly challenges
  weeklyChallenge: defineTable({
    title: v.string(),
    description: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    questionIds: v.array(v.id("questions")),
    prizes: v.array(v.string()),
    isActive: v.boolean(),
  }).index("by_active", ["isActive"]),

  // Challenge participations
  challengeParticipations: defineTable({
    userId: v.id("users"),
    challengeId: v.id("weeklyChallenge"),
    score: v.number(),
    completedAt: v.number(),
    rank: v.optional(v.number()),
  }).index("by_challenge", ["challengeId"])
    .index("by_user", ["userId"])
    .index("by_score", ["challengeId", "score"]),

  // Scanned questions
  scannedQuestions: defineTable({
    userId: v.id("users"),
    imageId: v.id("_storage"),
    extractedText: v.string(),
    subject: v.optional(v.string()),
    aiSolution: v.string(),
    confidence: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Literature content
  literatureContent: defineTable({
    title: v.string(),
    author: v.string(),
    examType: storedExamTypeValidator,
    chapters: v.array(v.object({
      title: v.string(),
      content: v.string(),
      audioUrl: v.optional(v.string()),
      duration: v.optional(v.number()), // in seconds
    })),
    summary: v.string(),
    keyThemes: v.array(v.string()),
  }).index("by_exam_type", ["examType"]),

  // User progress tracking
  dailyProgress: defineTable({
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD format
    questionsAnswered: v.number(),
    correctAnswers: v.number(),
    timeSpent: v.number(), // in minutes
    subjectsStudied: v.array(v.string()),
    pointsEarned: v.number(),
  }).index("by_user_date", ["userId", "date"]),

  // School licensing
  schools: defineTable({
    name: v.string(),
    code: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    isActive: v.boolean(),
  }).index("by_code", ["code"]),

  schoolMemberships: defineTable({
    userId: v.id("users"),
    schoolId: v.id("schools"),
    role: v.union(
      v.literal("student"),
      v.literal("teacher"),
      v.literal("school_admin"),
    ),
    status: v.union(
      v.literal("active"),
      v.literal("invited"),
      v.literal("disabled"),
    ),
    // For students: which teacher is authorized to view their data
    assignedTeacherId: v.optional(v.id("users")),
    joinedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_school", ["schoolId"])
    .index("by_school_and_role", ["schoolId", "role"])
    .index("by_assigned_teacher", ["assignedTeacherId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
