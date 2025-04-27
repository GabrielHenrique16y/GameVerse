import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import * as yup from "yup";

const validationSchema = yup.object().shape({
    id: yup
        .number()
        .required("ID da plataforma é obrigatório.")
        .positive("ID deve ser um número positivo.")
        .integer("ID deve ser um número inteiro."),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { id } = req.body;

    try {
        await validationSchema.validate({ id }, { abortEarly: false });

        const query = `
            fields name, cover.url, rating, summary, platforms;
            where platforms = (${id}) & cover != null;
            sort aggregated_rating desc;
            limit 50;
        `;

        const response = await axios.post(
            'https://api.igdb.com/v4/games',
            query,
            {
                headers: {
                    'Client-ID': process.env.IGDB_CLIENT_ID,
                    'Authorization': `Bearer ${process.env.IGDB_ACCESS_TOKEN}`,
                    'Content-Type': 'text/plain',
                },
            }
        );

        const exclusivos = response.data.filter((game: any) => game.platforms?.length === 1);

        return res.json(exclusivos);
    } catch (e: any) {
        if (e instanceof yup.ValidationError) {
            return res.status(400).json({
                error: e.errors.join(", "),
            });
        }

        console.error("Erro na requisição ao IGDB:", e);
        return res.status(500).json({
            error: `Erro ao buscar jogos exclusivos da plataforma: ${e.message || e}`,
        });
    }
}
