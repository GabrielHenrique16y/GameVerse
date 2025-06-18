import { VercelRequest, VercelResponse } from "@vercel/node";
import * as yup from "yup";
import supabase from "../_utils/databaseConnection";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { daysToSeconds } from "../_utils/daysToSeconds";
import { serialize } from "cookie";
import juice from "juice";
import path from "path";
import fs from 'fs';
import nodemailer from 'nodemailer';

const secret = process.env.SUPABASE_JWT_SECRET;

const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://gameverse-omega.vercel.app'
    : 'http://localhost:3000';

const validationSchema = yup.object().shape({
    name: yup
        .string()
        .trim()
        .required("Name é obrigatório."),
    email: yup
        .string()
        .email("Formato de email inválido.")
        .required("Email é obrigatório."),
    password: yup
        .string()
        .min(6, "A senha deve ter no mínimo 6 caracteres.")
        .required("Senha é obrigatória."),
});

interface UpdatePayload {
    id: number;
    name?: string;
    email?: string;
    password?: string;
}


export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { action, payload } = req.body;

    if (!action) {
        return res.status(400).json({ error: 'Ação não especificada.' });
    }

    try{
        switch(action){
            case 'login': {
                const validationSchema = yup.object().shape({
                    email: yup
                        .string()
                        .email("Formato de email inválido.")
                        .required("Email é obrigatório."),
                    password: yup
                        .string()
                        .min(6, "A senha deve ter pelo menos 6 caracteres.")
                        .required("Senha é obrigatória."),
                });

                await validationSchema.validate(payload, { abortEarly: false });


                const { data: user } = await supabase
                    .from("users")
                    .select("*")
                    .eq("email", payload.email)
                    .single();

                if (!user) {
                    return res.status(404).json({ errors: ["Usuário não encontrado."] });
                }

                const hashedPassword = user.password;

                if (!hashedPassword) {
                    return res.status(500).json({ error: "Erro interno: hash de senha ausente." });
                }

                const isValid = await bcrypt.compare(payload.password, hashedPassword);

                if (!isValid) {
                    return res.status(401).json({ errors: ["Email ou senha inválida."] });
                }

                const secret = process.env.SUPABASE_JWT_SECRET;
                const expiresInEnv: string = process.env.TOKEN_EXPIRATION!;

                if (!secret) {
                    throw new Error("SUPABASE_JWT_SECRET não está definido");
                }
                
                if (!expiresInEnv) {
                    throw new Error("TOKEN_EXPIRATION não está definido");
                }

                const jwtSecret: Secret = secret;
                const jwtOptions: SignOptions = {
                    expiresIn: daysToSeconds(expiresInEnv),
                };

                const token = jwt.sign(
                    { id: user.id, email: user.email },
                    jwtSecret,
                    jwtOptions
                );

                const cookieOptions = {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax" as const,
                    maxAge: 30 * 24 * 60 * 60,
                    path: "/",
                };

                const tokenCookie = serialize("token", token, cookieOptions);
                const userCookie = serialize(
                    "user",
                    JSON.stringify({
                        id: user.id,
                        nome: user.name,
                        email: user.email,
                    }),
                    {
                        ...cookieOptions,
                        httpOnly: false,
                    }
                );

                res.setHeader("Set-Cookie", [tokenCookie, userCookie]);

                return res.status(200).json({
                    token,
                    user: {
                        id: user.id,
                        nome: user.name,
                        email: user.email,
                    },
                });
            }
            case 'subscribe': {
                await validationSchema.validate(payload, { abortEarly: false });

                const normalizedEmail = payload.email.toLowerCase().trim();

                const passwordHash = await bcrypt.hash(payload.password, 8);

                const { data, error } = await supabase
                    .from("users")
                    .insert({
                        name: payload.name,
                        email: normalizedEmail,
                        password: passwordHash,
                    })
                    .select("id, name, email");

                if (error) {
                    if (
                        error.message.includes(
                            'duplicate key value violates unique constraint "users_email_key"'
                        )
                    ) {
                        return res.status(400).json({
                            errors: ["Este email já está cadastrado."],
                        });
                    }

                    return res.status(400).json({
                        errors: [error.message || "Erro inesperado."],
                    });
                }

                return res.status(201).json(data);
            }
            case 'forgot-password': {
                const { email } = payload

                const validationSchema = yup.object().shape({
                    email: yup
                        .string()
                        .email('Email inválido.')
                        .required('Email é obrigatório.')
                });

                await validationSchema.validate(payload, { abortEarly: false });

                const { data: user, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', email)
                    .single();

                if (error || !user) {
                    return res.status(400).json({ errors: ['O usuário não existe.'] });
                }

                if (!secret) {
                    throw new Error('JWT_Secret é inválido');
                }

                const jwtSecret: Secret = secret;

                const resetToken = jwt.sign({ email }, jwtSecret, { expiresIn: '30m' });

                const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

                const htmlPath = path.join(__dirname, '../email_template/index.html');
                const emailHtmlTemplate = fs.readFileSync(htmlPath, 'utf-8');

                const cssPath = path.join(__dirname, '../email_template/style.css');
                const emailCss = fs.readFileSync(cssPath, 'utf-8');

                const emailHtmlWithCss = juice(`
                    <style>${emailCss}</style>
                    ${emailHtmlTemplate.replace('${user.name}', user.name).replace('${resetLink}', resetLink)}
                `);

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });

                await transporter.sendMail({
                    from: `"GameVerse" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Recuperação de Senha',
                    html: emailHtmlWithCss,
                });

                return res.status(200).json({ message: 'Email de recuperação enviado.' });
            }
            case 'reset-password': {
                const resetPasswordSchema = yup.object().shape({
                    token: yup.string().required('Token é obrigatório.'),
                    newPassword: yup.string().min(6, 'A senha deve ter pelo menos 6 caracteres.').required('Senha obrigatória.'),
                });

                await resetPasswordSchema.validate(payload, { abortEarly: false });

                if (!secret) {
                    throw new Error('JWT Secret não configurado.');
                }

                let decoded: JwtPayload;

                try {
                    decoded = jwt.verify(payload.token, secret) as JwtPayload;
                } catch {
                    return res.status(400).json({ error: 'Token inválido ou expirado.' });
                }

                const email = decoded.email;
                if (!email) {
                    return res.status(400).json({ error: 'Token inválido. (Sem email)' });
                }

                const hashedPassword = await bcrypt.hash(payload.newPassword, 8);

                const { error } = await supabase
                    .from('users')
                    .update({ password: hashedPassword })
                    .eq('email', email);

                if (error) {
                    return res.status(500).json({ error: 'Erro ao atualizar a senha.' });
                }

                return res.status(200).json({ message: 'Senha atualizada com sucesso!' });
            }

            case 'Update': {
                const body = req.body as { action: string; payload: UpdatePayload };
                const { payload } = body;
            
                const updates: Record<string, string> = {};
            
                if (typeof payload.name === 'string' && payload.name.trim() !== '') {
                    updates.name = payload.name.trim();
                }
            
                if (typeof payload.email === 'string' && payload.email.trim() !== '') {
                    updates.email = payload.email.toLowerCase().trim();
                }
            
                if (typeof payload.password === 'string' && payload.password.trim() !== '') {
                    updates.password = await bcrypt.hash(payload.password, 8);
                }
            
                if (Object.keys(updates).length === 0) {
                    return res.status(400).json({ error: 'Nenhum campo para atualizar.' });
                }
            
                const { data, error } = await supabase
                    .from('users')
                    .update(updates)
                    .eq('id', payload.id)
                    .select('id, name, email');
            
                if (error) {
                    return res.status(500).json({ error: error.message });
                }
            
                const updatedUser = data?.[0];
            
                const userCookie = serialize(
                    'user',
                    JSON.stringify({
                        id: updatedUser.id,
                        nome: updatedUser.name,
                        email: updatedUser.email,
                    }),
                    {
                        httpOnly: false,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        maxAge: 30 * 24 * 60 * 60,
                        path: '/',
                    }
                );
            
                res.setHeader('Set-Cookie', userCookie);
            
                return res.status(200).json(updatedUser);
            }
            
            
            case 'ById': {
                const response = await supabase.from('users').select('*').eq('id', payload.id).single()

                return res.json(response.data);
            }

            case 'delete': {
                await supabase.from('users').delete().eq('id', payload.id).single();

                return res.json({deleted: true})
            }

            default:
                return res.status(400).json({ error: 'Ação inválida.' });
        }
    }catch(error: any){
        if (error instanceof yup.ValidationError) {
            return res.status(400).json({ error: error.errors.join(", ") });
        }
        return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
}