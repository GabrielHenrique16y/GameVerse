import { FormEvent, JSX, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { notifyError, notifySuccess } from "../../../../_utils/toastMessage";

export default function ResetPassword(): JSX.Element {
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tokenFromUrl = queryParams.get('token');
        setToken(tokenFromUrl);
    }, [location]);

    const SubmitResetPassword = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!password || !passwordConfirm) {
            setError('Por favor, preencha todos os campos.');
            return;
        }

        if (password !== passwordConfirm) {
            setError('As senhas não estão iguais.');
            return;
        }
        
        setLoading(true);

        try {
            await axios.post('/api/auth', {
                action: 'reset-password',
                payload: {newPassword: password, token}
            });
            setLoading(false);
            notifySuccess('Senha resetada com sucesso!', '✅');
            navigate('/login');

        } catch (err: any) {
            setLoading(false);
        
            if (err.response && err.response.data && err.response.data.errors) {
                setError(err.response.data.errors.join(' ')); 
                if(err.response.data.errors == 'Token inválido ou expirado.'){
                    notifyError('Essa conta não existe.', '❌');
                    navigate('/login');
                }
            } else {
                setError('Erro ao resetar a senha. Tente novamente.');
            }
        
            notifyError('Erro ao resetar a senha. Tente novamente.', '❌');
        }
        
    };

    return (
        <div className="center">
            <div className="register-container">
                {error && <div className="error-message">{error}</div>} 
                <div className="logo">Game<span>Verse</span></div>

                <form className="register-form" onSubmit={SubmitResetPassword}>
                    <input type="password" value={password} name="password" placeholder="Nova senha" onChange={(e) => setPassword(e.target.value)} required />
                    <input type="password" value={passwordConfirm} name="confirm_password" placeholder="Confirme a Nova senha" required onChange={(e) => setPasswordConfirm(e.target.value)} />
                    <button type="submit">
                        {loading ? 'Resetando a senha...' : 'Resetar senha'}
                    </button>
                </form>
            </div>
        </div>
    )
}
