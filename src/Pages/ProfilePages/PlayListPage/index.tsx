import { JSX, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import Game from "../../../interface/Game";
import Loading from "../../../components/Loading";

export default function PlayListPage(): JSX.Element {
    const { user } = useAuth();
    const [games, setGames] = useState<Game[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const getGames = async () => {
            setLoading(true);
            try {
                const response = await axios.post('/api/playlist/', {
                    user_id: user?.id
                })

                setGames(response.data)
                setLoading(false);
            } catch (e) {
                console.error(e);
                setLoading(false);
            }
        }

        getGames();
    }, [])

    const renderStars = (rating: number) => {
        const maxStars = 5;
        const starRating = (rating / 100) * maxStars;
        const fullStars = Math.floor(starRating);
        const halfStar = starRating - fullStars >= 0.5;
        const emptyStars = maxStars - fullStars - (halfStar ? 1 : 0);
    
        return (
            '★'.repeat(fullStars) +
            (halfStar ? '⯪' : '') + 
            '☆'.repeat(emptyStars)
        );
    };

    
    if(loading) return <Loading isLoading={loading} />
    if(!games){
        return <><h1>Jogo não encontrado</h1></>
    }

    return (
        <section className="catalogSection">
            <div className="title_content">
                <h1>Jogos Favoritos</h1>
            </div>
            <div className="catalog-grid">
                {games.length > 0 ? (
                    games.map((game: Game) => (
                        <div className="catalog-item" key={game.id}>
                            <img
                                src={game.cover?.url.replace('t_thumb', 't_cover_big')}
                                alt={game.name}
                            />
                            {typeof game.rating === 'number' && (
                                <p className="rating">
                                    {renderStars(game.rating)} ({game.rating.toFixed(1)})
                                </p>
                            )}
                            <h3>{game.name}</h3>
                            <p>{game.summary?.slice(0, 100)}...</p>
                            <a href={`/details/${game.id}`}>Ver Mais</a>
                        </div>
                    ))
                ) : (
                    <p>Nenhum jogo encontrado.</p>
                )}
            </div>
        </section>
        
    )
}