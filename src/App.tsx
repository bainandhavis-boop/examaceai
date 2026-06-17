import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { OnboardingForm } from "./components/OnboardingForm";
import { LandingValueProposition } from "./components/LandingValueProposition";
import { LandingHowItWorks } from "./components/LandingHowItWorks";
import { LandingSupportedExams } from "./components/LandingSupportedExams";

const LANDING_FEATURES = [
  {
    icon: "📸",
    iconBg: "bg-blue-100",
    title: "Snap & Solve",
    description:
      "Upload any exam question and receive detailed step-by-step explanations.",
  },
  {
    icon: "🎯",
    iconBg: "bg-green-100",
    title: "Predictive Exams",
    description:
      "Practice with AI-generated mock exams based on historical exam trends.",
  },
  {
    icon: "🎧",
    iconBg: "bg-purple-100",
    title: "Voice Literature",
    description:
      "Listen to simple audio explanations of prescribed literature texts.",
  },
  {
    icon: "🏆",
    iconBg: "bg-orange-100",
    title: "Weekly Battles",
    description:
      "Compete with students nationwide and climb the leaderboard.",
  },
] as const;

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-green-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">EA</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            ExamAce AI
          </h2>
        </div>
        <Authenticated>
          <SignOutButton />
        </Authenticated>
      </header>
      <main className="flex-1 p-4">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.examFunctions.getUserProfile);

  if (loggedInUser === undefined || userProfile === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Unauthenticated>
        <div className="text-center py-12">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
              ExamAce AI
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Your AI-Powered Nigerian Exam Preparation Platform
            </p>
            <p className="text-lg text-gray-500">
              Master JAMB, WAEC & NECO with Smart AI Technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
            {LANDING_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center"
              >
                <div
                  className={`w-12 h-12 ${feature.iconBg} rounded-lg flex items-center justify-center mb-4`}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {feature.icon}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <LandingSupportedExams />

          <LandingValueProposition
            onTryOwnQuestion={() => {
              document.getElementById("sign-in")?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          <LandingHowItWorks />

          <div id="sign-in" className="max-w-md mx-auto scroll-mt-24">
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        {!userProfile ? (
          <OnboardingForm />
        ) : (
          <Dashboard />
        )}
      </Authenticated>
    </div>
  );
}
