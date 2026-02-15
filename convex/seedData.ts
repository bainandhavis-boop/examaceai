import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Seed sample questions for demo
export const seedSampleQuestions = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if questions already exist
    const existingQuestions = await ctx.db.query("questions").take(1);
    if (existingQuestions.length > 0) {
      return "Questions already seeded";
    }

    // Sample JAMB Physics questions
    const physicsQuestions = [
      {
        examType: "JAMB" as const,
        subject: "Physics",
        year: 2024,
        questionText: "A body of mass 10kg moving with velocity 20m/s collides with another body of mass 5kg at rest. If they stick together after collision, what is their common velocity?",
        options: ["10 m/s", "13.33 m/s", "15 m/s", "20 m/s"],
        correctAnswer: "13.33 m/s",
        explanation: "Using conservation of momentum: m₁u₁ + m₂u₂ = (m₁ + m₂)v. Where m₁=10kg, u₁=20m/s, m₂=5kg, u₂=0. So: (10×20) + (5×0) = (10+5)v. 200 = 15v. Therefore v = 13.33 m/s",
        difficulty: "medium" as const,
        topic: "Momentum and Collisions",
      },
      {
        examType: "JAMB" as const,
        subject: "Physics",
        year: 2024,
        questionText: "What is the frequency of a wave with wavelength 2m traveling at 340m/s?",
        options: ["170 Hz", "680 Hz", "340 Hz", "85 Hz"],
        correctAnswer: "170 Hz",
        explanation: "Using the wave equation: v = fλ. Where v=340m/s and λ=2m. So f = v/λ = 340/2 = 170 Hz",
        difficulty: "easy" as const,
        topic: "Waves",
      },
    ];

    // Sample JAMB Mathematics questions
    const mathQuestions = [
      {
        examType: "JAMB" as const,
        subject: "Mathematics",
        year: 2024,
        questionText: "If log₂(x) = 3, find the value of x.",
        options: ["6", "8", "9", "12"],
        correctAnswer: "8",
        explanation: "If log₂(x) = 3, then x = 2³ = 8. This is because logarithm is the inverse of exponential function.",
        difficulty: "easy" as const,
        topic: "Logarithms",
      },
      {
        examType: "JAMB" as const,
        subject: "Mathematics",
        year: 2024,
        questionText: "Find the derivative of y = 3x² + 2x - 5",
        options: ["6x + 2", "3x + 2", "6x - 5", "3x² + 2"],
        correctAnswer: "6x + 2",
        explanation: "Using the power rule: d/dx(axⁿ) = naxⁿ⁻¹. So d/dx(3x²) = 6x, d/dx(2x) = 2, d/dx(-5) = 0. Therefore dy/dx = 6x + 2",
        difficulty: "medium" as const,
        topic: "Differentiation",
      },
    ];

    // Sample JAMB Chemistry questions
    const chemistryQuestions = [
      {
        examType: "JAMB" as const,
        subject: "Chemistry",
        year: 2024,
        questionText: "What is the molecular formula of glucose?",
        options: ["C₆H₁₂O₆", "C₆H₁₀O₅", "C₁₂H₂₂O₁₁", "C₅H₁₀O₅"],
        correctAnswer: "C₆H₁₂O₆",
        explanation: "Glucose is a simple sugar (monosaccharide) with the molecular formula C₆H₁₂O₆. It has 6 carbon atoms, 12 hydrogen atoms, and 6 oxygen atoms.",
        difficulty: "easy" as const,
        topic: "Organic Chemistry",
      },
    ];

    // Sample JAMB English questions
    const englishQuestions = [
      {
        examType: "JAMB" as const,
        subject: "English",
        year: 2024,
        questionText: "Choose the option that best completes the sentence: 'The student was _____ for his outstanding performance.'",
        options: ["complemented", "complimented", "completed", "competed"],
        correctAnswer: "complimented",
        explanation: "'Complimented' means praised or expressed admiration. 'Complemented' means completed or made perfect. In this context, the student received praise for good performance.",
        difficulty: "medium" as const,
        topic: "Vocabulary",
      },
    ];

    // Insert all questions
    const allQuestions = [...physicsQuestions, ...mathQuestions, ...chemistryQuestions, ...englishQuestions];
    
    for (const question of allQuestions) {
      await ctx.db.insert("questions", question);
    }

    // Create a sample weekly challenge
    const challengeId = await ctx.db.insert("weeklyChallenge", {
      title: "National JAMB Battle - Week 1",
      description: "Test your knowledge across Physics, Mathematics, Chemistry, and English. Top 10 winners get digital badges!",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      questionIds: [], // Will be populated with question IDs
      prizes: ["Gold Badge", "Silver Badge", "Bronze Badge", "Participation Certificate"],
      isActive: true,
    });

    // Create sample literature content
    await ctx.db.insert("literatureContent", {
      title: "The Life Changer",
      author: "Khadija Abubakar Jalli",
      examType: "JAMB" as const,
      chapters: [
        {
          title: "Chapter 1: New Beginnings",
          content: "Salma's journey to university begins with excitement and nervousness...",
          duration: 300, // 5 minutes
        },
        {
          title: "Chapter 2: Campus Life",
          content: "Adapting to university life brings new challenges and friendships...",
          duration: 420, // 7 minutes
        },
      ],
      summary: "The Life Changer follows Salma's transformation from a secondary school student to a university graduate, highlighting the importance of good character, hard work, and making positive life choices.",
      keyThemes: ["Education", "Character Development", "Family Values", "Friendship", "Personal Growth"],
    });

    return "Sample data seeded successfully!";
  },
});
