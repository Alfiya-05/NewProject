import path from "path";
import fs from "fs";
import { Router } from "express";
import multer from "multer";
import { LegalCase } from "../models/Case.js";
import { DocumentModel } from "../models/Document.js";
import { authRequired, roleRequired, attachUser } from "../middleware/auth.js";
import { classifyAndExplain, estimateTimeline, summarizeCase } from "../services/aiService.js";

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

const analyzeRouter = Router();
analyzeRouter.use(authRequired, roleRequired("citizen"), attachUser);

analyzeRouter.post("/analyze", upload.single("fir"), async (req, res) => {
  try {
    const { text, partyRole } = req.body;
    const bodyText = text || "";
    let fileNote = "";
    if (req.file) {
      fileNote = ` User uploaded FIR/document: ${req.file.originalname}.`;
    }
    const combined = bodyText + fileNote;
    if (!combined.trim()) return res.status(400).json({ error: "Provide text or FIR file" });

    const { caseType, reason } = await classifyAndExplain(combined);
    const summary = await summarizeCase(combined);
    const timeline = await estimateTimeline(combined);
    const actions = [
      "Speak to a qualified lawyer for advice tailored to your facts.",
      "Preserve originals and copies of notices, FIR, and correspondence.",
      "Note limitation periods and court fees for filing.",
    ];
    if (reason) actions.push(`Classification note: ${reason}`);

    const newCase = await LegalCase.create({
      title: `Citizen matter — ${caseType}`,
      type: caseType,
      status: "intake",
      description: bodyText,
      citizenId: req.userId,
      partyRole: partyRole === "accused" || partyRole === "accuser" ? partyRole : null,
      aiAnalysis: { caseType, summary, actions, timeline },
      timelineStages: [
        { label: "Intake & triage", percent: 15, done: true },
        { label: "Legal consult", percent: 35, done: false },
        { label: "Filing / police / mediation", percent: 55, done: false },
        { label: "Court process", percent: 80, done: false },
        { label: "Resolution", percent: 100, done: false },
      ],
    });

    if (req.file) {
      const doc = await DocumentModel.create({
        caseId: newCase._id,
        fileUrl: `/uploads/${req.file.filename}`,
        originalName: req.file.originalname,
        kind: "fir",
        uploadedBy: req.userId,
      });
      newCase.documents.push(doc._id);
      await newCase.save();
    }

    res.status(201).json({
      caseId: newCase._id,
      caseType,
      summary,
      actions,
      timeline,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

analyzeRouter.get("/cases", async (req, res) => {
  try {
    const cases = await LegalCase.find({ citizenId: req.userId }).sort({ createdAt: -1 }).lean();
    res.json({
      cases: cases.map((c) => ({
        id: c._id,
        title: c.title,
        type: c.type,
        status: c.status,
        createdAt: c.createdAt,
        aiAnalysis: c.aiAnalysis,
      })),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.use(analyzeRouter);

export default router;
