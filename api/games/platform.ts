import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import * as yup from 'yup';

const validationSchema = yup.object().shape({
    id: yup.number().positive().integer().required('ID da plataforma é obrigatório e deve ser um número válido'),
    name: yup.string().optional(),
    genre: yup.string().optional(),
    quantity: yup.number().positive().integer().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { id, name, genre, quantity } = req.body;

    try {
        await validationSchema.validate({ id, name, genre, quantity }, { abortEarly: false });

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
            fields name, cover.url, rating, platforms.id, platforms.name, summary;
            ${whereClause}
            sort rating desc;
            limit ${quantity || 16};
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
                error: error.errors.join(', '),
            });
        }

        console.error('Erro ao buscar jogos:', error);
        res.status(500).json({ error: 'Erro ao buscar jogos da plataforma.' });
    }
}
