import { GoogleGenAI } from "@google/genai";
import { Transaction, TransactionType } from '../types';

// Access the key safely. Vite replaces this string during build.
// @ts-ignore
const apiKey = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

// Initialize Gemini only if a key is present
if (apiKey && apiKey.length > 0) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error("Gemini Client Init Error", error);
  }
}

export const getBudgetAnalysis = async (transactions: Transaction[]): Promise<string> => {
  // --- DEMO MODE (Fallback if no key) ---
  if (!ai) {
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

> *Note: Real AI analysis is disabled because the API Key is missing in your .env file. Here is a simulation based on your local data:*

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
    return "Sorry, I'm having trouble connecting to the financial brain right now. Please check your internet connection or API key.";
  }
};