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

