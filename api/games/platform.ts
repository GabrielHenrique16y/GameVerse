import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'ID da plataforma não fornecido.' });
    }

    const { name, genre, quantity = 16 } = req.body;

    try {
        const filters: string[] = [];

        if (name) {
            filters.push(`name ~ *"${name}"*`);
        }
        
        if (genre) {
            filters.push(`genres.name = "${genre}"`);
        }

        filters.push(`platforms = (${id}) & category = 0`);

        const whereClause = filters.length > 0 ? `where ${filters.join(' & ')};` : '';

        const query = `
            fields name, cover.url, rating, platforms.id, platforms.name;
            ${whereClause}
            sort rating desc;
            limit ${quantity};
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

        res.json(response.data);
    } catch (error: any) {
        console.error('Erro ao buscar jogos:', error);
        res.status(500).json({ error: 'Erro ao buscar jogos da plataforma.' });
    }
}
