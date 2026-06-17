"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

// Analyze scanned question image and provide solution
export const analyzeScannedQuestion = action({
  args: {
    imageId: v.id("_storage"),
    subject: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the image URL
    const imageUrl = await ctx.storage.getUrl(args.imageId);
    if (!imageUrl) {
      throw new Error("Image not found");
    }

    try {
      // Use GPT-4 Vision to analyze the image
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are ExamAce AI, a Nigerian exam preparation tutor. Analyze this ${args.subject || 'academic'} question image and provide:

1. Extract the question text clearly
2. Identify the subject if not provided
3. Provide a detailed, step-by-step solution suitable for Nigerian secondary school students
4. Explain concepts in simple terms
5. Include the final answer clearly

Format your response as JSON with these fields:
- extractedText: the question text
- subject: the identified subject
- solution: detailed step-by-step explanation
- finalAnswer: the correct answer
- confidence: confidence level (0-1)`,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      const aiResponse = response.choices[0].message.content;
      
      // Try to parse as JSON, fallback to plain text
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(aiResponse || "{}");
      } catch {
        parsedResponse = {
          extractedText: "Could not extract question text",
          subject: args.subject || "Unknown",
          solution: aiResponse || "Could not generate solution",
          finalAnswer: "Please check the solution steps",
          confidence: 0.5,
        };
      }

      // Save to database
      const userId = await ctx.runQuery(api.auth.loggedInUser);
      if (userId) {
        await ctx.runMutation(internal.examFunctions.saveScannedQuestion, {
          userId: userId._id,
          imageId: args.imageId,
          extractedText: parsedResponse.extractedText,
          subject: parsedResponse.subject,
          aiSolution: parsedResponse.solution,
          confidence: parsedResponse.confidence,
        });
      }

      return parsedResponse;
    } catch (error) {
      console.error("Error analyzing image:", error);
      throw new Error("Failed to analyze the question image. Please try again.");
    }
  },
});

// Generate literature explanation
export const generateLiteratureExplanation = action({
  args: {
    bookTitle: v.string(),
    chapter: v.optional(v.string()),
    topic: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const prompt = `You are ExamAce AI, a Nigerian literature tutor. Explain "${args.bookTitle}"${args.chapter ? ` - Chapter: ${args.chapter}` : ''}${args.topic ? ` - Topic: ${args.topic}` : ''} in simple, clear language suitable for JAMB and WAEC students.

Include:
1. Plot summary (if applicable)
2. Key characters and their roles
3. Important themes
4. Literary devices used
5. Likely exam questions and answers
6. Tips for remembering key points

Keep explanations simple and relatable to Nigerian students.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 800,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error generating literature explanation:", error);
      throw new Error("Failed to generate explanation. Please try again.");
    }
  },
});

// Process PDF past questions: extract text, parse with AI, add to question bank
export const processPdfPastQuestions = action({
  args: {
    pdfStorageId: v.id("_storage"),
    examType: v.union(v.literal("JAMB"), v.literal("WAEC"), v.literal("ICAN"), v.literal("TRCN")),
    subject: v.string(),
    year: v.optional(v.number()),
    startYear: v.optional(v.number()),
    endYear: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ count: number; total: number }> => {
    if (!args.year && (!args.startYear || !args.endYear)) {
      throw new Error("Either provide a single year or both startYear and endYear");
    }
    if (args.startYear && args.endYear && args.startYear > args.endYear) {
      throw new Error("Start year must be less than or equal to end year");
    }
    
    const pdfUrl = await ctx.storage.getUrl(args.pdfStorageId);
    if (!pdfUrl) throw new Error("PDF not found");

    const response = await fetch(pdfUrl);
    if (!response.ok) throw new Error("Failed to fetch PDF");
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text: string;
    try {
      const pdfModule = await import("pdf-parse");
      let result: { text: string };
      
      // pdf-parse v2.4.5 uses class-based API
      if (pdfModule.PDFParse) {
        const parser = new pdfModule.PDFParse({ data: buffer });
        result = await parser.getText();
        await parser.destroy();
      } else {
        throw new Error("pdf-parse module format not recognized. Expected PDFParse class.");
      }
      
      text = result?.text ?? "";
    } catch (error) {
      console.error("PDF parsing error:", error);
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : "Unknown error"}. Make sure pdf-parse is installed (run: npm install)`);
    }
    if (!text || text.trim().length < 50) {
      throw new Error("Could not extract text from PDF. It may be scanned/image-based. Try converting pages to images and use Snap & Solve.");
    }

    const yearRangePrompt = args.startYear && args.endYear 
      ? `This PDF contains questions from ${args.startYear} to ${args.endYear}. Try to identify the year for each question from context (e.g., "JAMB 2015", "2020", etc.). If you cannot determine the year, assign it evenly across the range.`
      : args.year 
        ? `All questions are from year ${args.year}.`
        : "";

    const prompt = `You are ExamAce AI. Extract ALL exam questions from this Nigerian past questions PDF text.
Format each question as JSON. Return ONLY a valid JSON array, no other text.

${yearRangePrompt}

Each object must have:
- questionText: string (the question)
- options: string[] (A, B, C, D or similar - exactly the options as listed)
- correctAnswer: string (the correct option text)
- explanation: string (brief explanation of the answer)
- year: number (the year this question appeared - extract from context if possible, or use the provided year/range)
- difficulty: "easy" | "medium" | "hard" (optional, default "medium")
- topic: string (optional, e.g. "Algebra", "Waves")

Example: [{"questionText":"What is 2+2?","options":["3","4","5","6"],"correctAnswer":"4","explanation":"Basic addition.","year":2024,"difficulty":"easy","topic":"Arithmetic"}]

PDF text:
\`\`\`
${text.slice(0, 12000)}
\`\`\`

Return the JSON array of questions:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 8000,
    });

    const content = completion.choices[0].message.content?.trim() ?? "[]";
    let jsonStr = content;
    const match = content.match(/\[[\s\S]*\]/);
    if (match) jsonStr = match[0];

    let parsed: Array<{
      questionText: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
      year?: number;
      difficulty?: "easy" | "medium" | "hard";
      topic?: string;
    }>;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      throw new Error("AI could not parse questions from this PDF. Try a simpler or cleaner PDF.");
    }
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("No questions were found in this PDF.");
    }

    const defaultYear = args.year ?? args.endYear ?? new Date().getFullYear();
    const startYear = args.startYear ?? defaultYear;
    const endYear = args.endYear ?? defaultYear;
    const yearSpan = endYear - startYear + 1;

    const questions = parsed
      .filter((q) => q.questionText && Array.isArray(q.options) && q.options.length >= 2 && q.correctAnswer)
      .map((q, index) => {
        let questionYear = q.year;
        if (!questionYear || questionYear < startYear || questionYear > endYear) {
          if (args.startYear && args.endYear) {
            questionYear = startYear + (index % yearSpan);
          } else {
            questionYear = defaultYear;
          }
        }
        return {
          questionText: String(q.questionText).slice(0, 2000),
          options: q.options.map((o: unknown) => String(o)).slice(0, 10),
          correctAnswer: String(q.correctAnswer),
          explanation: String(q.explanation || "").slice(0, 2000) || "See solution steps.",
          year: questionYear,
          difficulty: q.difficulty && ["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : undefined,
          topic: q.topic ? String(q.topic).slice(0, 100) : undefined,
        };
      });

    const count: number = await ctx.runMutation(internal.examFunctions.addQuestionsFromPdfWithYears, {
      examType: args.examType,
      subject: args.subject,
      questions,
    });

    return { count, total: questions.length };
  },
});
