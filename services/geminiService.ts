
import { GoogleGenAI } from "@google/genai";
import { Transaction, TransactionType } from '../types';

/**
 * Generates financial insights using Gemini 3 Flash.
 * Follows Google GenAI SDK best practices for initialization and content generation.
 */
export const getBudgetAnalysis = async (transactions: Transaction[]): Promise<string> => {
  const apiKey = process.env.API_KEY;

  // Fallback if no API Key is available (Demo Mode)
  if (!apiKey || apiKey.length === 0) {
    console.log("Demo Mode: Returning mock AI response.");
    
    // Calculate basic stats for the mock response so it feels real
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    // Find top category
    const catTotals: Record<string, number> = {};
    expenses.forEach(t => {
        catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    });
    const sortedCats = Object.entries(catTotals).sort((a,b) => b[1] - a[1]);
    const topCatName = sortedCats.length > 0 ? sortedCats[0][0] : 'None';

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return `### 🤖 AI Advisor (Demo Mode)

> *Note: Real AI analysis is disabled because the API Key is missing in your environment. Here is a simulation based on your local data:*

**1. Monthly Summary**
You have tracked **${transactions.length} transactions** so far. Your total expenses currently sit at **$${totalSpent.toFixed(2)}**. 

**2. Top Spending Category**
Your spending is highest in **${topCatName}**. ${topCatName === 'Food' ? 'Dining out is often the easiest place to cut back!' : 'Check if these are fixed or variable costs.'}

**3. Projection**
*Linear Projection:* Based on your current activity, you are on track to stay within a standard budget, provided no large unexpected expenses occur.

**4. Savings Tip**
Try the "30-day rule": wait 30 days before making any non-essential purchase over $50. It helps reduce impulse buying significantly.`;
  }

  // --- REAL AI MODE ---
  try {
    // Create a fresh instance for the request to ensure latest configuration
    const ai = new GoogleGenAI({ apiKey });

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

    // Use ai.models.generateContent with model name and prompt directly
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // Extract text output using the .text property
    return response.text || "I couldn't generate an analysis at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the financial brain right now. Please check your internet connection or API key.";
  }
};
