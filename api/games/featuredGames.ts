import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

export default async function handler(req: VercelRequest, res: VercelResponse){
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const query = `
            fields name, cover.url, rating, release_dates.date, genres.name, platforms.name, summary;
            sort rating desc;
            limit 3;
            where rating != null;
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
    } catch {
        res.status(500).json({ error: 'Erro na requisição ao IGDB' });
    }
}