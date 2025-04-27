// types/AuthedRequest.ts
import { VercelRequest } from '@vercel/node';

export interface AuthedRequest extends VercelRequest {
    userId: number;
    userEmail: string;
    userName: string
}
