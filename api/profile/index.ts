import { VercelRequest, VercelResponse } from "@vercel/node";
import { loginRequired } from "../../_utils/loginRequired";
import * as yup from 'yup';
import supabase from "../../_utils/databaseConnection";

const schema = yup.object().shape({
    id: yup.number().positive().integer().required(),
});

const handler = async (req: VercelRequest, res: VercelResponse): Promise<void> => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        await schema.validate(req.body, { abortEarly: false });
        const { id } = req.body;

        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, tag')
            .eq('id', id)
            .single();

        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }

        res.status(200).json(data);
    } catch (err: any) {
        if (err.name === 'ValidationError') {
            res.status(400).json({ error: err.errors });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

export default loginRequired(handler);
