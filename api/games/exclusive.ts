import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'ID da plataforma não fornecido.' });
    }

    const query = `
        fields name, cover.url, rating, summary, platforms;
        where platforms = (${id}) & cover != null;
        sort aggregated_rating desc;
        limit 50;
    `;

    try {
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

        res.json(exclusivos);
    } catch (e: any) {
        console.error("Erro na requisição ao IGDB:", e);
        res.status(500).json({ error: `Erro ao buscar jogos exclusivos da plataforma: ${e.message || e}` });
    }
}
