import { JSX } from "react";
import Genres from "../../../interface/Genre";
import FilterProps from "../../../interface/FilterProps";

export default function FilterComponent({ searchInput, setSearchInput, handleSearch, selectedGenre, handleGenreChange, genres }: FilterProps): JSX.Element {
    return (
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
    )
}