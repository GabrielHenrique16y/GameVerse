import { JSX, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../../components/Loading';

import Game from '../../../../interface/Game';
import Genres from '../../../../interface/Genre';
import { useParams } from 'react-router-dom';

export default function CatalogPage(): JSX.Element {
    const [genres, setGenres] = useState<Genres[]>([]);
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams()

    const [searchInput, setSearchInput] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const [selectedGenre, setSelectedGenre] = useState<string>('');

    const fetchGames = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.post('/api/games', {
                action: 'byPlatform',
                payload: {
                    name: searchQuery,
                    genre: selectedGenre,
                    id: id,
                },
            });
            setGames(response.data);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setError('Erro ao carregar os jogos.');
            setLoading(false);
        }
    }, [searchQuery, selectedGenre, id]);


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
    }, [fetchGames]);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setSearchQuery(searchInput);
        }
    };

    const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedGenre(e.target.value);
        setSearchQuery(searchInput);
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

    if (loading) return <Loading isLoading={loading} />

    return (
        <>
            <section className="catalogSection">
                <div className="title_content">
                    <h1>Catálogo de jogos</h1>
                    <p>Explore os jogos mais populares e descubra novos favoritos!</p>
                </div>

                <div className="catalog-filters">
                    <input
                        type="text"
                        value={searchInput}
                        placeholder="Pesquisar por nome do jogo..."
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                    <select
                        value={selectedGenre}
                        onChange={handleGenreChange}
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
                    {error ? (
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
                                <a className='btn' href={`/details/${game.id}`}>Ver Mais</a>
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
