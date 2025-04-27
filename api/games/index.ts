import axios from 'axios';
import { VercelRequest, VercelResponse } from "@vercel/node";
import * as yup from 'yup';

const validationSchema = yup.object().shape({
    name: yup.string().optional(),
    quantity: yup.number().positive().integer().optional(),
    genre: yup.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { name, quantity, genre } = req.body;

    try {
        await validationSchema.validate({ name, quantity, genre }, { abortEarly: false });

        const filters: string[] = [];

        if (name) {
            filters.push(`name ~ *"${name}"*`);
        }

        if (genre) {
            filters.push(`genres.name = "${genre}"`);
        }

        filters.push(`rating != null`);

        const whereClause = filters.length > 0 ? `where ${filters.join(' & ')};` : '';

        const limit = quantity && quantity > 0 ? quantity : 16;

        const query = `
            fields name, cover.url, rating, release_dates.date, genres.name, platforms.name, summary;
            sort rating desc;
            limit ${limit};
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
        if (error instanceof yup.ValidationError) {
            return res.status(400).json({
                error: error.errors.join(", "),
            });
        }

        console.error(error.response?.data || error);
        return res.status(500).json({ error: 'Erro na requisição ao IGDB' });
    }
}
