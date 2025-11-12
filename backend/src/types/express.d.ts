import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    member?: {
      id: string;
      fullName: string;
      email: string;
      company: string;
    };
    memberToken?: string;
  }
}


