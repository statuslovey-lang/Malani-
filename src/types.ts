import { Timestamp } from 'firebase/firestore';

export type ClaimType = 'Vivah' | 'Momera' | 'Death' | 'DaughterMarriage';
export type ClaimStatus = 'Pending' | 'Approved' | 'Disbursed' | 'Rejected';

export interface SansthaClaim {
  id?: string;
  userId: string;
  applicantName: string;
  membershipId: string;
  claimType: ClaimType;
  eventDate: string;
  details: string;
  status: ClaimStatus;
  submittedAt: any; // Timestamp or Date
  refNumber?: string;
}

export interface LedgerItem {
  id: string;
  eventType: 'Vivah' | 'Momera' | 'Death' | 'Ad-hoc';
  description: string;
  duesAmount: number;
  createdAt: any;
  isPaid: boolean;
  dueDate: string;
  paymentDate?: string;
}

export interface SansthaProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  membershipId?: string;
  fatherName?: string;
  phone?: string;
  email?: string;
  isStudent?: boolean;
  unpaidInstallments?: number;
  eligibilityChecked?: boolean;
  joinedAt?: any;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
