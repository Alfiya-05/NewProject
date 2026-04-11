import { Router } from "express";
import { authRequired, attachUser } from "../middleware/auth.js";
import { chatCompletion } from "../services/aiService.js";

const router = Router();

router.use(authRequired, attachUser);

router.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== "string")
      return res.status(400).json({ error: "message required" });
    const msgs = [
      {
        role: "system",
        content:
          "You are NyayaAI, a careful legal information assistant. Give general guidance, not binding legal advice. Encourage consulting a qualified lawyer for India-specific procedures.",
      },
    ];
    if (Array.isArray(history)) {
      for (const h of history.slice(-10)) {
        if (h.role === "user" || h.role === "assistant") {
          msgs.push({ role: h.role, content: String(h.content || "").slice(0, 4000) });
        }
      }
    }
    msgs.push({ role: "user", content: message.slice(0, 8000) });
    const reply = await chatCompletion(msgs);
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
