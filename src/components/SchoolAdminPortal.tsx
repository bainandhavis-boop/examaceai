import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { showErrorToast } from "../lib/errors";

export function SchoolAdminPortal() {
  const membership = useQuery(api.schoolFunctions.getMyMembership);
  const members = useQuery(api.schoolFunctions.listSchoolMembers);
  const assignStudent = useMutation(api.schoolFunctions.assignStudentToTeacher);
  const updateStatus = useMutation(api.schoolFunctions.updateMemberStatus);
  const [busyId, setBusyId] = useState<string | null>(null);

  const teachers = useMemo(
    () => (members ?? []).filter((m) => m.role === "teacher" && m.status === "active"),
    [members],
  );
  const students = useMemo(
    () => (members ?? []).filter((m) => m.role === "student"),
    [members],
  );

  if (membership === undefined || members === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  const handleAssign = async (
    studentUserId: Id<"users">,
    teacherUserId: Id<"users"> | "",
  ) => {
    setBusyId(studentUserId);
    try {
      await assignStudent({
        studentUserId,
        teacherUserId: teacherUserId === "" ? null : teacherUserId,
      });
      toast.success("Student assignment updated");
    } catch (err) {
      showErrorToast({
        title: "We couldn't update the assignment.",
        body: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleStatus = async (
    membershipId: Id<"schoolMemberships">,
    status: "active" | "disabled",
  ) => {
    setBusyId(membershipId);
    try {
      await updateStatus({ membershipId, status });
      toast.success(status === "active" ? "Member activated" : "Member disabled");
    } catch (err) {
      showErrorToast({
        title: "We couldn't update member status.",
        body: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-sm font-medium text-purple-600 mb-1">School admin portal</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {membership?.school.name}
        </h1>
        <p className="text-gray-600 mb-3">
          Manage students and teachers in your school. Share the invite code so others can join.
        </p>
        <div className="inline-flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
          <span className="text-sm text-gray-600">Invite code</span>
          <span className="font-mono font-bold tracking-widest text-lg">
            {membership?.school.code}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-3">Teachers ({teachers.length})</h2>
        {teachers.length === 0 ? (
          <p className="text-sm text-gray-500">No teachers have joined yet.</p>
        ) : (
          <ul className="space-y-2">
            {teachers.map((teacher) => (
              <li
                key={teacher.membershipId}
                className="flex justify-between items-center border rounded-lg px-3 py-2 text-sm"
              >
                <span>{teacher.name || teacher.email || teacher.userId}</span>
                <span className="text-green-700 font-medium">{teacher.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-3">Students ({students.length})</h2>
        {students.length === 0 ? (
          <p className="text-sm text-gray-500">No students have joined yet.</p>
        ) : (
          <div className="space-y-3">
            {students.map((student) => (
              <div
                key={student.membershipId}
                className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center gap-3 justify-between"
              >
                <div>
                  <div className="font-medium">
                    {student.name || student.email || "Student"}
                  </div>
                  <div className="text-xs text-gray-500">Status: {student.status}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="p-2 border rounded-lg text-sm"
                    disabled={busyId === student.userId}
                    value={student.assignedTeacherId ?? ""}
                    onChange={(e) =>
                      void handleAssign(
                        student.userId,
                        e.target.value as Id<"users"> | "",
                      )
                    }
                  >
                    <option value="">Unassigned</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.userId} value={teacher.userId}>
                        {teacher.name || teacher.email || "Teacher"}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={busyId === student.membershipId}
                    onClick={() =>
                      void handleToggleStatus(
                        student.membershipId,
                        student.status === "active" ? "disabled" : "active",
                      )
                    }
                    className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    {student.status === "active" ? "Disable" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-3">All members</h2>
        <ul className="divide-y">
          {members.map((member) => (
            <li key={member.membershipId} className="py-2 flex justify-between text-sm">
              <span>
                {member.name || member.email || member.userId}{" "}
                <span className="text-gray-500">({member.role})</span>
              </span>
              <span>{member.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
