import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import * as yup from "yup";

const validationSchema = yup.object().shape({
    id: yup
        .number()
        .required("ID é obrigatório.")
        .positive("ID deve ser um número positivo.")
        .integer("ID deve ser um número inteiro."),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Cache-Control', 'no-store');
    const { id } = req.body;

    try {
        await validationSchema.validate({ id }, { abortEarly: false });

        if (req.method === 'POST') {
            try {
                const query = `
                    fields name, cover.url, summary, genres.name, platforms.name, rating, release_dates.date, involved_companies.company.name, involved_companies.developer, similar_games.name, similar_games.rating, similar_games.cover.url, franchises, videos;
                    where id = ${id};
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

                const game = response.data[0];

                if (!game) {
                    return res.status(404).json({ error: 'Jogo não encontrado.' });
                }

                if (game.franchises && game.franchises.length > 0) {
                    const gamesFromFranchiseQuery = `
                        fields id, name, cover.url, rating;
                        where franchises = ${game.franchises[0]} & id != ${id};
                        sort rating desc;
                        limit 8;
                    `;
                
                    const gamesFromFranchiseResponse = await axios.post(
                        'https://api.igdb.com/v4/games',
                        gamesFromFranchiseQuery,
                        {
                            headers: {
                                'Client-ID': process.env.IGDB_CLIENT_ID,
                                'Authorization': `Bearer ${process.env.IGDB_ACCESS_TOKEN}`,
                                'Content-Type': 'text/plain',
                            },
                        }
                    );
                
                    game.related_games = gamesFromFranchiseResponse.data;
                } else {
                    game.related_games = game.similar_games?.slice(0, 8) || [];
                }

                res.json(game); 
            } catch (error: any) {
                console.error(error.response?.data || error);
                res.status(500).json({ error: 'Erro na requisição ao IGDB' });
            }
        } else {
            return res.status(405).json({ error: 'Método não permitido' });
        }
    } catch (e: any) {
        if (e instanceof yup.ValidationError) {
            return res.status(400).json({
                error: e.errors.join(", "),
            });
        }
        // Erro geral
        console.error(e);
        return res.status(500).json({ error: 'Erro no servidor.' });
    }
}
