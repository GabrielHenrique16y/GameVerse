import { JSX } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";

import './index.css';

import { useAuth } from "../../context/AuthContext";
import { notifyError, notifySuccess } from "../../../_utils/toastMessage";

export default function Header(): JSX.Element {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const toggleMenu = () => {
        const menuToggle = document.querySelector('.menu-toggle') as HTMLDivElement;
        const nav = document.querySelector('nav');

        menuToggle.classList.toggle('active');
        nav?.classList.toggle('active');
    };

    const logoutBtn = async() => {
        try{
            await axios.post('/api/logout');

            Cookies.remove('token');
            Cookies.remove('user');

            notifySuccess('Logout realizado com sucesso!', '🚀')
            setUser(null)

            navigate('/login');
        }catch{
            notifyError('Erro ao sair da conta', '')
        }
    }

    const redirectBtn = (url: string) => {
        navigate(url);
    }

    return (
        <header>
            <div className="logo">
                <div className="logo-icon"></div>
                <div>Game<span>Verse</span></div>
            </div>

            <div className="menu-toggle" onClick={toggleMenu}>☰</div>

            <nav>
                <Link to="/">Home</Link>
                <Link to="/catalog">Jogos</Link>
                <Link to="/platforms">Plataformas</Link>
                {user?.id ? (
                    <Link to="/users">Usuários</Link>
                ) : ''}

                {user?.id ? (
                    <div className="user-dropdown mobile-only">
                        <span id="user-name">{user.nome}</span>
                        <div className="dropdown-menu">
                            <Link to="/profile">Meu Perfil</Link>
                            <Link to="/playlist">Jogos favoritos</Link>
                            <Link to="#settings">Configurações</Link>
                            <Link to="#" onClick={logoutBtn} id="logout-btn">Sair</Link>
                        </div>
                    </div>
                ) : (
                    <div className="user-dropdown mobile-only">
                        <Link to="/login">Login</Link>
                        <Link to="/register">Cadastro</Link>
                    </div>
                )}
            </nav>

            {!user?.id ? (
                <div className="auth desktop-only">
                    <button onClick={() => redirectBtn('/login')} id="login-btn">Login</button>
                    <button onClick={() => redirectBtn('/register')} id="register-btn">Cadastro</button>
                </div>
            ) : (
                <div className="auth desktop-only">
                    <div className="user-dropdown">
                        <span id="user-name">{user.nome} <FaUserCircle size={'24px'}/> </span>
                        <div className="dropdown-menu">
                            <Link to={`/profile/${user.id}`}>Meu Perfil</Link>
                            <Link to="/playlist">Jogos favoritos</Link>
                            <Link to="#settings">Configurações</Link>
                            <Link to="#" onClick={logoutBtn} id="logout-btn">Sair</Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
