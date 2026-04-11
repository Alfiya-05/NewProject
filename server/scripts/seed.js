import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { LegalCase } from "../models/Case.js";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nyayaai";

async function run() {
  await mongoose.connect(uri);
  await User.deleteMany({ email: /@nyayaai.demo$/ });
  await LegalCase.deleteMany({ title: /^Demo / });

  const passwordHash = await bcrypt.hash("demo1234", 10);

  const judge = await User.create({
    name: "Justice Demo",
    email: "judge@nyayaai.demo",
    passwordHash,
    role: "judge",
  });
  const lawyer = await User.create({
    name: "Adv. Priya Sharma",
    email: "lawyer@nyayaai.demo",
    passwordHash,
    role: "lawyer",
  });
  const citizen = await User.create({
    name: "Ravi Kumar",
    email: "citizen@nyayaai.demo",
    passwordHash,
    role: "citizen",
  });

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 28);

  await LegalCase.create({
    title: "Demo Property boundary dispute",
    type: "Civil — property",
    status: "active",
    description:
      "Plaintiff alleges encroachment of 3 feet on eastern boundary. Survey report pending. Interim injunction sought.",
    assignedJudge: judge._id,
    assignedLawyer: lawyer._id,
    citizenId: citizen._id,
    summary: "Boundary dispute; survey and oral evidence central.",
    nextHearingAt: nextWeek,
    hearingDates: [nextWeek, nextMonth],
    timelineStages: [
      { label: "Filing & pleadings", percent: 20, done: true },
      { label: "Evidence & discovery", percent: 45, done: true },
      { label: "Hearings", percent: 70, done: false },
      { label: "Arguments / judgment", percent: 90, done: false },
      { label: "Closure / appeal window", percent: 100, done: false },
    ],
    witnessList: ["Surveyor", "Neighbor eyewitness"],
  });

  await LegalCase.create({
    title: "Demo Criminal complaint — theft",
    type: "Criminal",
    status: "active",
    description: "FIR under IPC sections for theft from locked house. Charge sheet filed; bail granted.",
    assignedJudge: judge._id,
    assignedLawyer: lawyer._id,
    nextHearingAt: nextMonth,
    hearingDates: [nextMonth],
    timelineStages: [
      { label: "Filing & pleadings", percent: 20, done: true },
      { label: "Evidence & discovery", percent: 45, done: false },
      { label: "Hearings", percent: 70, done: false },
      { label: "Arguments / judgment", percent: 90, done: false },
      { label: "Closure / appeal window", percent: 100, done: false },
    ],
  });

  console.log("Seed complete.");
  console.log("Judge:   judge@nyayaai.demo   / demo1234");
  console.log("Lawyer:  lawyer@nyayaai.demo  / demo1234");
  console.log("Citizen: citizen@nyayaai.demo / demo1234");
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
