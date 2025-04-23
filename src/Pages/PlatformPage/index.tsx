import { useEffect, useState, JSX, useCallback } from "react";

import './index.css';
import axios from 'axios';

import PopularPlatforms from "../../interface/PopularPlatforms";
import Game from "../../interface/Game";
import Loading from "../../components/Loading";


export default function PlatformPage(): JSX.Element {
    const [popularPlatforms, setPopularPlatforms] = useState<PopularPlatforms[] | null>(null);
    const [gamesByPlatform, setGamesByPlatform] = useState<Record<number, Game[]>>({});
    const [loading, setLoading] = useState<boolean>(true);

    const getPopularPlatforms = useCallback(async () => {
        setLoading(true)
        try {
            const response = await axios.post('/api/platform/popular', {}, {
                headers: {
                    'Cache-Control': 'no-cache',
                },
            });

            setPopularPlatforms(response.data);

            response.data.forEach((platform: PopularPlatforms) => {
                getGamesByPlatform(platform.id);
            });
            setLoading(false)
        } catch (e) {
            console.error(e);
            setLoading(false)
        }
    }, []);

    const getGamesByPlatform = async (platformId: number) => {
        setLoading(true)
        try {
            const response = await axios.post(`/api/games/exclusive`, {
                id: platformId
            });
            setGamesByPlatform(prev => ({
                ...prev,
                [platformId]: response.data,
            }));
            console.log(JSON.stringify(response.data, null, 2));
            setLoading(false)

        } catch (e) {
            console.error(e);
            setLoading(false)
        }
    };

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

    useEffect(() => {
        getPopularPlatforms();
    }, [getPopularPlatforms]);

    return (
        <>
            <Loading isLoading={loading} />
            <section className="platforms">
                <h1>Plataformas</h1>
                <p>Explore os jogos disponíveis para cada plataforma!</p>
                {popularPlatforms?.map((platform) => (
                    <div className="platform">
                        <h2>{platform.abbreviation} ({platform.name})</h2>
                        <div className="platform-grid" key={platform.id}>
                            {gamesByPlatform[platform.id]?.slice(0, 2).map((game) => (
                                <div className="game-cards">
                                    <div key={game.id} className="game-card">
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
                                </div>
                            )) || <p>Carregando jogos...</p>}
                            <div className="see-more-card">
                                <a href={`/platform/${platform.id}`}>Veja Mais</a>
                            </div>
                        </div>
                    </div>
                ))}
            </section >
        </>
    );
}
