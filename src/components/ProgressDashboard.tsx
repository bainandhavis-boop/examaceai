import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function ProgressDashboard({ userProfile }: { userProfile: any }) {
  const testHistory = useQuery(api.examFunctions.getUserTestHistory);

  // Calculate statistics
  const totalTests = testHistory?.length || 0;
  const averageScore = totalTests > 0 
    ? Math.round(testHistory!.reduce((sum, test) => sum + test.score, 0) / totalTests)
    : 0;
  
  const recentTests = testHistory?.slice(0, 5) || [];
  const bestScore = totalTests > 0 ? Math.max(...testHistory!.map(t => t.score)) : 0;
  
  // Calculate improvement trend
  const recentAverage = recentTests.length > 0 
    ? Math.round(recentTests.reduce((sum, test) => sum + test.score, 0) / recentTests.length)
    : 0;

  const improvement = recentAverage - averageScore;

  // Mock weekly progress data
  const weeklyProgress = [
    { day: 'Mon', questions: 15, score: 78 },
    { day: 'Tue', questions: 22, score: 82 },
    { day: 'Wed', questions: 18, score: 75 },
    { day: 'Thu', questions: 25, score: 88 },
    { day: 'Fri', questions: 20, score: 85 },
    { day: 'Sat', questions: 30, score: 90 },
    { day: 'Sun', questions: 12, score: 72 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Progress Dashboard</h1>
        <p className="text-gray-600">
          Track your learning journey and see how you're improving
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{userProfile.totalPoints}</div>
          <div className="text-sm text-gray-600">Total Points</div>
          <div className="text-xs text-green-600 mt-1">+45 this week</div>
        </div>
        <div className="bg-white border rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{userProfile.streak}</div>
          <div className="text-sm text-gray-600">Day Streak</div>
          <div className="text-xs text-green-600 mt-1">🔥 Keep it up!</div>
        </div>
        <div className="bg-white border rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{totalTests}</div>
          <div className="text-sm text-gray-600">Tests Completed</div>
          <div className="text-xs text-blue-600 mt-1">+3 this week</div>
        </div>
        <div className="bg-white border rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">{averageScore}%</div>
          <div className="text-sm text-gray-600">Average Score</div>
          <div className={`text-xs mt-1 ${improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {improvement >= 0 ? '+' : ''}{improvement}% trend
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">📊 Performance Overview</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Best Score</span>
                <span className="text-sm font-bold text-green-600">{bestScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${bestScore}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Average Score</span>
                <span className="text-sm font-bold text-blue-600">{averageScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${averageScore}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Recent Average</span>
                <span className="text-sm font-bold text-purple-600">{recentAverage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${recentAverage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">📈 Weekly Activity</h2>
          
          <div className="space-y-3">
            {weeklyProgress.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">
                    {day.day}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{day.questions} questions</div>
                    <div className="text-xs text-gray-600">{day.score}% average</div>
                  </div>
                </div>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(day.questions / 30) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subject Performance */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">📚 Subject Performance</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userProfile.subjects.map((subject: string, index: number) => {
            const mockScore = 70 + Math.floor(Math.random() * 25); // Mock scores
            const mockQuestions = 15 + Math.floor(Math.random() * 20);
            
            return (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-900">{subject}</h3>
                  <span className={`text-sm font-bold ${
                    mockScore >= 80 ? 'text-green-600' : 
                    mockScore >= 60 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {mockScore}%
                  </span>
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {mockQuestions} questions practiced
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      mockScore >= 80 ? 'bg-green-600' : 
                      mockScore >= 60 ? 'bg-orange-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${mockScore}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Test History */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">📝 Recent Test History</h2>
        
        {recentTests.length > 0 ? (
          <div className="space-y-3">
            {recentTests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Mock Exam #{totalTests - index}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(test.completedAt).toLocaleDateString()} • 
                    {test.totalQuestions} questions • 
                    {Math.floor(test.timeSpent / 60)} minutes
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
                    {test.answers.filter((a: any) => a.isCorrect).length}/{test.totalQuestions}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-4 block">📊</span>
            <p>No test history yet. Take your first mock exam to see your progress!</p>
          </div>
        )}
      </div>

      {/* Study Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Study Recommendations</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Focus Areas</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Practice more {userProfile.subjects[0]} questions</li>
              <li>• Review weak topics from recent tests</li>
              <li>• Take timed practice sessions</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Strengths</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Consistent daily practice streak</li>
              <li>• Improving average scores</li>
              <li>• Good time management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
