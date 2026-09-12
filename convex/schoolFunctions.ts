import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  assertCanAccessStudentData,
  getActiveMembership,
  requireActiveMembership,
  requireRole,
  requireUserId,
} from "./rbac";

function generateSchoolCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export const getMyMembership = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const membership = await getActiveMembership(ctx, userId);
    if (!membership || membership.status !== "active") return null;

    const school = await ctx.db.get(membership.schoolId);
    if (!school) return null;

    return {
      membership,
      school: {
        _id: school._id,
        name: school.name,
        code: school.code,
        isActive: school.isActive,
      },
    };
  },
});

export const createSchool = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const name = args.name.trim();
    if (name.length < 2) {
      throw new Error("School name must be at least 2 characters");
    }

    const existing = await getActiveMembership(ctx, userId);
    if (existing && existing.status === "active") {
      throw new Error("You already belong to a school. Leave it before creating another.");
    }

    let code = generateSchoolCode();
    for (let attempt = 0; attempt < 8; attempt++) {
      const clash = await ctx.db
        .query("schools")
        .withIndex("by_code", (q) => q.eq("code", code))
        .unique();
      if (!clash) break;
      code = generateSchoolCode();
    }

    const schoolId = await ctx.db.insert("schools", {
      name,
      code,
      createdBy: userId,
      createdAt: Date.now(),
      isActive: true,
    });

    await ctx.db.insert("schoolMemberships", {
      userId,
      schoolId,
      role: "school_admin",
      status: "active",
      joinedAt: Date.now(),
    });

    return { schoolId, code };
  },
});

export const joinSchool = mutation({
  args: {
    code: v.string(),
    role: v.union(v.literal("student"), v.literal("teacher")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const code = args.code.trim().toUpperCase();

    const existing = await getActiveMembership(ctx, userId);
    if (existing && existing.status === "active") {
      throw new Error("You already belong to a school");
    }

    const school = await ctx.db
      .query("schools")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();

    if (!school || !school.isActive) {
      throw new Error("Invalid or inactive school code");
    }

    const membershipId = await ctx.db.insert("schoolMemberships", {
      userId,
      schoolId: school._id,
      role: args.role,
      status: "active",
      joinedAt: Date.now(),
    });

    return { schoolId: school._id, membershipId };
  },
});

export const listSchoolMembers = query({
  args: {},
  handler: async (ctx) => {
    const { membership } = await requireRole(ctx, ["school_admin"]);

    const members = await ctx.db
      .query("schoolMemberships")
      .withIndex("by_school", (q) => q.eq("schoolId", membership.schoolId))
      .collect();

    const result = [];
    for (const member of members) {
      const user = await ctx.db.get(member.userId);
      result.push({
        membershipId: member._id,
        userId: member.userId,
        role: member.role,
        status: member.status,
        assignedTeacherId: member.assignedTeacherId ?? null,
        name: user?.name ?? null,
        email: user?.email ?? null,
        joinedAt: member.joinedAt,
      });
    }

    return result.sort((a, b) => a.role.localeCompare(b.role));
  },
});

export const assignStudentToTeacher = mutation({
  args: {
    studentUserId: v.id("users"),
    teacherUserId: v.union(v.id("users"), v.null()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireRole(ctx, ["school_admin"]);

    const studentMembership = await getActiveMembership(ctx, args.studentUserId);
    if (
      !studentMembership ||
      studentMembership.schoolId !== membership.schoolId ||
      studentMembership.role !== "student"
    ) {
      throw new Error("Student is not in your school");
    }

    if (args.teacherUserId) {
      const teacherMembership = await getActiveMembership(ctx, args.teacherUserId);
      if (
        !teacherMembership ||
        teacherMembership.schoolId !== membership.schoolId ||
        teacherMembership.role !== "teacher" ||
        teacherMembership.status !== "active"
      ) {
        throw new Error("Teacher is not in your school");
      }
    }

    await ctx.db.replace(studentMembership._id, {
      userId: studentMembership.userId,
      schoolId: studentMembership.schoolId,
      role: studentMembership.role,
      status: studentMembership.status,
      joinedAt: studentMembership.joinedAt,
      ...(args.teacherUserId
        ? { assignedTeacherId: args.teacherUserId }
        : {}),
    });

    return null;
  },
});

export const updateMemberStatus = mutation({
  args: {
    membershipId: v.id("schoolMemberships"),
    status: v.union(
      v.literal("active"),
      v.literal("invited"),
      v.literal("disabled"),
    ),
  },
  handler: async (ctx, args) => {
    const { userId, membership } = await requireRole(ctx, ["school_admin"]);
    const target = await ctx.db.get(args.membershipId);
    if (!target || target.schoolId !== membership.schoolId) {
      throw new Error("Membership not found in your school");
    }
    if (target.userId === userId && args.status !== "active") {
      throw new Error("You cannot disable your own admin membership");
    }

    await ctx.db.patch(args.membershipId, { status: args.status });
    return null;
  },
});

export const listMyStudents = query({
  args: {},
  handler: async (ctx) => {
    const { userId, membership } = await requireRole(ctx, ["teacher"]);

    const students = await ctx.db
      .query("schoolMemberships")
      .withIndex("by_assigned_teacher", (q) => q.eq("assignedTeacherId", userId))
      .collect();

    const authorized = students.filter(
      (s) =>
        s.schoolId === membership.schoolId &&
        s.role === "student" &&
        s.status === "active",
    );

    const result = [];
    for (const student of authorized) {
      const user = await ctx.db.get(student.userId);
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", student.userId))
        .unique();

      result.push({
        userId: student.userId,
        membershipId: student._id,
        name: user?.name ?? null,
        email: user?.email ?? null,
        examType: profile?.examType ?? null,
        totalPoints: profile?.totalPoints ?? 0,
        streak: profile?.streak ?? 0,
      });
    }

    return result;
  },
});

export const getAuthorizedStudentSummary = query({
  args: {
    studentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const viewerId = await requireUserId(ctx);
    await assertCanAccessStudentData(ctx, viewerId, args.studentUserId);

    const user = await ctx.db.get(args.studentUserId);
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.studentUserId))
      .unique();

    const attempts = await ctx.db
      .query("testAttempts")
      .withIndex("by_user", (q) => q.eq("userId", args.studentUserId))
      .order("desc")
      .take(10);

    return {
      userId: args.studentUserId,
      name: user?.name ?? null,
      email: user?.email ?? null,
      profile,
      recentAttempts: attempts.map((a) => ({
        _id: a._id,
        score: a.score,
        totalQuestions: a.totalQuestions,
        completedAt: a.completedAt,
      })),
    };
  },
});

export const getMyStudentOverview = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const membership = await requireActiveMembership(ctx, userId);
    if (membership.role !== "student") {
      throw new Error("Only students can view this overview");
    }

    const school = await ctx.db.get(membership.schoolId);
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    let teacherName: string | null = null;
    if (membership.assignedTeacherId) {
      const teacher = await ctx.db.get(membership.assignedTeacherId);
      teacherName = teacher?.name ?? teacher?.email ?? null;
    }

    const attempts = await ctx.db
      .query("testAttempts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(5);

    return {
      schoolName: school?.name ?? "Your school",
      teacherName,
      profile,
      recentAttempts: attempts.map((a) => ({
        score: a.score,
        totalQuestions: a.totalQuestions,
        completedAt: a.completedAt,
      })),
    };
  },
});

export const ensureSoloLearnerAccess = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return true;
    const membership = await getActiveMembership(ctx, userId);
    return !membership || membership.status !== "active";
  },
});
