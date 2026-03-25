
import { GoogleGenAI, Type } from "@google/genai";
import { Quiz } from "../types";

const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!key || key === 'undefined') {
    console.error("Gemini API Key is missing! Please check your environment variables.");
  }
  return key;
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const generateQuizWithAI = async (topic: string, difficulty: string, numQuestions: number, duration: number, additionalDescription?: string, language: string = 'English'): Promise<Quiz> => {
  
  const prompt = `Create a multiple choice quiz about "${topic}". 
  Language: ${language}.
  Difficulty: ${difficulty}. 
  Number of questions: ${numQuestions}.
  ${additionalDescription ? `Additional Context/Instructions: ${additionalDescription}` : ''}
  
  Format the output as a JSON object matching this schema. Ensure 'options' has exactly 4 choices and 'correctAnswerIndex' is 0-3. All text content (title, description, questions, options) MUST be in ${language}.`;

  try {
    console.log("Generating quiz for topic:", topic);
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            questionsArray: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionText: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswerIndex: { type: Type.INTEGER }
                },
                required: ["questionText", "options", "correctAnswerIndex"]
              }
            }
          },
          required: ["title", "description", "questionsArray"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from AI");

    const data = JSON.parse(text);

    return {
      _id: `q_ai_${Date.now()}`,
      category: 'AI Generated',
      difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
      duration: duration,
      ...data
    };
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};

/**
 * AI Quiz Quality Analyzer
 */
export const analyzeQuizQuality = async (quiz: Quiz): Promise<{ score: number, suggestions: string[] }> => {
  const prompt = `Analyze the quality of this quiz.
  Title: ${quiz.title}
  Description: ${quiz.description}
  Questions: ${JSON.stringify(quiz.questionsArray)}
  
  Evaluate clarity, distractor quality, and difficulty balance.
  Return a JSON object with a 'score' (0-100) and an array of 'suggestions'.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{"score": 0, "suggestions": []}');
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return { score: 0, suggestions: ["AI analysis unavailable."] };
  }
};

/**
 * AI Study Mode: Generate Flashcards and Summaries
 */
export interface StudyMaterials {
  flashcards: { front: string, back: string }[];
  summary: string;
}

export const generateStudyMaterials = async (quiz: Quiz): Promise<StudyMaterials> => {
  const prompt = `Convert the following quiz content into study materials.
  Topic: ${quiz.title}
  Content: ${JSON.stringify(quiz.questionsArray.map(q => ({ q: q.questionText, a: q.options[q.correctAnswerIndex] })))}
  
  Return a JSON object with:
  1. 'flashcards': an array of objects with 'front' (question/concept) and 'back' (answer/explanation).
  2. 'summary': a one-page concise revision summary of the key concepts covered.`;

  try {
    console.log("Generating study materials for quiz:", quiz.title);
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{"flashcards": [], "summary": ""}');
  } catch (error) {
    console.error("AI Study Mode Error:", error);
    throw error;
  }
};

/**
 * New Feature: Explain why an answer is correct using Gemini.
 */
export const getAIExplanation = async (question: string, options: string[], correctIndex: number): Promise<string> => {
  const prompt = `Explain briefly why the following is the correct answer. 
  Question: "${question}"
  Options: ${options.join(', ')}
  Correct Answer: "${options[correctIndex]}"
  Keep it concise (max 3 sentences) and educational.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "No explanation available.";
  } catch (error) {
    console.error("AI Explanation Error:", error);
    return "The AI is currently resting. Please try again later!";
  }
};

/**
 * New Feature: Generate Quiz from an Image (multimodal)
 */
export const generateQuizFromImage = async (base64Image: string, mimeType: string, difficulty: string, numQuestions: number, duration: number, language: string = 'English'): Promise<Quiz> => {
  const prompt = `Analyze this image (it might be a textbook page, handwritten notes, or an infographic) and create a multiple choice quiz based on its content.
  Language: ${language}.
  Difficulty: ${difficulty}. 
  Number of questions: ${numQuestions}.
  
  Format the output as a JSON object matching this schema. Ensure 'options' has exactly 4 choices and 'correctAnswerIndex' is 0-3. All text content (title, description, questions, options) MUST be in ${language}.`;

  try {
    console.log("Generating quiz from image...");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        },
        { text: prompt }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            questionsArray: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionText: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswerIndex: { type: Type.INTEGER }
                },
                required: ["questionText", "options", "correctAnswerIndex"]
              }
            }
          },
          required: ["title", "description", "questionsArray"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from AI");

    const data = JSON.parse(text);

    return {
      _id: `q_img_${Date.now()}`,
      category: 'AI Generated',
      difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
      duration: duration,
      ...data
    };
  } catch (error) {
    console.error("Error generating quiz from image:", error);
    throw error;
  }
};
