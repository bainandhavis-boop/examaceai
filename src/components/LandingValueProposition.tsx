import { useState } from "react";

const DEMO_QUESTION = {
  subject: "Mathematics",
  examType: "JAMB",
  questionText: "If log₂(x) = 3, find the value of x.",
  options: ["6", "8", "9", "12"],
  correctAnswer: "8",
  explanation:
    "If log₂(x) = 3, then x = 2³ = 8. Logarithm is the inverse of the exponential function.",
};

export function LandingValueProposition() {
  const [showDemo, setShowDemo] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const hasAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === DEMO_QUESTION.correctAnswer;

  const handleTryDemo = () => {
    setShowDemo(true);
    setSelectedAnswer(null);
  };

  return (
    <section className="mb-12 max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 text-center">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
          Pass Your Exams with{" "}
          <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            AI-Powered Learning
          </span>
        </h2>
        <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
          Get instant step-by-step solutions, practice predictive mock exams, listen to
          literature summaries, and prepare smarter for JAMB, WAEC, and NECO.
        </p>
        <button
          type="button"
          onClick={handleTryDemo}
          className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:from-blue-700 hover:to-green-700"
        >
          Try a Demo Question
        </button>

        {showDemo && (
          <div className="mt-8 pt-8 border-t border-gray-100 text-left">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                {DEMO_QUESTION.examType}
              </span>
              <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                {DEMO_QUESTION.subject}
              </span>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-6">
              {DEMO_QUESTION.questionText}
            </p>
            <div className="space-y-3">
              {DEMO_QUESTION.options.map((option) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption = option === DEMO_QUESTION.correctAnswer;

                let optionClass =
                  "w-full text-left p-4 rounded-lg border-2 transition-colors ";
                if (!hasAnswered) {
                  optionClass +=
                    "border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer";
                } else if (isCorrectOption) {
                  optionClass += "border-green-500 bg-green-50 text-green-800";
                } else if (isSelected) {
                  optionClass += "border-red-400 bg-red-50 text-red-800";
                } else {
                  optionClass += "border-gray-200 text-gray-500";
                }

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={hasAnswered}
                    onClick={() => setSelectedAnswer(option)}
                    className={optionClass}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {hasAnswered && (
              <div
                className={`mt-6 p-4 rounded-lg ${
                  isCorrect ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"
                }`}
              >
                <p className={`font-semibold mb-2 ${isCorrect ? "text-green-800" : "text-orange-800"}`}>
                  {isCorrect ? "Correct! 🎉" : "Not quite — here's the solution:"}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {DEMO_QUESTION.explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
