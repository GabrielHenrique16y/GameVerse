import { VercelRequest, VercelResponse } from '@vercel/node';
import { serialize } from 'cookie';
import { loginRequired } from '../_utils/loginRequired';

const handler = async (_req: VercelRequest, res: VercelResponse): Promise<void> => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: -1, 
        path: '/',
    };

    const tokenCookie = serialize('token', '', cookieOptions);
    const userCookie = serialize('user', '', {
        ...cookieOptions,
        httpOnly: false,
    });

    res.setHeader('Set-Cookie', [tokenCookie, userCookie]);

    res.status(200).json({ message: 'Logout realizado com sucesso' });
    return;
};

export default loginRequired(handler);