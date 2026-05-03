import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let ai: any = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export async function askElectionAssistant(prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  if (!ai) {
    throw new Error("Gemini API key is not configured.");
  }

  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are a helpful and authoritative Election Process Education Assistant. 
Your goal is to help users understand:
1. Voter registration processes and requirements.
2. Important election deadlines.
3. How to check their registration status.
4. Voting methods (mail-in, early, day-of).
5. Basic democratic rights and responsibilities.

Always encourage users to verify information with official government websites like vote.gov or their local Secretary of State.
Be neutral, non-partisan, and professional. 
If asked about specific political candidates or who to vote for, politely decline and explain that your purpose is to educate on the process, not the choice.
Format your responses using clean Markdown. Use headings for clarity.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        ...history,
        { role: "user", parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}
