export interface User {
  name: string;
  cpf: string;
  phone: string;
  email: string;
  password?: string;
  status: 'PENDING_VERIFICATION' | 'PENDING_DEPOSIT' | 'PENDING_APPROVAL' | 'ACTIVE';
  investmentAmount: number;
  referralCode: string;
  approvedReferrals: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface GeminiMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}