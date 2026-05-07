import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY || "";

export const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface DiscoveryItem {
  type: 'actor' | 'product';
  name: string;
  subTitle: string; // Actor: Role, Product: Brand
  description: string;
  details: string[]; // Actor: Works, Product: specs
  price?: string;
  naverSearchQuery: string;
  center: { x: number; y: number };
}

export async function analyzeImage(base64Image: string): Promise<DiscoveryItem[]> {
  if (!API_KEY) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const prompt = `Analyze this image (likely a movie scene, drama, or shopping context).
  Identify:
  1. Actors/People of interest.
  2. Notable fashion items, accessories, electronics, or objects visible on characters or in the scene.

  For each item, provide:
  - "type": either 'actor' or 'product'.
  - "name": Real name of actor OR generic/specific product name.
  - "subTitle": Role name (for actors) OR Brand name (for products).
  - "description": A short, catchy 1-sentence insight.
  - "details": 2-3 key points (Representative works for actors, specs/materials for products).
  - "price": Estimated price if it's a product (e.g., "$500" or "₩250,000").
  - "naverSearchQuery": A optimized Korean search query for Naver (e.g. "[브랜드명] [제품명]").
  - "center": Center coordinates (x, y as 0.0-1.0).

  Return as a JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Image,
                mimeType: "image/jpeg",
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ['actor', 'product'] },
              name: { type: Type.STRING },
              subTitle: { type: Type.STRING },
              description: { type: Type.STRING },
              details: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              price: { type: Type.STRING },
              naverSearchQuery: { type: Type.STRING },
              center: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                },
                required: ["x", "y"],
              },
            },
            required: ["type", "name", "subTitle", "description", "details", "naverSearchQuery", "center"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return [];
  }
}
