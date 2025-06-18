import { useEffect, useState, JSX } from "react";
import { useNavigate } from "react-router-dom";

import './index.css';
import axios from 'axios';
import Loading from "../../../components/Loading";

import Game from "../../../../interface/Game";

export default function Home(): JSX.Element {
    const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFeaturedGames = async () => {
            setLoading(true);
            try {
                const response = await axios.post('/api/games', {
                    action: 'featured',
                });

                setFeaturedGames(response.data);
                setLoading(false);
            } catch {
                setError('Erro ao carregar jogos em destaque.');
                setLoading(false);
            }
        }

        fetchFeaturedGames();
    }, []);

    if (error) {
        return <div>{error}</div>;
    }

    if (loading) return <Loading isLoading={loading} />
    
    return (
        <>
            <section className="hero" id="home">
                <h1>Bem-vindo ao <span>GameVerse</span></h1>
                <p>Explore o universo dos jogos com informações detalhadas sobre os seus favoritos.</p>
                <button onClick={() => navigate('/catalog')}>Descubra Mais</button>
            </section>

            <section className="games" id="games">
                <h2>Jogos em Destaque</h2>
                <div className="games-grid">
                    {featuredGames.length > 0 ? (
                        featuredGames.map((game: Game) => (
                            <div className="game-card" onClick={() => navigate(`/details/${game.id}`)} key={game.name}>
                                <img
                                    src={game.cover?.url.replace('t_thumb', 't_cover_big')}
                                    alt={game.name}
                                />
                                <h3>{game.name}</h3>
                                <p>{game.summary?.slice(0, 100)}...</p>
                            </div>
                        ))
                    ) : (
                        <p>Nenhum jogo em destaque encontrado.</p>
                    )}
                </div>
            </section>
        </>
    );
}
