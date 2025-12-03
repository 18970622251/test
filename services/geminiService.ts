import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Safe initialization
let ai: GoogleGenAI | null = null;
try {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  console.error("Failed to initialize Gemini Client", e);
}

export const GeminiService = {
  generateDescription: async (name: string, categoryTitle: string): Promise<string> => {
    if (!ai) {
      return "请配置 API KEY 以使用 AI 生成功能。";
    }

    try {
      const model = 'gemini-2.5-flash';
      const prompt = `作为一个历史博物馆的专业讲解员，请为"${name}"（属于"${categoryTitle}"分类）写一段简短、庄重且富有教育意义的展品介绍（约100-150字）。内容需符合中国抗战历史背景。`;

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });

      return response.text || "无法生成描述。";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "生成描述时发生错误，请稍后重试。";
    }
  }
};
