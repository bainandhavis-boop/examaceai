import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type StudentPortalProps = {
  onOpenStudyDashboard: () => void;
};

export function StudentPortal({ onOpenStudyDashboard }: StudentPortalProps) {
  const membership = useQuery(api.schoolFunctions.getMyMembership);
  const overview = useQuery(api.schoolFunctions.getMyStudentOverview);

  if (membership === undefined || overview === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-sm font-medium text-blue-600 mb-1">Student portal</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {overview.schoolName}
        </h1>
        <p className="text-gray-600">
          You can only see your own study data. Teachers assigned to you and school
          admins can view your progress.
        </p>
        {overview.teacherName && (
          <p className="mt-3 text-sm text-gray-700">
            Assigned teacher: <span className="font-medium">{overview.teacherName}</span>
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-3">Your progress</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">
              {overview.profile?.totalPoints ?? 0}
            </div>
            <div className="text-xs text-blue-800">Points</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-700">
              {overview.profile?.streak ?? 0}
            </div>
            <div className="text-xs text-green-800">Day streak</div>
          </div>
        </div>

        {overview.recentAttempts.length === 0 ? (
          <p className="text-sm text-gray-500">No recent mock exams yet.</p>
        ) : (
          <ul className="space-y-2">
            {overview.recentAttempts.map((attempt, index) => (
              <li
                key={`${attempt.completedAt}-${index}`}
                className="flex justify-between text-sm border rounded-lg px-3 py-2"
              >
                <span>
                  {new Date(attempt.completedAt).toLocaleDateString()} ·{" "}
                  {attempt.totalQuestions} questions
                </span>
                <span className="font-semibold text-blue-700">{attempt.score}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={onOpenStudyDashboard}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold"
      >
        Open study dashboard
      </button>
    </div>
  );
}
