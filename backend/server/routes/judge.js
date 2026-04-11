import { Router } from "express";
import { LegalCase } from "../models/Case.js";
import { authRequired, roleRequired, attachUser } from "../middleware/auth.js";
import { judgeCaseInsights, summarizeCase } from "../services/aiService.js";

const router = Router();

router.use(authRequired, roleRequired("judge"), attachUser);

router.get("/cases", async (req, res) => {
  try {
    const cases = await LegalCase.find({ assignedJudge: req.userId })
      .sort({ nextHearingAt: 1 })
      .lean();
    res.json({
      cases: cases.map((c) => ({
        id: c._id,
        title: c.title,
        type: c.type,
        status: c.status,
        nextHearingAt: c.nextHearingAt,
      })),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/case/:id", async (req, res) => {
  try {
    const c = await LegalCase.findOne({
      _id: req.params.id,
      assignedJudge: req.userId,
    }).lean();
    if (!c) return res.status(404).json({ error: "Case not found" });
    const text = [c.title, c.type, c.description, c.summary].filter(Boolean).join("\n");
    const insights = await judgeCaseInsights(text);
    const aiSummary = c.summary || (await summarizeCase(text));
    res.json({
      case: {
        id: c._id,
        title: c.title,
        type: c.type,
        status: c.status,
        description: c.description,
        nextHearingAt: c.nextHearingAt,
        hearingDates: c.hearingDates || [],
      },
      ai: {
        summary: aiSummary,
        highlights: insights.highlights,
        riskInsights: insights.risks,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/calendar", async (req, res) => {
  try {
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    const end = new Date();
    end.setMonth(end.getMonth() + 3);
    const cases = await LegalCase.find({
      assignedJudge: req.userId,
      nextHearingAt: { $gte: start, $lte: end },
    })
      .select("title nextHearingAt hearingDates")
      .lean();
    const booked = [];
    for (const c of cases) {
      if (c.nextHearingAt) booked.push({ date: c.nextHearingAt, title: c.title, caseId: c._id });
      for (const d of c.hearingDates || []) {
        if (d >= start && d <= end) booked.push({ date: d, title: c.title, caseId: c._id });
      }
    }
    const freeSlots = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const day = new Date(cursor);
      const has = booked.some((b) => sameDay(new Date(b.date), day));
      if (!has && day.getDay() !== 0 && day.getDay() !== 6) {
        freeSlots.push(day.toISOString().slice(0, 10));
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    res.json({ booked, freeDates: freeSlots.slice(0, 40) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default router;
