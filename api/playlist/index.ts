import { VercelRequest, VercelResponse } from '@vercel/node';
import { loginRequired } from '../../_utils/loginRequired';
import axios from 'axios';
import supabase from '../../_utils/databaseConnection';

const handler = async (req: VercelRequest, res: VercelResponse) => {
    const {user_id} = req.body;
    
    if (!user_id) {
        res.status(400).json({ error: 'ID não fornecido.' });
        return;
    }

    if (req.method === 'POST') { 
        try {
            const response = await supabase.from('Games').select('id_game').eq('user_id', user_id);

            const gamesIds = response.data;

            if(gamesIds === null) {
                res.json({
                    errors: ['O usuário não tem jogos adicionados']
                })
                return;
            } else {
                const igdbResponse = await axios.post(
                    'https://api.igdb.com/v4/games',
                    `fields name, cover.url, summary, genres.name, platforms.name, rating; where id = (${gamesIds?.map(game => game.id_game).join(', ')});`,
                    {
                        headers: {
                            'Client-ID': process.env.IGDB_CLIENT_ID,
                            'Authorization': `Bearer ${process.env.IGDB_ACCESS_TOKEN}`,
                            'Content-Type': 'text/plain',
                        },
                    }
                );

                res.status(200).json(igdbResponse.data)
            }
        } catch {
            res.status(500).json({ error: 'Erro na requisição ao IGDB' });
        }
    } else {
        res.status(405).json({ error: 'Método não permitido' });
        return;
    }
};

export default loginRequired(handler);
