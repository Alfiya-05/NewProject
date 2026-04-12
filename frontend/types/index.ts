export interface User {
  _id: string;
  firebaseUid: string;
  email: string;
  role: 'citizen' | 'lawyer' | 'judge' | 'admin';
  systemUid: string;
  profile: {
    name: string;
    phone?: string;
    location?: string;
    photoURL?: string;
    courtId?: string;
  };
  isVerified: boolean;
  createdAt: string;
}

export interface IPCSection {
  section: string;
  act: string;
  title: string;
  description: string;
  isCognizable: boolean;
  isBailable: boolean;
  minPunishmentYears: number;
  maxPunishmentYears: number;
  fineApplicable: boolean;
}

export interface SimilarCase {
  caseId: string;
  caseName: string;
  year: number;
  court: string;
  outcome: string;
  similarityScore: number;
}

export interface Case {
  _id: string;
  caseNumber: string;
  citizenId: User | string;
  lawyerId?: User | string;
  judgeId?: User | string;
  parsedData: {
    parties: string[];
    date: string;
    location: string;
    offenceDescription: string;
    firNumber?: string;
    policeStation?: string;
    ipcSectionsRaw?: string[];
  };
  ipcSections: IPCSection[];
  aiSummary?: string;
  punishmentPrediction?: {
    minYears: number;
    maxYears: number;
    isBailable: boolean;
    fineRange?: string;
    disclaimer?: string;
  };
  timelinePrediction?: {
    minMonths: number;
    maxMonths: number;
    medianMonths: number;
    confidence?: string;
    factors?: string[];
    disclaimer?: string;
  };
  similarCases: SimilarCase[];
  status: 'draft' | 'unassigned' | 'pending' | 'active' | 'resolved' | 'closed';
  lastActivityAt: string;
  hearings: Hearing[];
  evidenceIds: Evidence[];
  createdAt: string;
  updatedAt: string;
}

export interface Evidence {
  _id: string;
  caseId: string;
  uploadedBy: string;
  uploaderRole: string;
  uploaderName: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  description?: string;
  uploadTimestamp: string;
  isImmutable: boolean;
  deletedAt?: string;
  deletionLog?: string;
}

export interface Hearing {
  _id: string;
  caseId: string;
  judgeId?: string;
  lawyerId?: string;
  citizenId?: string;
  hearingDate: string;
  courtRoom?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notificationSent: boolean;
}

export interface LawyerProfile {
  _id: string;
  userId: User;
  barNumber: string;
  post?: string; // Official court post/designation
  specialisations: string[];
  courtIds: string[];
  experienceYears: number;
  feePerHearing: number;
  retainerFee: number;
  rating: number;
  totalCases: number;
  isAvailable: boolean;
  isBarVerified: boolean;
  bio?: string;
}

export interface AuditLog {
  _id: string;
  action: string;
  performedBy: User;
  performedByRole: string;
  targetEntity: string;
  targetId: string;
  metadata: Record<string, unknown>;
  ipAddress?: string;
  timestamp: string;
  hash: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AuthState {
  user: (User & { token?: string }) | null;
  loading: boolean;
  setUser: (user: (User & { token?: string }) | null) => void;
  setLoading: (loading: boolean) => void;
}
