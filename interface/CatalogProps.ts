import Game from "./Game";

export default interface CatalogProps {
    games: Game[];
    error?: string | null;
}