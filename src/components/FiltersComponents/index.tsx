import { JSX } from "react";
import Genres from "../../../interface/Genre";

export default function FilterComponent({
    searchInput,
    setSearchInput,
    handleKeyDown,
    handleBlur,
    selectedGenre,
    handleGenreChange,
    genres
}: {
    searchInput: string;
    setSearchInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    handleBlur: () => void;
    selectedGenre: string;
    handleGenreChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    genres: Genres[];
}): JSX.Element {
    return (
        <div className="catalog-filters">
            <input
                type="text"
                value={searchInput}
                placeholder="Pesquisar por nome do jogo..."
                onChange={setSearchInput}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
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
    );
}
