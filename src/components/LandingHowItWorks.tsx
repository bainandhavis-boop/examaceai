const STEPS = [
  {
    number: 1,
    icon: "📤",
    iconBg: "bg-blue-100",
    title: "Upload a Question",
    description: "Take a photo or upload an exam question.",
  },
  {
    number: 2,
    icon: "🤖",
    iconBg: "bg-green-100",
    title: "AI Analysis",
    description: "The AI reads and understands the question.",
  },
  {
    number: 3,
    icon: "📝",
    iconBg: "bg-purple-100",
    title: "Step-by-Step Solution",
    description: "Receive a detailed explanation instead of just an answer.",
  },
  {
    number: 4,
    icon: "📈",
    iconBg: "bg-orange-100",
    title: "Learn and Improve",
    description: "Understand concepts and prepare better for exams.",
  },
] as const;

export function LandingHowItWorks() {
  return (
    <section className="mb-12 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
          How It{" "}
          <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Works
          </span>
        </h2>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
          From question to mastery in four simple steps
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map((step) => (
          <div
            key={step.number}
            className="bg-white p-6 rounded-xl shadow-lg text-center relative"
          >
            <div className="absolute top-4 left-4 w-7 h-7 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{step.number}</span>
            </div>
            <div
              className={`w-12 h-12 ${step.iconBg} rounded-lg flex items-center justify-center mb-4 mx-auto mt-2`}
            >
              <span className="text-2xl">{step.icon}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
