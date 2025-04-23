import { JSX, useCallback, useEffect, useState } from 'react';
import './index.css';
import axios from 'axios';
import Loading from '../../components/Loading';

import Game from '../../interface/Game';
import Genres from '../../interface/Genre';

export default function CatalogPage(): JSX.Element {
    const [genres, setGenres] = useState<Genres[]>([]);
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState<string>('');
    const [selectedGenre, setSelectedGenre] = useState<string>('');

    const fetchGames = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/games', {
                name: search,
                genre: selectedGenre,
            });
            setGames(response.data);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setError('Erro ao carregar os jogos.');
            setLoading(false);
        }
    }, [search, selectedGenre]);

    const getGenres = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/genres');
            setGenres(response.data);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setError('Erro ao carregar os gêneros.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
        getGenres();
    }, [fetchGames, search, selectedGenre]);

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

    return (
        <>
            <Loading isLoading={loading}/>
            <section className="catalogSection">
                <div className="title_content">
                    <h1>Catálogo de jogos</h1>
                    <p>Explore os jogos mais populares e descubra novos favoritos!</p>
                </div>

                <div className="catalog-filters">
                    <input
                        type="text"
                        value={search}
                        placeholder="Pesquisar por nome do jogo..."
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                    >
                        <option value="">Todos os Gêneros</option>
                        {genres.map((genre: Genres) => (
                            <option key={genre.name} value={genre.name}>
                                {genre.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="catalog-grid">
                    { error ? (
                        <p>{error}</p>
                    ) : games.length > 0 ? (
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
        </>
    );
}
