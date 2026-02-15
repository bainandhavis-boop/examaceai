import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { QuestionScanner } from "./QuestionScanner";
import { MockExamGenerator } from "./MockExamGenerator";
import { LiteratureTutor } from "./LiteratureTutor";
import { WeeklyChallenge } from "./WeeklyChallenge";
import { ProgressDashboard } from "./ProgressDashboard";

type TabType = "home" | "scanner" | "mock-exams" | "literature" | "challenges" | "progress";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const userProfile = useQuery(api.examFunctions.getUserProfile);
  const testHistory = useQuery(api.examFunctions.getUserTestHistory);

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "scanner", label: "Snap & Solve", icon: "📸" },
    { id: "mock-exams", label: "Mock Exams", icon: "📝" },
    { id: "literature", label: "Literature", icon: "📚" },
    { id: "challenges", label: "Challenges", icon: "🏆" },
    { id: "progress", label: "Progress", icon: "📊" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeContent userProfile={userProfile} testHistory={testHistory || []} />;
      case "scanner":
        return <QuestionScanner />;
      case "mock-exams":
        return <MockExamGenerator userProfile={userProfile} />;
      case "literature":
        return <LiteratureTutor />;
      case "challenges":
        return <WeeklyChallenge />;
      case "progress":
        return <ProgressDashboard userProfile={userProfile} />;
      default:
        return <HomeContent userProfile={userProfile} testHistory={testHistory || []} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Mobile-first tab navigation */}
      <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {renderContent()}
      </div>
    </div>
  );
}

function HomeContent({ userProfile, testHistory }: { userProfile: any; testHistory: any[] }) {
  const recentTests = testHistory.slice(0, 3);
  const averageScore = testHistory.length > 0 
    ? Math.round(testHistory.reduce((sum, test) => sum + test.score, 0) / testHistory.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6 rounded-xl">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back! Ready for {userProfile.examType} {userProfile.targetYear}?
        </h1>
        <p className="opacity-90">
          You're on a {userProfile.streak}-day streak! Keep it up! 🔥
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{userProfile.totalPoints}</div>
          <div className="text-sm text-gray-600">Total Points</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{userProfile.streak}</div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{testHistory.length}</div>
          <div className="text-sm text-gray-600">Tests Taken</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{averageScore}%</div>
          <div className="text-sm text-gray-600">Avg Score</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📸</span>
                <div>
                  <div className="font-medium">Scan a Question</div>
                  <div className="text-sm text-gray-600">Get instant AI solutions</div>
                </div>
              </div>
            </button>
            <button className="w-full p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="font-medium">Take Mock Exam</div>
                  <div className="text-sm text-gray-600">Practice with AI-generated questions</div>
                </div>
              </div>
            </button>
            <button className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <div className="font-medium">Join Weekly Challenge</div>
                  <div className="text-sm text-gray-600">Compete with other students</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Test Results</h2>
          {recentTests.length > 0 ? (
            <div className="space-y-3">
              {recentTests.map((test, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Mock Exam</div>
                      <div className="text-sm text-gray-600">
                        {new Date(test.completedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        test.score >= 70 ? 'text-green-600' : 
                        test.score >= 50 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {test.score}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {test.score}/{test.totalQuestions}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <span className="text-4xl mb-4 block">📝</span>
              <p>No tests taken yet. Start with a mock exam!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
