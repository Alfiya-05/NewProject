import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: "LegalCase", default: null },
    fileUrl: { type: String, required: true },
    originalName: { type: String, default: "" },
    kind: {
      type: String,
      enum: ["evidence", "document", "fir", "other"],
      default: "document",
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const DocumentModel = mongoose.model("Document", documentSchema);
