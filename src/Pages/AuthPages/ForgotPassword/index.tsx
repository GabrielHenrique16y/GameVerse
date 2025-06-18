import { FormEvent, JSX, useState } from "react";
import axios from "axios";
import { notifyError, notifySuccess } from "../../../../_utils/toastMessage";

export default function ForgotPassword(): JSX.Element {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const submitForgotPassword = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Por favor, preencha o E-mail.');
            return;
        }

        
        setLoading(true);

        try {
            await axios.post('/api/auth/', {
                action: 'forgot-password',
                payload: { email }
            });
            setLoading(false);
            notifySuccess('Email enviado com sucesso!', '✅');
        } catch (err: any) {
            setLoading(false);
        
            if (err.response && err.response.data && err.response.data.errors) {
                setError(err.response.data.errors.join(' ')); 
            } else {
                setError('Erro ao registrar. Tente novamente.');
            }
        
            notifyError('Erro ao registrar. Tente novamente.', '❌');
        }
        
    };

    return (
        <div className="center">
            <div className="register-container">
                {error && <div className="error-message">{error}</div>} 
                <div className="logo">Game<span>Verse</span></div>

                <form className="register-form" onSubmit={submitForgotPassword}>
                    <input type="email" value={email} name="email" placeholder="E-mail" onChange={(e) => setEmail(e.target.value)} required />
                    <button type="submit">
                        {loading ? 'Enviando...' : 'Enviar'}
                    </button>
                </form>
            </div>
        </div>
    )
}