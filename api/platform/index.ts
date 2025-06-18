import { VercelRequest, VercelResponse } from "@vercel/node";
import axios, { AxiosError } from "axios";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { quantity } = req.body;

    try {
        const query = `
            fields name, abbreviation, generation, platform_logo, alternative_name;
            limit ${quantity ? quantity : 50};  // Usando o valor de quantity, caso fornecido
        `;

        const response = await axios.post(
            'https://api.igdb.com/v4/platforms',
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
        res.status(500).json({ error: 'Erro ao buscar plataformas populares.' });
    }
}
