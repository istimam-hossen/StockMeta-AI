import { GoogleGenAI, Type } from "@google/genai";
import { StockMetadata } from "../types";

// Always use process.env.API_KEY directly for initialization with a named parameter object
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImageMetadata = async (base64Image: string, mimeType: string): Promise<StockMetadata> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: `Analyze this image for a microstock photography professional (Shutterstock, Adobe Stock). 
            Generate a concise SEO-optimized title (max 80 chars), a detailed description (max 200 chars), 
            and exactly 50 relevant keywords/tags separated by commas. 
            Ensure keywords are ordered by relevance.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A professional SEO title for microstock.",
            },
            description: {
              type: Type.STRING,
              description: "A descriptive sentence about the image content.",
            },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of exactly 50 keywords.",
            },
          },
          required: ["title", "description", "keywords"],
        },
      },
    });

    // Access the .text property directly (not as a method)
    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(text.trim()) as StockMetadata;
  } catch (error) {
    console.error("Error generating metadata:", error);
    throw error;
  }
};