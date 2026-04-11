import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import judgeRoutes from "./routes/judge.js";
import lawyerRoutes from "./routes/lawyer.js";
import citizenRoutes from "./routes/citizen.js";
import aiRoutes from "./routes/ai.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

const uploadsPath = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsPath));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "NyayaAI" }));

app.use("/api/auth", authRoutes);
app.use("/api/judge", judgeRoutes);
app.use("/api/lawyer", lawyerRoutes);
app.use("/api/citizen", citizenRoutes);
app.use("/api/ai", aiRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

await connectDb().catch((e) => {
  console.error("DB connection failed:", e.message);
  console.error("Start MongoDB or set MONGODB_URI. Server will still listen for health checks.");
});

app.listen(PORT, () => {
  console.log(`NyayaAI API http://localhost:${PORT}`);
});
