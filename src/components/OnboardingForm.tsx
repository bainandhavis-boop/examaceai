import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { EXAM_TYPES, SUBJECTS_BY_EXAM, type ExamType } from "../lib/examTypes";

export function OnboardingForm() {
  const [examType, setExamType] = useState<ExamType>("JAMB");
  const [targetYear, setTargetYear] = useState(2026);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProfile = useMutation(api.examFunctions.createUserProfile);

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleExamTypeChange = (value: ExamType) => {
    setExamType(value);
    setSelectedSubjects([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSubjects.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }

    setIsSubmitting(true);
    try {
      await createProfile({
        examType,
        targetYear,
        subjects: selectedSubjects,
      });
      toast.success("Profile created successfully! Welcome to ExamAce AI!");
    } catch (error) {
      toast.error("Failed to create profile. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to ExamAce AI!</h2>
        <p className="text-gray-600">Set up your JAMB, WAEC, or NECO preparation journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Which exam are you preparing for?
          </label>
          <div className="grid gap-3">
            {EXAM_TYPES.map((exam) => (
              <label key={exam.value} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="examType"
                  value={exam.value}
                  checked={examType === exam.value}
                  onChange={() => handleExamTypeChange(exam.value)}
                  className="mr-3 text-blue-600"
                />
                <div>
                  <div className="font-medium">{exam.value}</div>
                  <div className="text-sm text-gray-500">{exam.label}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Target Year
          </label>
          <select
            value={targetYear}
            onChange={(e) => setTargetYear(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Your Subjects ({selectedSubjects.length} selected)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
            {SUBJECTS_BY_EXAM[examType].map((subject) => (
              <label key={subject} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(subject)}
                  onChange={() => handleSubjectToggle(subject)}
                  className="mr-2 text-blue-600"
                />
                <span className="text-sm">{subject}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || selectedSubjects.length === 0}
          className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? "Creating Profile..." : "Start My Journey"}
        </button>
      </form>
    </div>
  );
}
