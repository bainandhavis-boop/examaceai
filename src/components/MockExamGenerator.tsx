import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { EXAM_DURATION_MINUTES, type ExamType } from "../lib/examTypes";

export function MockExamGenerator({ userProfile }: { userProfile: any }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [currentExam, setCurrentExam] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const generateMockExam = useMutation(api.examFunctions.generatePredictiveMockExam);
  const examQuestions = useQuery(
    api.examFunctions.getQuestionsForMockExam,
    currentExam ? { mockExamId: currentExam._id } : "skip"
  );
  const submitTest = useMutation(api.examFunctions.submitTestAttempt);
  const seedSampleQuestions = useMutation(api.seedData.seedSampleQuestions);

  const handleGenerateExam = async () => {
    if (selectedSubjects.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }

    setIsGenerating(true);
    try {
      const examId = await generateMockExam({
        examType: userProfile.examType,
        subjects: selectedSubjects,
      });
      
      setCurrentExam({ _id: examId });
      toast.success("Mock exam generated! Click Start to begin.");
    } catch (error) {
      toast.error("Failed to generate exam. Please try again.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartExam = () => {
    if (!examQuestions || examQuestions.length === 0) {
      toast.error("No questions available. Load sample questions first, then generate a new exam.");
      return;
    }

    setExamStarted(true);
    const durationSeconds = EXAM_DURATION_MINUTES[userProfile.examType as ExamType] * 60;
    setTimeLeft(durationSeconds);
    
    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitExam = async () => {
    if (!currentExam || !examQuestions) return;

    const examAnswers = examQuestions.map(question => ({
      questionId: question._id,
      selectedAnswer: answers[question._id] || "",
      timeSpent: 30, // Mock time spent per question
    }));

    try {
      const result = await submitTest({
        mockExamId: currentExam._id,
        answers: examAnswers,
        totalTimeSpent: EXAM_DURATION_MINUTES[userProfile.examType as ExamType] * 60 - (timeLeft || 0),
      });

      setExamResult(result);
      setExamCompleted(true);
      toast.success(`Exam completed! You scored ${result.score}%`);
    } catch (error) {
      toast.error("Failed to submit exam. Please try again.");
      console.error(error);
    }
  };

  const handleLoadSampleQuestions = async () => {
    setIsSeeding(true);
    try {
      const result = await seedSampleQuestions();
      toast.success(result === "Questions already seeded" ? "Question bank already has questions." : "Sample questions loaded! Generate your mock exam again.");
      if (result !== "Questions already seeded") {
        setCurrentExam(null);
      }
    } catch (error) {
      toast.error("Failed to load sample questions.");
      console.error(error);
    } finally {
      setIsSeeding(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (examCompleted && examResult) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Results</h1>
        </div>

        <div className="bg-white border rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">
            {examResult.score >= 70 ? "🎉" : examResult.score >= 50 ? "👍" : "📚"}
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {examResult.score >= 70 ? "Excellent!" : examResult.score >= 50 ? "Good Job!" : "Keep Practicing!"}
          </h2>
          <div className="text-5xl font-bold text-blue-600 mb-4">{examResult.score}%</div>
          <p className="text-xl text-gray-600 mb-6">
            You got {examResult.correctAnswers} out of {examResult.totalQuestions} questions correct
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{examResult.correctAnswers}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {examResult.totalQuestions - examResult.correctAnswers}
              </div>
              <div className="text-sm text-gray-600">Incorrect Answers</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{examResult.score}%</div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
          </div>

          <button
            onClick={() => {
              setCurrentExam(null);
              setExamStarted(false);
              setExamCompleted(false);
              setExamResult(null);
              setAnswers({});
              setCurrentQuestionIndex(0);
            }}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Take Another Exam
          </button>
        </div>
      </div>
    );
  }

  if (examStarted && currentExam && examQuestions && examQuestions.length > 0) {
    const currentQuestion = examQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / examQuestions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Exam header */}
        <div className="bg-white border rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Predictive {userProfile.examType} Mock Exam</h1>
              <p className="text-gray-600">
                Question {currentQuestionIndex + 1} of {examQuestions.length}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">
                {timeLeft ? formatTime(timeLeft) : "00:00:00"}
              </div>
              <p className="text-sm text-gray-600">Time Remaining</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question */}
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
                  className="mr-3 text-blue-600"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentQuestionIndex === examQuestions.length - 1 ? (
            <button
              onClick={handleSubmitExam}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(Math.min(examQuestions.length - 1, currentQuestionIndex + 1))}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Predictive Mock Exams</h1>
        <p className="text-gray-600">
          AI-generated exams based on historical patterns for {userProfile.examType} {userProfile.targetYear}
        </p>
      </div>

      {!currentExam ? (
        <div className="bg-white border rounded-xl p-8">
          <h2 className="text-2xl font-semibold mb-6">Generate Your Mock Exam</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Subjects for Your Mock Exam
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {userProfile.subjects.map((subject: string) => (
                  <label key={subject} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubjects(prev => [...prev, subject]);
                        } else {
                          setSelectedSubjects(prev => prev.filter(s => s !== subject));
                        }
                      }}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-sm">{subject}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">🤖 AI-Powered Predictions</h3>
              <p className="text-blue-800 text-sm">
                Our AI analyzes past {userProfile.examType} questions from 2010-2025 to predict likely 2026 questions.
                This gives you the best preparation for your upcoming exam!
              </p>
            </div>

            <button
              onClick={handleGenerateExam}
              disabled={isGenerating || selectedSubjects.length === 0}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating Predictive Exam...
                </div>
              ) : (
                "🎯 Generate Predictive Mock Exam"
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border rounded-xl p-8 text-center">
          {examQuestions !== undefined && examQuestions.length === 0 ? (
            <>
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-bold mb-4">Question Bank is Empty</h2>
              <p className="text-gray-600 mb-6">
                This exam has no questions because there are no questions in the bank yet. Load sample questions below, then generate a new mock exam.
              </p>
              <button
                onClick={handleLoadSampleQuestions}
                disabled={isSeeding}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors text-lg"
              >
                {isSeeding ? "Loading…" : "Load sample questions"}
              </button>
              <button
                onClick={() => setCurrentExam(null)}
                className="ml-4 px-6 py-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-bold mb-4">Your Mock Exam is Ready!</h2>
              <p className="text-gray-600 mb-6">
                Duration: {EXAM_DURATION_MINUTES[userProfile.examType as ExamType] / 60} hours | 
                Questions: {examQuestions?.length ?? "…"} | Subjects: {selectedSubjects.join(", ")}
              </p>
              
              <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important Instructions</h3>
                <ul className="text-yellow-800 text-sm text-left space-y-1">
                  <li>• Once started, the timer cannot be paused</li>
                  <li>• You can navigate between questions freely</li>
                  <li>• Make sure you have a stable internet connection</li>
                  <li>• Your progress will be automatically saved</li>
                </ul>
              </div>

              <button
                onClick={handleStartExam}
                disabled={!examQuestions || examQuestions.length === 0}
                className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors text-lg"
              >
                🚀 Start Mock Exam
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
