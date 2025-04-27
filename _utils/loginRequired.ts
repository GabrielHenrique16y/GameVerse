import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import supabase from '../_utils/databaseConnection';
import { AuthedRequest } from '../src/interface/AuthedRequest';

type TokenPayload = {
    id: number;
    email: string;
};

export function loginRequired(handler: (req: AuthedRequest, res: VercelResponse) => Promise<void>) {
    return async (req: VercelRequest, res: VercelResponse) => {
        const token = req.cookies?.token;

        if (!token) {
        return res.status(401).json({ errors: ['Token não enviado no cookie.'] });
        }

        try {
            const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!) as TokenPayload;

            const { data, error } = await supabase
                .from('users')
                .select('id, email')
                .eq('id', decoded.id)
                .eq('email', decoded.email)
                .single();

            if (error || !data) {
                return res.status(401).json({ errors: ['Usuário inválido.'] });
            }

            const authedReq = req as AuthedRequest;
            authedReq.userId = decoded.id;
            authedReq.userEmail = decoded.email;

            return handler(authedReq, res);
        } catch (e: any) {
            return res.status(401).json({
                errors: ['Token expirado ou inválido.'],
            });
        }
    };
}
