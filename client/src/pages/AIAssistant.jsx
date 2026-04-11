import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { apiJson } from "../api";
import { Card } from "../components/Card";

export function AIAssistant() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello — I am NyayaAI. Ask general legal information questions. This is not a substitute for a lawyer." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef(null);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setBusy(true);
    try {
      const history = next.slice(-8).map((m) => ({ role: m.role, content: m.content }));
      const { reply } = await apiJson("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: text, history }),
      });
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: `Error: ${e.message}` }]);
    } finally {
      setBusy(false);
      setTimeout(() => bottom.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <h1 className="text-2xl font-bold text-slate-900">{t("aiAssistant")}</h1>
      <Card className="flex flex-1 flex-col overflow-hidden !p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                m.role === "user" ? "ml-auto bg-nyaya-600 text-white" : "bg-slate-100 text-slate-800"
              }`}
            >
              {m.content}
            </div>
          ))}
          <div ref={bottom} />
        </div>
        <div className="border-t border-slate-100 p-4">
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-nyaya-500 focus:ring-2"
              placeholder={t("typing")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
            />
            <button
              type="button"
              title="Voice (placeholder)"
              className="rounded-xl border border-slate-200 px-3 text-slate-400 hover:bg-slate-50"
              disabled
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={send}
              disabled={busy}
              className="rounded-xl bg-nyaya-600 px-5 py-3 text-sm font-semibold text-white hover:bg-nyaya-700 disabled:opacity-50"
            >
              {t("send")}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
