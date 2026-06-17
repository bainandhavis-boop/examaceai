import { query, mutation, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";
import { examTypeValidator, EXAM_DURATION_MINUTES } from "./examTypes";

// Get user profile
export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return profile;
  },
});

// Create or update user profile
export const createUserProfile = mutation({
  args: {
    examType: examTypeValidator,
    targetYear: v.number(),
    subjects: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        examType: args.examType,
        targetYear: args.targetYear,
        subjects: args.subjects,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("userProfiles", {
        userId,
        examType: args.examType,
        targetYear: args.targetYear,
        subjects: args.subjects,
        totalPoints: 0,
        streak: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        badges: [],
        weakSubjects: [],
      });
    }
  },
});

// Get questions for practice
export const getQuestions = query({
  args: {
    examType: examTypeValidator,
    subject: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_exam_subject", (q) =>
        q.eq("examType", args.examType).eq("subject", args.subject)
      )
      .take(args.limit || 10);

    return questions;
  },
});

// Get questions for a specific mock exam (so "take exam" uses the generated exam's questions)
export const getQuestionsForMockExam = query({
  args: {
    mockExamId: v.id("mockExams"),
  },
  handler: async (ctx, args) => {
    const mockExam = await ctx.db.get(args.mockExamId);
    if (!mockExam) return [];
    const questions = [];
    for (const id of mockExam.questionIds) {
      const q = await ctx.db.get(id);
      if (q) questions.push(q);
    }
    return questions;
  },
});

// Generate upload URL for file storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Generate predictive mock exam
export const generatePredictiveMockExam = mutation({
  args: {
    examType: examTypeValidator,
    subjects: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Get questions from recent years with higher probability
    const allQuestions = [];
    
    for (const subject of args.subjects) {
      const recentQuestions = await ctx.db
        .query("questions")
        .withIndex("by_exam_subject", (q) => 
          q.eq("examType", args.examType).eq("subject", subject)
        )
        .filter((q) => q.gte(q.field("year"), 2020))
        .take(15); // 15 questions per subject for JAMB-style
      
      allQuestions.push(...recentQuestions.map(q => q._id));
    }

    const mockExamId = await ctx.db.insert("mockExams", {
      title: `Predictive ${args.examType} 2026 Mock Exam`,
      examType: args.examType,
      subjects: args.subjects,
      questionIds: allQuestions,
      duration: EXAM_DURATION_MINUTES[args.examType],
      isPredictive: true,
      createdBy: "AI",
    });

    return mockExamId;
  },
});

// Submit test attempt
export const submitTestAttempt = mutation({
  args: {
    mockExamId: v.id("mockExams"),
    answers: v.array(v.object({
      questionId: v.id("questions"),
      selectedAnswer: v.string(),
      timeSpent: v.number(),
    })),
    totalTimeSpent: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Calculate score
    let correctAnswers = 0;
    const processedAnswers = [];

    for (const answer of args.answers) {
      const question = await ctx.db.get(answer.questionId);
      if (!question) continue;

      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      if (isCorrect) correctAnswers++;

      processedAnswers.push({
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        timeSpent: answer.timeSpent,
      });
    }

    const score = Math.round((correctAnswers / args.answers.length) * 100);

    // Save test attempt
    const attemptId = await ctx.db.insert("testAttempts", {
      userId,
      mockExamId: args.mockExamId,
      answers: processedAnswers,
      score,
      totalQuestions: args.answers.length,
      timeSpent: args.totalTimeSpent,
      completedAt: Date.now(),
    });

    // Update user points and streak
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (profile) {
      const pointsEarned = Math.max(10, Math.floor(score / 10) * 5);
      const today = new Date().toISOString().split('T')[0];
      const isConsecutiveDay = profile.lastActiveDate === 
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await ctx.db.patch(profile._id, {
        totalPoints: profile.totalPoints + pointsEarned,
        streak: isConsecutiveDay ? profile.streak + 1 : 1,
        lastActiveDate: today,
      });

      // Update daily progress
      const existingProgress = await ctx.db
        .query("dailyProgress")
        .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
        .unique();

      if (existingProgress) {
        await ctx.db.patch(existingProgress._id, {
          questionsAnswered: existingProgress.questionsAnswered + args.answers.length,
          correctAnswers: existingProgress.correctAnswers + correctAnswers,
          pointsEarned: existingProgress.pointsEarned + pointsEarned,
        });
      } else {
        await ctx.db.insert("dailyProgress", {
          userId,
          date: today,
          questionsAnswered: args.answers.length,
          correctAnswers,
          timeSpent: Math.floor(args.totalTimeSpent / 60),
          subjectsStudied: [],
          pointsEarned,
        });
      }
    }

    return { attemptId, score, correctAnswers, totalQuestions: args.answers.length };
  },
});

