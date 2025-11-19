import { GoogleGenAI } from "@google/genai";
import { DataStats } from '../types';

// Declare process to avoid TypeScript errors if types are missing, 
// and strictly follow the guideline to use process.env.API_KEY.
declare const process: { env: { [key: string]: string | undefined } };

// Retrieve API Key from Environment Variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Missing API_KEY environment variable.");
}

export const generateStory = async (stats: DataStats, customPrompt?: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please set API_KEY in your environment.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Construct a context-rich prompt
  const context = `
    Data Summary:
    - Total Records: ${stats.totalRows}
    - Total Amount/Value: ${stats.totalAmount.toLocaleString()}
    - Top Performer (BA/Customer): ${stats.topBA ? `${stats.topBA.name} (${stats.topBA.value.toLocaleString()})` : 'N/A'}
    - Time Period Trend: ${JSON.stringify(stats.monthlyTrend)}
    - Category Breakdown: ${JSON.stringify(stats.categoryBreakdown)}
  `;

  const userInstruction = customPrompt || "Analyze the data and tell a compelling business story about the performance, trends, and anomalies.";

  const fullPrompt = `
    You are an expert Data Analyst and Storyteller. 
    Your goal is to interpret the provided CSV summary data and write a narrative report in Markdown format.
    
    ${context}

    Instructions:
    1. Give a catchy title.
    2. Explain the "Big Picture" (Total performance).
    3. Highlight the "Heroes" (Top BAs or Categories).
    4. Analyze the "Journey" (Time trends, spikes, drops). Explain WHY spikes might have happened based on general business logic if specific reasons aren't in data.
    5. Provide "Recommendations" for the future.
    6. Use emojis and clear headers.
    7. Use strictly Thai language for the response.

    User Request: ${userInstruction}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        temperature: 0.7, // Balance between creativity and facts
      }
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate story from Gemini.");
  }
};