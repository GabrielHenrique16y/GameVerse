import { VercelRequest, VercelResponse } from "@vercel/node";
import { serialize } from "cookie";
import supabase from "../../_utils/databaseConnection";
import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { daysToSeconds } from "../../_utils/daysToSeconds";
import UserProfile from "../../src/interface/UserProfile";
import * as yup from "yup";

// Define o esquema de validação com yup
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await validationSchema.validate(req.body, { abortEarly: false });

    const { email, password } = req.body as UserProfile;

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) {
      return res.status(404).json({ errors: ["Usuário não encontrado."] });
    }

    const hashedPassword = user.password;

    if (!hashedPassword) {
      return res.status(500).json({ error: "Erro interno: hash de senha ausente." });
    }

    const isValid = await bcrypt.compare(password, hashedPassword);

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
  } catch (err: any) {
    if (err instanceof yup.ValidationError) {
      return res.status(400).json({ errors: err.errors });
    }
    console.error(err);
    return res.status(500).json({ errors: [err.message || "Erro interno."] });
  }
}
