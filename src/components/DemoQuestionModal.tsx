import { useEffect } from "react";
import { cn } from "../lib/utils";

const DEMO_QUESTION = {
  examType: "JAMB",
  subject: "Physics",
  questionText:
    "A body starts from rest and accelerates at 4 m/s². Find its velocity after 5 seconds.",
  steps: [
    {
      title: "Identify the given values",
      content:
        "Initial velocity u = 0 m/s (starts from rest), acceleration a = 4 m/s², time t = 5 s. We need to find final velocity v.",
    },
    {
      title: "Choose the right formula",
      content:
        "For motion with constant acceleration, use: v = u + at",
    },
    {
      title: "Substitute the values",
      content: "v = 0 + (4 × 5)",
    },
    {
      title: "Calculate the answer",
      content: "v = 20 m/s",
    },
  ],
  finalAnswer: "20 m/s",
};

type DemoQuestionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onTryOwnQuestion: () => void;
};

export function DemoQuestionModal({
  isOpen,
  onClose,
  onTryOwnQuestion,
}: DemoQuestionModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTryOwnQuestion = () => {
    onClose();
    onTryOwnQuestion();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-question-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close demo"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 id="demo-question-title" className="text-lg font-semibold text-gray-900">
            Demo Question
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              {DEMO_QUESTION.examType}
            </span>
            <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
              {DEMO_QUESTION.subject}
            </span>
            <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
              AI Demo
            </span>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Sample Question</p>
            <p className="text-base md:text-lg font-medium text-gray-900 leading-relaxed">
              {DEMO_QUESTION.questionText}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-100 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg" aria-hidden="true">
                🤖
              </span>
              <h3 className="font-semibold text-gray-900">AI Step-by-Step Solution</h3>
            </div>

            <ol className="space-y-4">
              {DEMO_QUESTION.steps.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{step.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed mt-1">
                      {step.content}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-5 pt-4 border-t border-blue-100">
              <p className="text-sm font-medium text-gray-500">Final Answer</p>
              <p className="text-lg font-bold text-green-700 mt-1">
                {DEMO_QUESTION.finalAnswer}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTryOwnQuestion}
            className={cn(
              "w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-lg shadow-lg",
              "hover:shadow-xl transition-all hover:from-blue-700 hover:to-green-700"
            )}
          >
            Try With Your Own Question
          </button>
        </div>
      </div>
    </div>
  );
}
