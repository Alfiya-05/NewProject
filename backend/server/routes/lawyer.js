import path from "path";
import fs from "fs";
import { Router } from "express";
import multer from "multer";
import { LegalCase } from "../models/Case.js";
import { DocumentModel } from "../models/Document.js";
import { authRequired, roleRequired, attachUser } from "../middleware/auth.js";
import { buildLawyerTimeline } from "../services/aiService.js";

const router = Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}_${safe}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });

router.use(authRequired, roleRequired("lawyer"), attachUser);

router.get("/calendar", async (req, res) => {
  try {
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    const end = new Date();
    end.setMonth(end.getMonth() + 3);
    const cases = await LegalCase.find({
      assignedLawyer: req.userId,
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

router.get("/case/:id", async (req, res) => {
  try {
    const c = await LegalCase.findOne({ _id: req.params.id, assignedLawyer: req.userId })
      .populate("documents")
      .lean();
    if (!c) return res.status(404).json({ error: "Case not found" });
    res.json({
      case: {
        id: c._id,
        title: c.title,
        type: c.type,
        status: c.status,
        nextHearingAt: c.nextHearingAt,
        witnessList: c.witnessList || [],
        timeline: c.timelineStages?.length ? c.timelineStages : buildLawyerTimeline(c),
        documents: (c.documents || []).map((d) => ({
          id: d._id,
          fileUrl: d.fileUrl,
          originalName: d.originalName,
          kind: d.kind,
          createdAt: d.createdAt,
        })),
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/cases", async (req, res) => {
  try {
    const cases = await LegalCase.find({ assignedLawyer: req.userId }).sort({ updatedAt: -1 }).lean();
    res.json({
      cases: await Promise.all(
        cases.map(async (c) => ({
          id: c._id,
          title: c.title,
          type: c.type,
          status: c.status,
          nextHearingAt: c.nextHearingAt,
          timeline: c.timelineStages?.length ? c.timelineStages : buildLawyerTimeline(c),
        }))
      ),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/upload", upload.array("files", 12), async (req, res) => {
  try {
    const { caseId, kind, witnesses } = req.body;
    if (!caseId) return res.status(400).json({ error: "caseId required" });
    const legalCase = await LegalCase.findOne({ _id: caseId, assignedLawyer: req.userId });
    if (!legalCase) return res.status(404).json({ error: "Case not found" });

    const docKind = ["evidence", "document", "fir", "other"].includes(kind) ? kind : "document";
    const files = req.files || [];
    const created = [];
    for (const f of files) {
      const url = `/uploads/${f.filename}`;
      const doc = await DocumentModel.create({
        caseId: legalCase._id,
        fileUrl: url,
        originalName: f["originalname"],
        kind: docKind,
        uploadedBy: req.userId,
      });
      created.push(doc);
      legalCase.documents.push(doc._id);
    }
    if (witnesses) {
      try {
        const list = JSON.parse(witnesses);
        if (Array.isArray(list)) legalCase.witnessList = list.filter(Boolean);
      } catch {
        legalCase.witnessList = String(witnesses)
          .split(/[\n,]/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
    legalCase.timelineStages = buildLawyerTimeline(legalCase);
    await legalCase.save();

    res.status(201).json({
      documents: created.map((d) => ({
        id: d._id,
        fileUrl: d.fileUrl,
        originalName: d.originalName,
        kind: d.kind,
      })),
      timeline: legalCase.timelineStages,
      witnessList: legalCase.witnessList,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
