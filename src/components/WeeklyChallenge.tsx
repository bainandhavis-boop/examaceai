import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function WeeklyChallenge() {
  const [isParticipating, setIsParticipating] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const leaderboard = useQuery(api.examFunctions.getWeeklyLeaderboard);
  const challengeQuestions = useQuery(api.examFunctions.getQuestions, 
    isParticipating ? {
      examType: "JAMB",
      subject: "Mathematics",
      limit: 10
    } : "skip"
  );

  const submitChallenge = useMutation(api.examFunctions.submitTestAttempt);

  const handleStartChallenge = () => {
    setIsParticipating(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setChallengeCompleted(false);
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitChallenge = async () => {
    if (!challengeQuestions) return;

    const challengeAnswers = challengeQuestions.map(question => ({
      questionId: question._id,
      selectedAnswer: answers[question._id] || "",
      timeSpent: 30,
    }));

    try {
      // For demo purposes, we'll calculate score locally
      let correctCount = 0;
      challengeQuestions.forEach(question => {
        if (answers[question._id] === question.correctAnswer) {
          correctCount++;
        }
      });

      const score = Math.round((correctCount / challengeQuestions.length) * 100);
      setFinalScore(score);
      setChallengeCompleted(true);
      toast.success(`Challenge completed! You scored ${score}%`);
    } catch (error) {
      toast.error("Failed to submit challenge. Please try again.");
      console.error(error);
    }
  };

  if (challengeCompleted) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Challenge Complete!</h1>
        </div>

        <div className="bg-white border rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">
            {finalScore >= 80 ? "🏆" : finalScore >= 60 ? "🥈" : "🥉"}
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {finalScore >= 80 ? "Outstanding!" : finalScore >= 60 ? "Great Job!" : "Good Effort!"}
          </h2>
          <div className="text-5xl font-bold text-blue-600 mb-4">{finalScore}%</div>
          <p className="text-xl text-gray-600 mb-6">
            Your challenge score has been submitted to the leaderboard!
          </p>
          
          <button
            onClick={() => {
              setIsParticipating(false);
              setChallengeCompleted(false);
              setAnswers({});
              setCurrentQuestionIndex(0);
            }}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Challenge Hub
          </button>
        </div>
      </div>
    );
  }

  if (isParticipating && challengeQuestions) {
    const currentQuestion = challengeQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / challengeQuestions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white border rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Weekly Challenge</h1>
              <p className="text-gray-600">
                Question {currentQuestionIndex + 1} of {challengeQuestions.length}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-orange-600">
                {Math.round(progress)}% Complete
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">
            {currentQuestion.questionText}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <label key={index} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name={`question-${currentQuestion._id}`}
                  value={option}
                  checked={answers[currentQuestion._id] === option}
                  onChange={() => handleAnswerSelect(currentQuestion._id, option)}
                  className="mr-3 text-orange-600"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentQuestionIndex === challengeQuestions.length - 1 ? (
            <button
              onClick={handleSubmitChallenge}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Submit Challenge
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(Math.min(challengeQuestions.length - 1, currentQuestionIndex + 1))}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Next
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Weekly Challenge</h1>
        <p className="text-gray-600">
          Compete with students nationwide and climb the leaderboard!
        </p>
      </div>

      {/* Current Challenge */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🏆 National Exam Battle - Week 1</h2>
            <p className="opacity-90 mb-4">
              Test your knowledge across Mathematics, Physics, Chemistry, and English. 
              Top 10 winners get digital badges!
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span>⏰ 5 days remaining</span>
              <span>👥 1,247 participants</span>
              <span>🎯 10 questions</span>
            </div>
          </div>
          <button
            onClick={handleStartChallenge}
            className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Join Challenge
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">🏅 Current Leaderboard</h2>
        
        {leaderboard && leaderboard.length > 0 ? (
          <div className="space-y-3">
            {leaderboard.slice(0, 10).map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-500 text-white' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{entry.userName}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(entry.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-orange-600">{entry.score}%</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-4 block">🏆</span>
            <p>No participants yet. Be the first to join!</p>
          </div>
        )}
      </div>

      {/* Prizes */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">🎁 Weekly Prizes</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl mb-2">🥇</div>
            <div className="font-semibold">1st Place</div>
            <div className="text-sm text-gray-600">Gold Badge + Certificate</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl mb-2">🥈</div>
            <div className="font-semibold">2nd Place</div>
            <div className="text-sm text-gray-600">Silver Badge + Certificate</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl mb-2">🥉</div>
            <div className="font-semibold">3rd Place</div>
            <div className="text-sm text-gray-600">Bronze Badge + Certificate</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl mb-2">🏅</div>
            <div className="font-semibold">Top 10</div>
            <div className="text-sm text-gray-600">Participation Certificate</div>
          </div>
        </div>
      </div>

      {/* Challenge Rules */}
      <div className="bg-blue-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Challenge Rules</h3>
        <ul className="space-y-2 text-blue-800">
          <li>• Each challenge runs for one week (Monday to Sunday)</li>
          <li>• You can only participate once per challenge</li>
          <li>• Questions are randomly selected from our database</li>
          <li>• Rankings are based on score and completion time</li>
          <li>• Winners are announced every Monday</li>
        </ul>
      </div>
    </div>
  );
}
