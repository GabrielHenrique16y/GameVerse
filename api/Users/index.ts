import { VercelRequest, VercelResponse } from "@vercel/node";
import { loginRequired } from "../../_utils/loginRequired";
import supabase from "../../_utils/databaseConnection";

const handler = async (req: VercelRequest, res: VercelResponse): Promise<void> => {
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {

        const { data, error } = await supabase
            .from('users')
            .select('id, name, email')

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
