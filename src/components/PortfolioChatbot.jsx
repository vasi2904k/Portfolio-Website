"use client";

import { useMemo, useState } from "react";
import { EMAIL, GITHUB_USERNAME, LINKEDIN_URL, PORTFOLIO_CHATBOT, PROFILE } from "@/config/config";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";

const quickFacts = [
  "Machine learning and AI portfolio",
  "Project-based experience with real repositories",
  "Fast links to projects, skills, and contact"
];

const initialMessages = [
  {
    role: "assistant",
    text: "Hi! I am your portfolio assistant. Ask me about skills, projects, background, or contact details."
  }
];

function getPortfolioReply(rawMessage) {
  const message = rawMessage.toLowerCase();

  if (/^(hi|hello|hey)\b/.test(message)) {
    return `Hi! I can quickly help with ${PROFILE.name}'s projects, skills, and contact details.`;
  }

  if (message.includes("name") || message.includes("who are you") || message.includes("about")) {
    return `${PROFILE.name} is a ${PROFILE.title}. ${PROFILE.tagline}.`;
  }

  if (message.includes("skill") || message.includes("stack") || message.includes("tool") || message.includes("tech")) {
    return "Core skills include Python, Scikit-learn, XGBoost, PyTorch, Pandas, NumPy, and Streamlit for practical ML work.";
  }

  if (message.includes("project") || message.includes("portfolio") || message.includes("work")) {
    return "The Projects section shows repositories pulled directly from GitHub, including ML projects and exploratory analysis work.";
  }

  if (message.includes("contact") || message.includes("email") || message.includes("reach") || message.includes("hire")) {
    return `You can reach out via email: ${EMAIL}. You can also connect on LinkedIn: ${LINKEDIN_URL} and GitHub: https://github.com/${GITHUB_USERNAME}.`;
  }

  if (message.includes("github")) {
    return `GitHub profile: https://github.com/${GITHUB_USERNAME}`;
  }

  if (message.includes("linkedin")) {
    return `LinkedIn profile: ${LINKEDIN_URL}`;
  }

  return "I can answer questions about profile, skills, projects, and contact details from this portfolio.";
}

export default function PortfolioChatbot() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const assistantLabel = "Gemini AI";
  const statusNote = "Powered by Google Gemini API";

  const latestAssistantMessage = useMemo(() => {
    return [...messages].reverse().find((message) => message.role === "assistant")?.text;
  }, [messages]);

  async function sendMessage(rawMessage) {
    const trimmed = rawMessage.trim();
    if (!trimmed) {
      return;
    }

    setInput("");

    const nextMessages = [...messages, { role: "user", text: trimmed }];
    setMessages([...nextMessages, { role: "assistant", text: "Thinking..." }]);
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        // Fallback to local regex bot if API is down or key is missing
        const reply = getPortfolioReply(trimmed);
        setMessages([...nextMessages, { role: "assistant", text: reply }]);
      } else {
        const data = await res.json();
        setMessages([...nextMessages, { role: "assistant", text: data.reply }]);
      }
    } catch (error) {
      // Fallback on network error
      const reply = getPortfolioReply(trimmed);
      setMessages([...nextMessages, { role: "assistant", text: reply }]);
    }
    
    setIsSending(false);
  }

  return (
    <section id="chatbot" className="pt-20">
      <SectionTitle
        eyebrow="AI Assistant"
        title="Chat with the Portfolio Assistant"
        description="A smart, AI-driven chatbot experience that lets visitors explore the portfolio naturally and instantly."
      />

      <Reveal>
        <div className="grid gap-6 rounded-[1.75rem] border border-sky-200/20 bg-gradient-to-br from-white/10 via-white/6 to-white/5 p-5 shadow-glass backdrop-blur-xl lg:grid-cols-[1.35fr_0.9fr] md:p-6">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-sky-200/70">{assistantLabel} powered assistant</p>
                <h3 className="mt-1 text-xl font-semibold text-white">Portfolio guidance, instantly</h3>
              </div>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100">
                {statusNote}
              </span>
            </div>

            <div className="mt-4 max-h-[360px] space-y-4 overflow-y-auto pr-2">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-lg ${
                      message.role === "user"
                        ? "rounded-br-sm border border-sky-400/30 bg-gradient-to-br from-sky-500/20 to-sky-400/10 text-sky-50 shadow-sky-900/20 backdrop-blur-md"
                        : "rounded-bl-sm border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-slate-100 shadow-black/20 backdrop-blur-md"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {PORTFOLIO_CHATBOT.prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-white/10 bg-black/25 px-3 py-2 text-left text-xs text-slate-200 transition hover:border-sky-300/40 hover:bg-sky-400/10"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              className="mt-4 flex flex-col gap-3 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage(input);
              }}
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about projects, skills, or contact..."
                className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/40 px-5 py-3.5 text-sm text-white shadow-inner outline-none transition-all placeholder:text-slate-500 focus:border-sky-400/50 focus:bg-black/60 focus:ring-1 focus:ring-sky-400/30"
              />
              <button
                type="submit"
                disabled={isSending}
                className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] hover:shadow-sky-500/40 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSending ? "Replying..." : "Ask Bot"}
              </button>
            </form>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-orange-200/80">What it covers</p>
              <ul className="mt-4 space-y-3">
                {quickFacts.map((fact) => (
                  <li key={fact} className="flex gap-3 rounded-xl border border-white/8 bg-black/20 p-3 text-sm text-slate-200">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sky-300" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 rounded-2xl border border-ember/20 bg-ember/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-ember/80">Latest response</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-100">
                {latestAssistantMessage || "Ask a question to see the assistant respond with portfolio details."}
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
