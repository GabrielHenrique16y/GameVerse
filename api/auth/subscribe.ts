import { VercelRequest, VercelResponse } from "@vercel/node";
import supabase from "../../_utils/databaseConnection";
import bcrypt from "bcryptjs";
import * as yup from "yup"; 
import UserProfile from "../../src/interface/UserProfile";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { name, email, password } = req.body as UserProfile;

    try {
        await validationSchema.validate(req.body, { abortEarly: false });

        const normalizedEmail = email.toLowerCase().trim();

        const passwordHash = await bcrypt.hash(password, 8);

        const { data, error } = await supabase
            .from("users")
            .insert({
                name,
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
    } catch (e: any) {
        if (e instanceof yup.ValidationError) {
            return res.status(400).json({
                errors: e.errors,
            });
        }

        return res.status(500).json({
            errors: [e.message || "Erro no servidor."],
        });
    }
}
