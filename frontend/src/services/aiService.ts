const API_BASE_URL = "http://127.0.0.1:5000/api";

export interface AIAdviceResponse {
  analysis: string;
  suggestion: string;
  encouragement: string;
  answer_to_question: string | null;
}

export const getNutritionAdvice = async (userId: string, question?: string): Promise<AIAdviceResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/advice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        question: question || null
      }),
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("AI Connection Failed:", error);
    return null;
  }
};