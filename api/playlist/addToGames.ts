import { VercelRequest, VercelResponse } from "@vercel/node";
import supabase from "../../_utils/databaseConnection";
import * as yup from "yup"; 
import { loginRequired } from "../../_utils/loginRequired";

const validationSchema = yup.object().shape({
    game_id: yup
        .number()
        .required("game_id é obrigatório.")
        .positive("game_id deve ser um número positivo.")
        .integer("game_id deve ser um número inteiro."),
    user_id: yup
        .number()
        .required("user_id é obrigatório.")
        .positive("user_id deve ser um número positivo.")
        .integer("user_id deve ser um número inteiro."),
});

const handler = async(req: VercelRequest, res: VercelResponse) => {
    const { game_id, user_id } = req.body;

    try {
        await validationSchema.validate(req.body, { abortEarly: false });

        const { data, error } = await supabase
            .from("Games")
            .insert({
                id_game: game_id,
                user_id,
            })
            .select("id, id_game, user_id");

        if(error){
            res.status(400).json({
                errors: [error.message || "Erro inesperado."],
            });
            return; 
        }

        res.status(201).json(data);
        return; 
    } catch (e: any) {
        if (e instanceof yup.ValidationError) {
            res.status(400).json({
                errors: e.errors,
            });
            return; 
        }

        res.status(500).json({
            errors: [e.message || "Erro no servidor."],
        });
        return; 
    }
}

export default loginRequired(handler);
