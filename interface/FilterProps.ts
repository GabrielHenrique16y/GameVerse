import Genres from "./Genre";

export default interface FilterProps {
    searchInput: string;
    setSearchInput: (value: string) => void;
    handleSearch: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    selectedGenre: string;
    handleGenreChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    genres: Genres[];
}