// Get user's test history
export const getUserTestHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const attempts = await ctx.db
      .query("testAttempts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);

    return attempts;
  },
});

// Get literature content
export const getLiteratureContent = query({
  args: {},
  handler: async (ctx) => {
    const content = await ctx.db
      .query("literatureContent")
      .take(10);

    return content;
  },
});

// Get leaderboard for weekly challenge
export const getWeeklyLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const activeChallenge = await ctx.db
      .query("weeklyChallenge")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();

    if (!activeChallenge) return [];

    const participations = await ctx.db
      .query("challengeParticipations")
      .withIndex("by_challenge", (q) => q.eq("challengeId", activeChallenge._id))
      .order("desc")
      .take(50);

    // Get user details for each participation
    const leaderboard = [];
    for (const participation of participations) {
      const user = await ctx.db.get(participation.userId);
      if (user) {
        leaderboard.push({
          userId: participation.userId,
          userName: user.name || user.email || "Anonymous",
          score: participation.score,
          completedAt: participation.completedAt,
        });
      }
    }

    return leaderboard.sort((a, b) => b.score - a.score);
  },
});

// Internal mutation to add questions extracted from PDF
export const addQuestionsFromPdf = internalMutation({
  args: {
    examType: examTypeValidator,
    subject: v.string(),
    year: v.number(),
    questions: v.array(v.object({
      questionText: v.string(),
      options: v.array(v.string()),
      correctAnswer: v.string(),
      explanation: v.string(),
      difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
      topic: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    let count = 0;
    for (const q of args.questions) {
      await ctx.db.insert("questions", {
        examType: args.examType,
        subject: args.subject,
        year: args.year,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty ?? "medium",
        topic: q.topic ?? "General",
      });
      count++;
    }
    return count;
  },
});

// Internal mutation to add questions with per-question year assignment (for year ranges)
export const addQuestionsFromPdfWithYears = internalMutation({
  args: {
    examType: examTypeValidator,
    subject: v.string(),
    questions: v.array(v.object({
      questionText: v.string(),
      options: v.array(v.string()),
      correctAnswer: v.string(),
      explanation: v.string(),
      year: v.number(),
      difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
      topic: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    let count = 0;
    for (const q of args.questions) {
      await ctx.db.insert("questions", {
        examType: args.examType,
        subject: args.subject,
        year: q.year,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty ?? "medium",
        topic: q.topic ?? "General",
      });
      count++;
    }
    return count;
  },
});

// Internal mutation to save scanned question
export const saveScannedQuestion = internalMutation({
  args: {
    userId: v.id("users"),
    imageId: v.id("_storage"),
    extractedText: v.string(),
    subject: v.string(),
    aiSolution: v.string(),
    confidence: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scannedQuestions", {
      userId: args.userId,
      imageId: args.imageId,
      extractedText: args.extractedText,
      subject: args.subject,
      aiSolution: args.aiSolution,
      confidence: args.confidence,
      createdAt: Date.now(),
    });
  },
});
