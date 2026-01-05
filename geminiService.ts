
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  analyzeReport: async (reportText: string): Promise<AIAnalysis> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this daily report and provide a JSON summary: ${reportText}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: "A one-sentence summary of the report." },
              suggestions: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Actionable advice based on the content."
              },
              sentiment: { 
                type: Type.STRING, 
                enum: ["positive", "neutral", "concerned"],
                description: "Overall tone of the report."
              }
            },
            required: ["summary", "suggestions", "sentiment"]
          }
        }
      });

      // Fixed: response.text is a property. Use it directly and handle potential empty/undefined response.
      const jsonStr = response.text?.trim() || "{}";
      return JSON.parse(jsonStr) as AIAnalysis;
    } catch (error) {
      console.error("AI Analysis failed:", error);
      return {
        summary: "分析できませんでした。",
        suggestions: ["継続して業務に取り組んでください。"],
        sentiment: "neutral"
      };
    }
  }
};
