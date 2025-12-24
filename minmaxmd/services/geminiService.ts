import { GoogleGenAI } from "@google/genai";
import { Transaction } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBudgetAnalysis = async (transactions: Transaction[]): Promise<string> => {
  try {
    // Simplify data to send fewer tokens and focus on substance
    const simplifiedData = transactions.map(t => ({
      date: t.date.split('T')[0],
      amount: t.amount,
      category: t.category,
      type: t.type,
      desc: t.description
    }));

    const prompt = `
      Act as a financial advisor. Here is a JSON list of my recent transactions:
      ${JSON.stringify(simplifiedData)}

      Please provide a brief, actionable analysis in Markdown format.
      1. Summarize total income vs expenses for the current month.
      2. Identify the top spending category.
      3. Project my expenses for next month based on this data (linear projection).
      4. Give me one specific tip to save money based on these habits.

      Keep the tone encouraging but professional. Use emojis sparingly.
      If there is not enough data, just give general advice.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "I couldn't generate an analysis at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the financial brain right now. Please try again later.";
  }
};