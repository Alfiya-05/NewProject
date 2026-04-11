import OpenAI from "openai";

const SUMMARY_PROMPT = (text) =>
  `Summarize this legal case in simple language and highlight key points: ${text}`;

const CLASSIFY_PROMPT = (text) =>
  `Classify this legal issue into categories (civil, criminal, family, domestic, labor, property, etc.) and explain why. Respond as JSON only with keys: caseType (string), reason (string). Text: ${text}`;

const TIMELINE_PROMPT = (text) =>
  `Estimate case duration based on type and details. Give a concise paragraph. Text: ${text}`;

let client = null;

function getClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  if (!client) client = new OpenAI({ apiKey: key });
  return client;
}

export async function chatCompletion(messages) {
  const c = getClient();
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  if (!c) {
    const last = messages.filter((m) => m.role === "user").pop();
    return mockChatReply(last?.content || "");
  }
  const res = await c.chat.completions.create({
    model,
    messages,
    temperature: 0.4,
  });
  return res.choices[0]?.message?.content?.trim() || "";
}

export async function summarizeCase(text) {
  const c = getClient();
  if (!c) return mockSummary(text);
  const out = await chatCompletion([
    { role: "system", content: "You are a helpful legal assistant. Use clear, simple language." },
    { role: "user", content: SUMMARY_PROMPT(text) },
  ]);
  return out;
}

export async function classifyAndExplain(text) {
  const c = getClient();
  if (!c) return mockClassify(text);
  const raw = await chatCompletion([
    { role: "system", content: "Return valid JSON only." },
    { role: "user", content: CLASSIFY_PROMPT(text) },
  ]);
  try {
    const parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());
    return { caseType: parsed.caseType || "General", reason: parsed.reason || "" };
  } catch {
    return { caseType: "General civil", reason: raw.slice(0, 400) };
  }
}

export async function estimateTimeline(text) {
  const c = getClient();
  if (!c) return mockTimeline(text);
  return chatCompletion([
    { role: "user", content: TIMELINE_PROMPT(text) },
  ]);
}

export async function judgeCaseInsights(text) {
  const c = getClient();
  if (!c) return mockJudgeInsights(text);
  const prompt = `For the following case text, respond as JSON with keys: summary (string, plain language), highlights (array of 3-5 short strings), risks (array of 2-4 short strings describing legal/procedural risks). Case: ${text}`;
  const raw = await chatCompletion([
    { role: "system", content: "Return valid JSON only." },
    { role: "user", content: prompt },
  ]);
  try {
    const parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());
    return {
      summary: parsed.summary || "",
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
    };
  } catch {
    return mockJudgeInsights(text);
  }
}

function mockChatReply(userText) {
  return `[Demo mode] Thanks for your question about "${(userText || "").slice(0, 80)}...". In production, connect OPENAI_API_KEY for full answers. Generally: consult a qualified advocate for binding advice, preserve documents, and note limitation periods.`;
}

function mockSummary(text) {
  const t = (text || "This matter").slice(0, 200);
  return `[Demo] Summary: The dispute concerns "${t}...". Parties should exchange pleadings, disclose documents, and prepare for hearing. Key points: facts in dispute; applicable law; relief sought; evidence gaps.`;
}

function mockClassify(text) {
  const lower = (text || "").toLowerCase();
  let caseType = "Civil — general contract/property";
  if (/crime|fir|theft|assault|ipc|criminal/i.test(lower)) caseType = "Criminal";
  else if (/divorce|custody|maintenance|family/i.test(lower)) caseType = "Family / domestic relations";
  else if (/tenant|rent|evict|lease/i.test(lower)) caseType = "Civil — tenancy";
  return {
    caseType,
    reason: "[Demo] Heuristic classification without LLM. Add OPENAI_API_KEY for richer output.",
  };
}

function mockTimeline(text) {
  return `[Demo] Estimated timeline: 6–18 months depending on court backlog, complexity, and appeals. Early mediation can shorten this. Details: "${(text || "").slice(0, 120)}..."`;
}

function mockJudgeInsights(text) {
  return {
    summary: mockSummary(text),
    highlights: [
      "Core issues framed; evidence stage pending",
      "Jurisdiction and limitation to verify",
      "Settlement window before contested hearing",
    ],
    risks: [
      "Incomplete disclosure may delay trial",
      "Witness availability for cross-examination",
      "Interim orders affecting final relief",
    ],
  };
}

export function buildLawyerTimeline(caseDoc) {
  const stages = [
    { label: "Filing & pleadings", percent: 20, done: true },
    { label: "Evidence & discovery", percent: 45, done: caseDoc.documents?.length > 0 },
    { label: "Hearings", percent: 70, done: !!caseDoc.nextHearingAt },
    { label: "Arguments / judgment", percent: 90, done: caseDoc.status === "closed" },
    { label: "Closure / appeal window", percent: 100, done: caseDoc.status === "closed" },
  ];
  return stages;
}
