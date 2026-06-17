import jambLogo from "../assets/exams/jamb-logo.png";
import waecLogo from "../assets/exams/waec-logo.png";
import necoLogo from "../assets/exams/neco-logo.png";

const SUPPORTED_EXAMS = [
  {
    name: "JAMB",
    subtitle: "UTME Preparation",
    logo: jambLogo,
    icon: "🎓",
    iconBg: "bg-blue-50",
    hoverBorder: "hover:border-blue-200",
  },
  {
    name: "WAEC",
    subtitle: "SSCE Preparation",
    logo: waecLogo,
    icon: "📋",
    iconBg: "bg-green-50",
    hoverBorder: "hover:border-green-200",
  },
  {
    name: "NECO",
    subtitle: "SSCE Preparation",
    logo: necoLogo,
    icon: "📚",
    iconBg: "bg-purple-50",
    hoverBorder: "hover:border-purple-200",
  },
] as const;

export function LandingSupportedExams() {
  return (
    <section className="mb-12 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Supported{" "}
          <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Exams
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {SUPPORTED_EXAMS.map((exam) => (
          <div
            key={exam.name}
            className={`bg-white p-5 md:p-6 rounded-xl shadow-lg border border-transparent ${exam.hoverBorder} transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 flex flex-col items-center text-center`}
          >
            <div
              className={`w-16 h-16 ${exam.iconBg} rounded-lg flex items-center justify-center mb-3 p-2`}
            >
              {exam.logo ? (
                <img
                  src={exam.logo}
                  alt={`${exam.name} logo`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-2xl" aria-hidden="true">
                  {exam.icon}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{exam.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{exam.subtitle}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
