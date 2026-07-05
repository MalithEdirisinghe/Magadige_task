// 🔧 PLACEHOLDER — Replace YOUR_GEMINI_API_KEY with your actual key from:
// https://aistudio.google.com/app/apikey
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export async function breakdownTask(taskTitle: string): Promise<SubTask[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are a productivity assistant. Break down the following task into exactly 3-4 clear, actionable sub-tasks.

Task: "${taskTitle}"

Respond ONLY with a valid JSON array like this (no markdown, no explanation):
[
  {"title": "Sub-task 1"},
  {"title": "Sub-task 2"},
  {"title": "Sub-task 3"}
]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Strip markdown code fences if present
  const jsonStr = text.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
  const parsed: { title: string }[] = JSON.parse(jsonStr);

  return parsed.map((item, idx) => ({
    id: `ai-${Date.now()}-${idx}`,
    title: item.title,
    completed: false,
  }));
}
