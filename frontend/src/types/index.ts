export interface User {
  id: string;
  email: string;
  username: string | null;
  role?: "USER" | "ADMIN";
}

export interface WeddingProfile {
  id: string;
  userId: string;
  groomName: string | null;
  brideName: string | null;
  weddingDate: string | null;
  venue: string | null;
  totalBudget: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetItem {
  id: string;
  profileId: string;
  category: string;
  itemName: string;
  estimatedCost: number;
  actualCost: number;
  amountPaid: number;
  isPaid: boolean;
  paymentStatus: "unpaid" | "dp" | "paid";
  vendorName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalEstimated: number;
  totalActual: number;
  totalPaid: number;
  totalUnpaid: number;
  totalRemainingToPay?: number;
  remainingBudget: number;
  itemCount: number;
}

export interface CategoryBreakdown {
  category: string;
  estimated: number;
  actual: number;
  count: number;
}

export interface SeserahanItem {
  id: string;
  profileId: string;
  itemName: string;
  category: string;
  estimatedPrice: number;
  actualPrice: number;
  quantity: number;
  isPrepared: boolean;
  giver: "groom" | "bride";
  brand: string | null;
  link: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SeserahanTemplate {
  itemName: string;
  category: string;
  estimatedPrice: number;
  quantity: number;
  giver: "groom" | "bride";
  notes?: string;
}

export interface OperasionalTask {
  id: string;
  profileId: string;
  taskName: string;
  phase: "h90" | "h30" | "h7" | "hariH" | "pascaNikah";
  scheduledTime: string | null;
  scheduledDate: string | null;
  assignedTo: string | null;
  isDone: boolean;
  priority: "low" | "medium" | "high";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KuaDocument {
  id: string;
  profileId: string;
  documentName: string;
  documentCode: string | null;
  documentType: string;
  fromParty: "calon_pria" | "calon_wanita" | "wali" | "kua";
  deadline: string | null;
  isCompleted: boolean;
  status: "pending" | "in_progress" | "completed";
  reminderEnabled: boolean;
  notes: string | null;
  effectiveDeadline?: string | null;
  daysRemaining?: number | null;
  isOverdue?: boolean;
  isNearDeadline?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  profile: {
    id: string;
    groomName: string | null;
    brideName: string | null;
    weddingDate: string | null;
    venue: string | null;
    daysRemaining: number | null;
    isPastWedding: boolean;
  };
  readiness: {
    overallPercentage: number;
    statusLabel: string;
    scores: {
      budget: number;
      seserahan: number;
      operasional: number;
      kua: number;
    };
    nextActions: Array<{
      id: string;
      module: string;
      text: string;
      link: string;
      badgeText: string;
      isUrgent: boolean;
    }>;
  };
  budget: {
    totalBudget: number;
    totalEstimated: number;
    totalActual: number;
    totalPaid: number;
    totalRemainingToPay?: number;
    remainingBudget: number;
    spentPercentage: number;
    paymentPercentage?: number;
    categoryChart: Array<{ name: string; value: number }>;
    itemCount: number;
  };
  seserahan: {
    total: number;
    prepared: number;
    progressPercentage: number;
  };
  operasional: {
    total: number;
    completed: number;
    progressPercentage: number;
    upcomingTasks: OperasionalTask[];
  };
  kua: {
    total: number;
    completed: number;
    urgentCount: number;
    progressPercentage: number;
    urgentDocs: KuaDocument[];
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface LoveStoryItem {
  year: string;
  title: string;
  story: string;
}

export interface GalleryPhotoItem {
  url: string;
  caption?: string;
}

export interface BankAccountItem {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrCodeUrl?: string;
}

export interface InvitationRsvp {
  id: string;
  invitationId: string;
  guestName: string;
  attendanceStatus: "hadir" | "tidak_hadir" | "ragu";
  guestCount: number;
  message: string | null;
  createdAt: string;
}

export interface InvitationGuest {
  id: string;
  invitationId: string;
  name: string;
  slug: string;
  phone: string | null;
  category: "keluarga" | "sahabat" | "vip" | "rekan_kerja";
  isSent: boolean;
  createdAt: string;
}

export interface DigitalInvitation {
  id: string;
  profileId: string;
  slug: string;
  theme: "noir-calla" | "chalk-and-vow" | "nocturne-botanica";
  title: string;
  openingQuote: string | null;
  quoteSource: string | null;
  bgMusicUrl: string | null;
  isMusicAutoPlay: boolean;
  isPublished: boolean;

  coverPhotoUrl: string | null;
  heroPhotoUrl: string | null;

  groomFullName: string | null;
  groomNickName: string | null;
  groomFather: string | null;
  groomMother: string | null;
  groomInstagram: string | null;
  groomPhotoUrl: string | null;

  brideFullName: string | null;
  brideNickName: string | null;
  brideFather: string | null;
  brideMother: string | null;
  brideInstagram: string | null;
  bridePhotoUrl: string | null;

  akadDate: string | null;
  akadStartTime: string | null;
  akadEndTime: string | null;
  akadVenueName: string | null;
  akadAddress: string | null;
  akadMapUrl: string | null;

  resepsiDate: string | null;
  resepsiStartTime: string | null;
  resepsiEndTime: string | null;
  resepsiVenueName: string | null;
  resepsiAddress: string | null;
  resepsiMapUrl: string | null;

  loveStory: LoveStoryItem[] | string | null;
  galleryPhotos: GalleryPhotoItem[] | string | null;
  bankAccounts: BankAccountItem[] | string | null;
  giftAddress: string | null;

  createdAt: string;
  updatedAt: string;

  rsvps?: InvitationRsvp[];
  guests?: InvitationGuest[];
}

