import mongoose from "mongoose";

const caseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, default: "open" },
    description: { type: String, default: "" },
    assignedJudge: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    assignedLawyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
    summary: { type: String, default: "" },
    nextHearingAt: { type: Date, default: null },
    hearingDates: [{ type: Date }],
    witnessList: [{ type: String }],
    timelineStages: [
      {
        label: String,
        percent: Number,
        done: { type: Boolean, default: false },
      },
    ],
    partyRole: { type: String, enum: ["accused", "accuser", null], default: null },
    aiAnalysis: {
      caseType: String,
      summary: String,
      actions: [String],
      timeline: String,
    },
  },
  { timestamps: true }
);

export const LegalCase = mongoose.model("LegalCase", caseSchema);
