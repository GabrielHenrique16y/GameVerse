import { JSX } from "react";
import { Link } from "react-router-dom";
import './index.css'

export default function Header(): JSX.Element {
    return <>
        <header>
            <Link to="/" className="logo">
                <div className="logo-icon"></div>
                <div className="logo-text">Game<span>Verse</span></div>
            </Link>

            <nav>
                <Link to="/catalog">Jogos</Link>
                <Link to="/platforms">Plataformas</Link>
                <Link to="#about">Sobre</Link>
            </nav>
        </header>
    </>
}