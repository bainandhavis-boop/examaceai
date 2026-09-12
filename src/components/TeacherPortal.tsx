import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function TeacherPortal() {
  const membership = useQuery(api.schoolFunctions.getMyMembership);
  const students = useQuery(api.schoolFunctions.listMyStudents);
  const [selectedStudentId, setSelectedStudentId] = useState<Id<"users"> | null>(
    null,
  );

  const studentSummary = useQuery(
    api.schoolFunctions.getAuthorizedStudentSummary,
    selectedStudentId ? { studentUserId: selectedStudentId } : "skip",
  );

  if (membership === undefined || students === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-sm font-medium text-green-600 mb-1">Teacher portal</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {membership?.school.name}
        </h1>
        <p className="text-gray-600">
          You can only view students assigned to you by a school admin.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-3">
            Authorized students ({students.length})
          </h2>
          {students.length === 0 ? (
            <p className="text-sm text-gray-500">
              No students assigned yet. Ask your school admin to assign students to you.
            </p>
          ) : (
            <ul className="space-y-2">
              {students.map((student) => (
                <li key={student.userId}>
                  <button
                    type="button"
                    onClick={() => setSelectedStudentId(student.userId)}
                    className={`w-full text-left border rounded-lg px-3 py-2 transition-colors ${
                      selectedStudentId === student.userId
                        ? "border-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium">
                      {student.name || student.email || "Student"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {student.examType ?? "No profile"} · {student.totalPoints} pts
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-3">Student details</h2>
          {!selectedStudentId ? (
            <p className="text-sm text-gray-500">Select a student to view their summary.</p>
          ) : studentSummary === undefined ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          ) : (
            <div className="space-y-3">
              <p className="font-medium">
                {studentSummary.name || studentSummary.email || "Student"}
              </p>
              <p className="text-sm text-gray-600">
                Points: {studentSummary.profile?.totalPoints ?? 0} · Streak:{" "}
                {studentSummary.profile?.streak ?? 0}
              </p>
              <div>
                <p className="text-sm font-medium mb-2">Recent attempts</p>
                {studentSummary.recentAttempts.length === 0 ? (
                  <p className="text-sm text-gray-500">No attempts yet.</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {studentSummary.recentAttempts.map((a) => (
                      <li key={a._id} className="flex justify-between border-b py-1">
                        <span>{new Date(a.completedAt).toLocaleDateString()}</span>
                        <span className="font-semibold">{a.score}%</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
