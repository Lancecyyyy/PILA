import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { GameScenario } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function analyzePilaImage(file: File): Promise<GameScenario> {
  // Convert file to base64
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const prompt = `
    You are the backend engine for "Pila Royale," a game that turns Filipino queue chaos into a strategic simulation.
    Analyze this image of a crowd or queue and generate a playable game scenario.

    STEP 1: IMAGE ANALYSIS
    - "Gulo" Factor (Chaos level 1-10)
    - Environmental stressors (Heat, rain, lack of seats, humidity, etc.)
    - 3 Key "characters" seen or implied (e.g., Guard, vendor, angry Tita, Singit-king, exhausted student).

    STEP 2: FILIPINO CHAOS EVENT
    - Generate one "Random Event" that is humorous, culturally specific to the Philippines, and problematic for a "Pila Marshall".

    STEP 3: GAMEPLAY MECHANICS
    - Generate 3 distinct player actions.
    - Each must have a "Success" and "Fail" consequence.
    - The "Success" probability should be inversely proportional to the Gulo Factor.

    OUTPUT FORMAT:
    You MUST output ONLY valid JSON in this structure:
    {
      "imageAnalysis": {
        "guloFactor": number,
        "environmentalStressors": ["string"],
        "keyCharacters": [{"name": "string", "description": "string", "vibe": "string"}]
      },
      "randomEvent": {
        "title": "string",
        "description": "string",
        "target": "string"
      },
      "playerActions": [
        {
          "action": "string",
          "success": "string",
          "fail": "string",
          "successChance": number
        }
      ]
    }
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: base64,
              mimeType: file.type
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json"
    }
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(response.text.trim());
}
