export interface Application {
  id: string;
  fullName: string;
  email: string;
  company: string;
  whyParticipate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface Member {
  id: string;
  fullName: string;
  email: string;
  company: string;
  phone?: string;
  position?: string;
  companyDescription?: string;
  linkedinUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvitationValidation {
  valid: boolean;
  application: {
    id: string;
    fullName: string;
    email: string;
    company: string;
  };
}

export type IndicationStatus = 'NEW' | 'IN_CONTACT' | 'CLOSED' | 'DECLINED';

export interface MemberSummary {
  id: string;
  fullName: string;
  email: string;
  company: string;
}

export interface Indication {
  id: string;
  contactInfo: string;
  description: string;
  status: IndicationStatus;
  createdAt: string;
  updatedAt: string;
  fromMember: MemberSummary;
  toMember: MemberSummary;
}

export interface IndicationList {
  created: Indication[];
  received: Indication[];
}

