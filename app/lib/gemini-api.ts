// Import the required modules from the Google Generative AI SDK
import { GoogleGenAI } from "@google/genai";
import { z } from "zod"; // For schema validation
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs

// Define the structure for a trivia question from Gemini
export interface GeminiTriviaQuestion {
  id: string;
  category:
    | "development"
    | "memes-nfts-tokens"
    | "scams-incidents"
    | "crypto-characters";
  question: string;
  options: string[];
  correctAnswer: number;
  yearIndicator: number;
}

// Define the categories we want questions for
export const TRIVIA_CATEGORIES: Array<GeminiTriviaQuestion["category"]> = [
  "development",
  "memes-nfts-tokens",
  "scams-incidents",
  "crypto-characters",
];

/**
 * Fetches a batch of crypto trivia questions from Gemini API in a single request
 * This reduces the number of API calls to avoid rate limiting
 * @param apiKey - The Gemini API key
 * @param count - The total number of questions to generate
 * @param difficulty - The difficulty level of the questions
 * @returns A promise that resolves to an array of trivia questions
 */
export async function fetchTriviaQuestionsBatchFromGemini(
  apiKey: string,
  count: number = 10,
  difficulty: "easy" | "medium" | "hard" = "medium"
): Promise<GeminiTriviaQuestion[]> {
  if (!apiKey) {
    throw new Error("Gemini API key is required");
  }

  // Initialize the Gemini API client with the API key
  const ai = new GoogleGenAI({ apiKey });

  // Calculate the starting year based on difficulty
  // For harder difficulties, we'll start with more recent years
  const startYear = 2024;
  const yearDecrement =
    difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;

  // Prepare the questions array
  const questions: GeminiTriviaQuestion[] = [];

  // Calculate how many questions we need per category
  const questionsPerCategory = Math.floor(count / TRIVIA_CATEGORIES.length);
  const remainder = count % TRIVIA_CATEGORIES.length;

  // Prepare the batch prompt with all questions we need
  const batchPrompts: { category: string; year: number }[] = [];

  // Build the batch of question requests
  for (let i = 0; i < TRIVIA_CATEGORIES.length; i++) {
    const category = TRIVIA_CATEGORIES[i];
    const categoryCount =
      i < remainder ? questionsPerCategory + 1 : questionsPerCategory;

    for (let j = 0; j < categoryCount; j++) {
      const year = startYear - j * yearDecrement;

      // Skip years before 2009 (Bitcoin's creation)
      if (year < 2009) continue;

      batchPrompts.push({ category, year });
    }
  }

  // Create a single prompt that requests all questions at once
  const prompt = `Generate ${
    batchPrompts.length
  } different crypto trivia questions according to the following specifications:

${batchPrompts
  .map(
    (item, index) =>
      `Question ${
        index + 1
      }: About events, developments, or notable things that happened specifically in the year ${
        item.year
      } related to the category "${item.category}".`
  )
  .join("\n")}

Each question should be multiple choice with 4 options, with only one correct answer.

Format your response as a valid JSON array with the following structure:
[
  {
    "category": "${batchPrompts[0]?.category || "development"}",
    "year": ${batchPrompts[0]?.year || 2024},
    "question": "The question text",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": 0 // Index of the correct answer (0-3)
  },
  // more questions...
]

Make sure each question is specifically about something that happened in the specified year, not before or after.`;

  try {
    // Generate content using the Gemini API with a higher token limit for batch processing
    const request = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192, // Increased token limit for batch processing
      },
    };

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash", // Use gemini-2.0-flash for better performance
      ...request,
    });

    // Extract text from the response
    const responseText = result.text
      ? result.text
      : result.responseId
      ? await result.data
      : null;
    if (!responseText) throw new Error("Empty response from Gemini API");
    const text = responseText;

    // Extract the JSON from the response
    const jsonMatch =
      text.match(/```json\n([\s\S]*?)\n```/) ||
      text.match(/```([\s\S]*?)```/) ||
      text.match(/\[\s*{[\s\S]*?}\s*\]/);

    if (jsonMatch) {
      const jsonText = jsonMatch[1] || jsonMatch[0];
      try {
        const parsedResponse = JSON.parse(jsonText.replace(/```/g, "").trim());

        // Validate that we got an array of questions
        if (Array.isArray(parsedResponse)) {
          // Process each question in the batch
          for (const item of parsedResponse) {
            // Validate the question structure
            if (
              item.question &&
              Array.isArray(item.options) &&
              item.options.length === 4 &&
              typeof item.correctAnswer === "number" &&
              item.correctAnswer >= 0 &&
              item.correctAnswer <= 3 &&
              item.category &&
              TRIVIA_CATEGORIES.includes(item.category) &&
              typeof item.year === "number"
            ) {
              // Create a question object
              const question: GeminiTriviaQuestion = {
                id: `${item.category}-${item.year}-${uuidv4().slice(0, 8)}`,
                category: item.category,
                question: item.question,
                options: item.options,
                correctAnswer: item.correctAnswer,
                yearIndicator: item.year,
              };

              questions.push(question);
            } else {
              console.error("Invalid question structure:", item);
            }
          }
        } else {
          console.error("Response is not an array:", parsedResponse);
        }
      } catch (parseError) {
        console.error("Failed to parse JSON from Gemini response:", parseError);
      }
    } else {
      console.error("No JSON found in Gemini response:", text);
    }
  } catch (error) {
    console.error(`Error generating batch questions:`, error);
  }

  // If we couldn't generate enough questions, fill in with questions from random years
  if (questions.length < count) {
    const remainingCount = count - questions.length;

    // Prepare backup batch prompts
    const backupBatchPrompts: { category: string; year: number }[] = [];

    for (let i = 0; i < remainingCount; i++) {
      const category = TRIVIA_CATEGORIES[i % TRIVIA_CATEGORIES.length];
      const year = Math.floor(Math.random() * (2024 - 2009)) + 2009;
      backupBatchPrompts.push({ category, year });
    }

    // Create a single backup prompt for all remaining questions
    const backupPrompt = `Generate ${
      backupBatchPrompts.length
    } different crypto trivia questions according to the following specifications:

${backupBatchPrompts
  .map(
    (item, index) =>
      `Question ${
        index + 1
      }: About events, developments, or notable things that happened around the year ${
        item.year
      } related to the category "${item.category}".`
  )
  .join("\n")}

Each question should be multiple choice with 4 options, with only one correct answer.

Format your response as a valid JSON array with the following structure:
[
  {
    "category": "${backupBatchPrompts[0]?.category || "development"}",
    "year": ${backupBatchPrompts[0]?.year || 2024},
    "question": "The question text",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": 0 // Index of the correct answer (0-3)
  },
  // more questions...
]`;

    try {
      // Create a properly typed request object
      const backupRequest = {
        contents: [{ role: "user", parts: [{ text: backupPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 8192, // Increased token limit for batch processing
        },
      };

      // Use the model name that's supported in this version
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        ...backupRequest,
      });

      // Extract text from the response
      const responseText = result.text ? result.text : result.data;
      if (!responseText) throw new Error("No text response from Gemini API");
      const text = responseText;

      // Extract the JSON from the response
      const jsonMatch =
        text.match(/```json\n([\s\S]*?)\n```/) ||
        text.match(/```([\s\S]*?)```/) ||
        text.match(/\[\s*{[\s\S]*?}\s*\]/);

      if (jsonMatch) {
        const jsonText = jsonMatch[1] || jsonMatch[0];
        try {
          const parsedResponse = JSON.parse(
            jsonText.replace(/```/g, "").trim()
          );

          // Validate that we got an array of questions
          if (Array.isArray(parsedResponse)) {
            // Process each question in the batch
            for (const item of parsedResponse) {
              try {
                // Zod validation for trivia question
                const triviaSchema = z.object({
                  category: z.enum([
                    "development",
                    "memes-nfts-tokens",
                    "scams-incidents",
                    "crypto-characters",
                  ]),
                  question: z.string(),
                  options: z.array(z.string()).length(4),
                  correctAnswer: z.number().min(0).max(3),
                  year: z.number().optional(),
                });

                const validatedItem = triviaSchema.parse(item);

                const question: GeminiTriviaQuestion = {
                  id: `${validatedItem.category}-${
                    validatedItem.year || 2020
                  }-${uuidv4().slice(0, 8)}`,
                  category: validatedItem.category,
                  question: validatedItem.question,
                  options: validatedItem.options,
                  correctAnswer: validatedItem.correctAnswer,
                  yearIndicator: validatedItem.year || 2020,
                };

                questions.push(question);
              } catch (validationError) {
                console.error("Validation error:", validationError);
              }
            }
          } else {
            console.error("Backup response is not an array:", parsedResponse);
          }
        } catch (parseError) {
          console.error("Failed to parse backup JSON:", parseError);
        }
      } else {
        console.error("No JSON found in backup response");
      }
    } catch (error) {
      console.error(`Error generating backup questions:`, error);
    }
  }

  // Shuffle the questions to mix categories
  return questions.sort(() => 0.5 - Math.random()).slice(0, count);
}

/**
 * Fetches crypto trivia questions from Gemini API based on difficulty
 * This is a legacy function that uses the batch function internally
 * @param apiKey - The Gemini API key
 * @param count - The number of questions to generate
 * @param difficulty - The difficulty level of the questions
 * @returns A promise that resolves to an array of trivia questions
 */
export async function fetchTriviaQuestionsFromGemini(
  apiKey: string,
  count: number = 10,
  difficulty: "easy" | "medium" | "hard" = "medium"
): Promise<GeminiTriviaQuestion[]> {
  return fetchTriviaQuestionsBatchFromGemini(apiKey, count, difficulty);
}
