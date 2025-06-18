import { JSX, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../../components/Loading';

import Game from '../../../../interface/Game';
import Genres from '../../../../interface/Genre';
import CatalogComponent from '../../../components/CatalogComponent';
import FilterComponent from '../../../components/FiltersComponents';

export default function CatalogPage(): JSX.Element {
    const [genres, setGenres] = useState<Genres[]>([]);
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [searchInput, setSearchInput] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const [selectedGenre, setSelectedGenre] = useState<string>('');

    const fetchGames = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.post('/api/games', {
                action: 'byName',
                payload: { name: searchQuery, genre: selectedGenre }
            });

            setGames(response.data);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setError('Erro ao carregar os jogos.');
            setLoading(false);
        }
    }, [searchQuery, selectedGenre]);

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

    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setSearchQuery(searchInput.trim());
        }
    };

    const handleSearchBlur = () => {
        setSearchQuery(searchInput.trim());
    };

    const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedGenre(e.target.value);
        setSearchQuery(searchInput);
    };

    if (loading) return <Loading isLoading={loading} />

    return (
        <>
            <section className="catalogSection">
                <div className="title_content">
                    <h1>Catálogo de jogos</h1>
                    <p>Explore os jogos mais populares e descubra novos favoritos!</p>
                </div>

                <FilterComponent
                    genres={genres}
                    handleGenreChange={handleGenreChange}
                    searchInput={searchInput}
                    setSearchInput={handleSearchInput}
                    handleKeyDown={handleSearchKeyDown}
                    handleBlur={handleSearchBlur}
                    selectedGenre={selectedGenre}
                />

                <CatalogComponent games={games} error={error} />
            </section>
        </>
    );
}
