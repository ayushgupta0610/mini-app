import { GoogleGenerativeAI } from "@google/generative-ai";

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

/**
 * Fetches crypto trivia questions from Gemini API based on difficulty
 * Each question will be from a specific year, with years decreasing as difficulty increases
 */
export async function fetchTriviaQuestionsFromGemini(
  apiKey: string,
  count: number = 8,
  difficulty: "easy" | "medium" | "hard" = "medium"
): Promise<GeminiTriviaQuestion[]> {
  if (!apiKey) {
    throw new Error("Gemini API key is required");
  }

  // Initialize the Gemini API client
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Calculate the starting year based on difficulty
  // For harder difficulties, we'll start with more recent years
  const startYear = 2024;
  const yearDecrement =
    difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;

  // Prepare the questions array
  const questions: GeminiTriviaQuestion[] = [];

  // Define the categories we want questions for
  const categories: Array<GeminiTriviaQuestion["category"]> = [
    "development",
    "memes-nfts-tokens",
    "scams-incidents",
    "crypto-characters",
  ];

  // Calculate how many questions we need per category
  const questionsPerCategory = Math.floor(count / categories.length);
  const remainder = count % categories.length;

  // For each category, generate the appropriate number of questions
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const categoryCount =
      i < remainder ? questionsPerCategory + 1 : questionsPerCategory;

    for (let j = 0; j < categoryCount; j++) {
      const year = startYear - j * yearDecrement;

      // Skip years before 2009 (Bitcoin's creation)
      if (year < 2009) continue;

      try {
        const prompt = `Generate a crypto trivia question about events, developments, or notable things that happened specifically in the year ${year} related to the category "${category}".

The question should be multiple choice with 4 options, with only one correct answer.

Format your response as a valid JSON object with the following structure:
{
  "question": "The question text",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswer": 0, // Index of the correct answer (0-3)
  "explanation": "Brief explanation of why this is the correct answer"
}

Make sure the question is specifically about something that happened in ${year}, not before or after.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract the JSON from the response
        const jsonMatch =
          text.match(/```json\n([\s\S]*?)\n```/) ||
          text.match(/```([\s\S]*?)```/) ||
          text.match(/{[\s\S]*?}/);

        if (jsonMatch) {
          const jsonText = jsonMatch[1] || jsonMatch[0];
          const parsedResponse = JSON.parse(
            jsonText.replace(/```/g, "").trim()
          );

          // Create a question object
          const question: GeminiTriviaQuestion = {
            id: `${category}-${year}-${j}`,
            category,
            question: parsedResponse.question,
            options: parsedResponse.options,
            correctAnswer: parsedResponse.correctAnswer,
            yearIndicator: year,
          };

          questions.push(question);
        } else {
          console.error("Failed to parse JSON from Gemini response:", text);
          // If we can't parse the response, we'll skip this question
          continue;
        }
      } catch (error) {
        console.error(
          `Error generating question for ${category} in year ${year}:`,
          error
        );
        // If there's an error, we'll skip this question
        continue;
      }
    }
  }

  // If we couldn't generate enough questions, fill in with questions from random years
  if (questions.length < count) {
    const remainingCount = count - questions.length;
    for (let i = 0; i < remainingCount; i++) {
      const category = categories[i % categories.length];
      const year = Math.floor(Math.random() * (2024 - 2009)) + 2009;

      try {
        const prompt = `Generate a crypto trivia question about events, developments, or notable things that happened around the year ${year} related to the category "${category}".

The question should be multiple choice with 4 options, with only one correct answer.

Format your response as a valid JSON object with the following structure:
{
  "question": "The question text",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswer": 0, // Index of the correct answer (0-3)
  "explanation": "Brief explanation of why this is the correct answer"
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract the JSON from the response
        const jsonMatch =
          text.match(/```json\n([\s\S]*?)\n```/) ||
          text.match(/```([\s\S]*?)```/) ||
          text.match(/{[\s\S]*?}/);

        if (jsonMatch) {
          const jsonText = jsonMatch[1] || jsonMatch[0];
          const parsedResponse = JSON.parse(
            jsonText.replace(/```/g, "").trim()
          );

          // Create a question object
          const question: GeminiTriviaQuestion = {
            id: `${category}-${year}-backup-${i}`,
            category,
            question: parsedResponse.question,
            options: parsedResponse.options,
            correctAnswer: parsedResponse.correctAnswer,
            yearIndicator: year,
          };

          questions.push(question);
        }
      } catch (error) {
        console.error(`Error generating backup question:`, error);
        continue;
      }
    }
  }

  // Shuffle the questions to mix categories
  return questions.sort(() => 0.5 - Math.random());
}
