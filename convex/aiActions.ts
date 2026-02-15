"use node";

import { action, mutation } from "./_generated/server";
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
