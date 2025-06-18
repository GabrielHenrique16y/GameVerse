import { FormEvent, JSX, useState } from "react";
import './index.css'
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { notifyError, notifySuccess } from "../../../../_utils/toastMessage";

export default function Register(): JSX.Element {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate()

    const SubmitRegisterFn = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username || !email || !password || !passwordConfirm) {
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
                action: 'subscribe',
                payload: {
                    name: username,
                    email,
                    password,
                }
            });
            setLoading(false);
            notifySuccess('Conta criada com sucesso!', '✅');
            navigate('/login')

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

                <form className="register-form" onSubmit={SubmitRegisterFn}>
                    <input type="text" value={username} name="username" placeholder="Nome de Usuário" required onChange={(e) => setUsername(e.target.value)} />
                    <input type="email" value={email} name="email" placeholder="E-mail" onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" value={password} name="password" placeholder="Senha" onChange={(e) => setPassword(e.target.value)} required />
                    <input type="password" value={passwordConfirm} name="confirm_password" placeholder="Confirme a Senha" required onChange={(e) => setPasswordConfirm(e.target.value)} />
                    <button type="submit">
                        {loading ? 'Registrando...' : 'Registrar'}
                    </button>
                </form>

                <div className="register-links">
                    <Link to="/login">Já tem uma conta? Faça login</Link>
                </div>
            </div>
        </div>
    )
}