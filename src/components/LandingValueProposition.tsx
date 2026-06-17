import { useState } from "react";
import { DemoQuestionModal } from "./DemoQuestionModal";

type LandingValuePropositionProps = {
  onTryOwnQuestion: () => void;
};

export function LandingValueProposition({ onTryOwnQuestion }: LandingValuePropositionProps) {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <>
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
            onClick={() => setIsDemoOpen(true)}
            className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:from-blue-700 hover:to-green-700"
          >
            Try a Demo Question
          </button>
        </div>
      </section>

      <DemoQuestionModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onTryOwnQuestion={onTryOwnQuestion}
      />
    </>
  );
}
