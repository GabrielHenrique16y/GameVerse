import { JSX } from "react";
import './index.css'

export default function Page404(): JSX.Element {
    return (
        <div className="center">
            <div className="container">
                <div className="logo">Game<span>Verse</span></div>
                <h1>404</h1>
                <p>Oops! A página que você está procurando não foi encontrada.</p>
                <p>Talvez você tenha digitado o endereço errado ou a página não existe mais.</p>
                <a href="/">Voltar para a Página Inicial</a>
            </div>
        </div>
    )
}