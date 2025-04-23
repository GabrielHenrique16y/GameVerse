import axios from 'axios';
import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { name, quantity, genre } = req.body;

    try {
        const filters: string[] = [];

        if (name) {
            filters.push(`name ~ *"${name}"*`);
        }

        if (genre) {
            filters.push(`genres.name = "${genre}"`);
        }

        filters.push(`rating != null`);

        const whereClause = filters.length > 0 ? `where ${filters.join(' & ')};` : '';

        const query = `
            fields name, cover.url, rating, release_dates.date, genres.name, platforms.name, summary;
            sort rating desc;
            limit ${quantity ? quantity : 16};
            ${whereClause}
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
        console.error(error.response?.data || error);
        res.status(500).json({ error: 'Erro na requisição ao IGDB' });
    }
}
