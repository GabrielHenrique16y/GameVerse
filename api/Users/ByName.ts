import { VercelRequest, VercelResponse } from "@vercel/node";
import { loginRequired } from "../../_utils/loginRequired";
import supabase from "../../_utils/databaseConnection";
import * as yup from 'yup'

const validationSchema = yup.object().shape({
    name: yup
        .string()
        .trim()
        .required("Name é obrigatório."),
})

const handler = async (req: VercelRequest, res: VercelResponse): Promise<void> => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { name } = req.body;
        await validationSchema.validate(req.body, { abortEarly: false });

        if (!name.includes('#')) {
            res.status(400).json({ error: 'Formato inválido. Use nome#123456' });
            return;
        }

        const [username, tag] = name.split('#');

        if (!username || !tag || isNaN(Number(tag)) || tag.length !== 6) {
            res.status(400).json({ error: 'Formato inválido. Use nome#123456' });
            return;
        }

        const { data, error } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('name', username)
            .eq('tag', parseInt(tag, 10))
            .single();

        if (error || !data) {
            res.status(404).json({ error: 'Usuário não encontrado.' });
            return;
        }

        res.status(200).json([data]);
    } catch (err: any) {
        if (err.name === 'ValidationError') {
            res.status(400).json({ error: err.errors });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

export default loginRequired(handler);
