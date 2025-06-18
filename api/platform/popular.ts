import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const popularPlatformIds = [6, 8, 9, 12, 48, 167, 49, 169, 130];
        const ids = popularPlatformIds.join(',');

        const query = `
            fields name, abbreviation, generation, platform_logo.url, alternative_name;
            where id = (${ids});
            limit ${popularPlatformIds.length};
        `;

        const response = await axios.post(
            'https://api.igdb.com/v4/platforms',
            query.trim(), 
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
        res.status(500).json({ error: 'Erro ao buscar plataformas populares.' });
    }
}
