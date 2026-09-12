import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { SchoolRole } from "./roles";

type Ctx = QueryCtx | MutationCtx;

export async function requireUserId(ctx: Ctx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}

export async function getActiveMembership(
  ctx: Ctx,
  userId: Id<"users">,
): Promise<Doc<"schoolMemberships"> | null> {
  const memberships = await ctx.db
    .query("schoolMemberships")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  return (
    memberships.find((m) => m.status === "active") ??
    memberships[0] ??
    null
  );
}

export async function requireActiveMembership(
  ctx: Ctx,
  userId: Id<"users">,
): Promise<Doc<"schoolMemberships">> {
  const membership = await getActiveMembership(ctx, userId);
  if (!membership || membership.status !== "active") {
    throw new Error("No active school membership");
  }
  return membership;
}

export async function requireRole(
  ctx: Ctx,
  roles: SchoolRole[],
): Promise<{ userId: Id<"users">; membership: Doc<"schoolMemberships"> }> {
  const userId = await requireUserId(ctx);
  const membership = await requireActiveMembership(ctx, userId);
  if (!roles.includes(membership.role)) {
    throw new Error("You do not have permission to perform this action");
  }
  return { userId, membership };
}

/**
 * Students: only themselves.
 * Teachers: students in their school assigned to them.
 * School admins: any student in their school.
 */
export async function canAccessStudentData(
  ctx: Ctx,
  viewerId: Id<"users">,
  studentUserId: Id<"users">,
): Promise<boolean> {
  if (viewerId === studentUserId) {
    return true;
  }

  const viewerMembership = await getActiveMembership(ctx, viewerId);
  if (!viewerMembership || viewerMembership.status !== "active") {
    return false;
  }

  const studentMembership = await getActiveMembership(ctx, studentUserId);
  if (
    !studentMembership ||
    studentMembership.status !== "active" ||
    studentMembership.role !== "student" ||
    studentMembership.schoolId !== viewerMembership.schoolId
  ) {
    return false;
  }

  if (viewerMembership.role === "school_admin") {
    return true;
  }

  if (viewerMembership.role === "teacher") {
    return studentMembership.assignedTeacherId === viewerId;
  }

  return false;
}

export async function assertCanAccessStudentData(
  ctx: Ctx,
  viewerId: Id<"users">,
  studentUserId: Id<"users">,
): Promise<void> {
  const allowed = await canAccessStudentData(ctx, viewerId, studentUserId);
  if (!allowed) {
    throw new Error("You are not authorized to view this student's data");
  }
}
