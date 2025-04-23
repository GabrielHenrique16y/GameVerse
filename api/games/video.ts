import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

export default async function handler(req: VercelRequest, res: VercelResponse){
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID do jogo não fornecido.' });
    }

    const query = `fields name, video_id, checksum, game; where id = ${id};`;

    try {
        const response = await axios.post(
            'https://api.igdb.com/v4/game_videos',
            query,
            {
                headers: {
                    'Client-ID': process.env.IGDB_CLIENT_ID,
                    'Authorization': `Bearer ${process.env.IGDB_ACCESS_TOKEN}`,
                    'Content-Type': 'text/plain',
                },
            }
        );
        
        if (response.data.length === 0) {
            return res.status(404).json({ error: 'Nenhum vídeo encontrado para este jogo.' });
        }

        res.json(response.data);
    } catch (e: any) {
        console.error("Erro na requisição ao IGDB:", e);
        res.status(500).json({ error: `Erro ao buscar vídeos do jogo: ${e.message || e}` });
    }
}