import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import * as yup from "yup";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { action, payload } = req.body;

    if (!action) {
        return res.status(400).json({ error: 'Ação não especificada.' });
    }

    try {
        switch (action) {
            case 'featured': {
                const query = `
                    fields name, cover.url, rating, release_dates.date, genres.name, platforms.name, summary;
                    sort rating desc;
                    limit 3;
                    where rating != null;
                `;
                const response = await axios.post('https://api.igdb.com/v4/games', query, {
                    headers: getHeaders(),
                });
                return res.json(response.data);
            }

            case 'exclusive': {
                const schema = yup.object().shape({
                    id: yup.number().positive().integer().required(),
                });
                await schema.validate(payload, { abortEarly: false });

                const query = `
                    fields name, cover.url, rating, summary, platforms;
                    where platforms = (${payload.id}) & cover != null;
                    sort aggregated_rating desc;
                    limit 50;
                `;

                const response = await axios.post('https://api.igdb.com/v4/games', query, {
                    headers: getHeaders(),
                });

                const exclusivos = response.data.filter((game: any) => game.platforms?.length === 1);
                return res.json(exclusivos);
            }

            case 'byId': {
                const schema = yup.object().shape({
                    id: yup.number().positive().integer().required(),
                });
                await schema.validate(payload, { abortEarly: false });

                const gameQuery = `
                    fields name, cover.url, summary, genres.name, platforms.name, rating, release_dates.date, involved_companies.company.name, involved_companies.developer, similar_games.name, similar_games.rating, similar_games.cover.url, franchises, videos;
                    where id = ${payload.id};
                `;
                const response = await axios.post('https://api.igdb.com/v4/games', gameQuery, {
                    headers: getHeaders(),
                });

                const game = response.data[0];

                if (!game) {
                    return res.status(404).json({ error: 'Jogo não encontrado.' });
                }

                if (game.franchises && game.franchises.length > 0) {
                    const franchiseQuery = `
                        fields id, name, cover.url, rating;
                        where franchises = ${game.franchises[0]} & id != ${payload.id};
                        sort rating desc;
                        limit 8;
                    `;
                    const franchiseResponse = await axios.post('https://api.igdb.com/v4/games', franchiseQuery, {
                        headers: getHeaders(),
                    });
                    game.related_games = franchiseResponse.data;
                } else {
                    game.related_games = game.similar_games?.slice(0, 8) || [];
                }

                return res.json(game);
            }

            case 'byName': {
                const schema = yup.object().shape({
                    name: yup.string().optional(),
                    quantity: yup.number().positive().integer().optional(),
                    genre: yup.string().optional(),
                });
                await schema.validate(payload, { abortEarly: false });

                const filters: string[] = [];

                if (payload.name) filters.push(`name ~ *"${payload.name}"*`);
                if (payload.genre) filters.push(`genres.name = "${payload.genre}"`);
                filters.push(`rating != null`);

                const whereClause = filters.length > 0 ? `where ${filters.join(' & ')};` : '';
                const limit = payload.quantity || 16;

                const query = `
                    fields name, cover.url, rating, release_dates.date, genres.name, platforms.name, summary;
                    sort rating desc;
                    limit ${limit};
                    ${whereClause}
                `;

                const response = await axios.post('https://api.igdb.com/v4/games', query, {
                    headers: getHeaders(),
                });

                return res.json(response.data);
            }

            case 'byPlatform': {
                const schema = yup.object().shape({
                    id: yup.number().positive().integer().required(),
                    name: yup.string().optional(),
                    genre: yup.string().optional(),
                    quantity: yup.number().positive().integer().optional(),
                });
                await schema.validate(payload, { abortEarly: false });

                const filters: string[] = [];

                if (payload.name) filters.push(`name ~ *"${payload.name}"*`);
                if (payload.genre) filters.push(`genres.name = "${payload.genre}"`);
                filters.push(`platforms = (${payload.id}) & category = 0`);

                const whereClause = filters.length > 0 ? `where ${filters.join(' & ')};` : '';
                const limit = payload.quantity || 16;

                const query = `
                    fields name, cover.url, rating, platforms.id, platforms.name, summary;
                    ${whereClause}
                    sort rating desc;
                    limit ${limit};
                `;

                const response = await axios.post('https://api.igdb.com/v4/games', query, {
                    headers: getHeaders(),
                });

                return res.json(response.data);
            }

            case 'video': {
                const schema = yup.object().shape({
                    id: yup.number().positive().integer().required(),
                });
                await schema.validate(payload, { abortEarly: false });

                const query = `fields name, video_id, checksum, game; where id = ${payload.id};`;

                const response = await axios.post('https://api.igdb.com/v4/game_videos', query, {
                    headers: getHeaders(),
                });

                if (response.data.length === 0) {
                    return res.status(404).json({ error: 'Nenhum vídeo encontrado para este jogo.' });
                }

                return res.json(response.data);
            }
            default:
                return res.status(400).json({ error: 'Ação inválida.' });
        }
    } catch (error: any) {
        if (error instanceof yup.ValidationError) {
            return res.status(400).json({ error: error.errors.join(", ") });
        }
        return res.status(500).json({ error: `Erro interno no servidor ${error}` });
    }
}

function getHeaders() {
    return {
        'Client-ID': process.env.IGDB_CLIENT_ID || '',
        'Authorization': `Bearer ${process.env.IGDB_ACCESS_TOKEN || ''}`,
        'Content-Type': 'text/plain',
    };
}
