import { GoogleGenerativeAI } from "@google/generative-ai";
import { PORTFOLIO_CHATBOT } from "@/config/config";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured. Using local fallback mode." }),
        { status: 503 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: process.env.CHAT_MODEL || "gemini-2.0-flash",
      systemInstruction: PORTFOLIO_CHATBOT.systemPrompt,
    });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ reply: text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch response" }), {
      status: 500,
    });
  }
}
