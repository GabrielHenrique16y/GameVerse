import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { Link } from "react-router-dom";

import './index.css'
import { useAuth } from "../../../context/AuthContext";
import { notifyError, notifyInfo, notifySuccess } from "../../../../_utils/toastMessage";

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { setUser } = useAuth();

    useEffect(() => {
        const userCookie = Cookies.get("user");
        if (userCookie) {
            notifyInfo('Você já está logado', '')
            navigate("/");
        }
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            notifyError("Por favor, preencha todos os campos.", '❌');
            return;
        }

        setLoading(true);
        try {
            await axios.post("/api/auth", { action: 'login', payload: {email, password}}, { withCredentials: true });
            
            const userData = JSON.parse(Cookies.get('user') || '{}');
            setUser(userData);

            setLoading(false);
            notifySuccess('Logado com sucesso!', '🎉');
            navigate("/");
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.errors?.[0] || "Erro ao logar. Tente novamente.";
                notifyError(message, '❌');
            } else {
                notifyError("Erro inesperado. Tente novamente.", '❌');
            }
            setLoading(false);
        }
    };


    return (
        <div className="center">
            <div className="login-container">
                <div className="logo">Game<span>Verse</span></div>

                <form className="login-form" onSubmit={handleLogin}>
                    <input type="email" name="email" placeholder="E-mail" required onChange={(e) => setEmail(e.target.value)} value={email} />
                    <input type="password" name="password" placeholder="Senha" required onChange={(e) => setPassword(e.target.value)} value={password} />
                    <button type="submit">{loading ? "Entrando..." : "Entrar"}</button>
                </form>
                <div className="login-links">
                    <Link to="/register">Criar uma conta</Link> |
                    <Link to="/forgot-password">Esqueceu a senha?</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
