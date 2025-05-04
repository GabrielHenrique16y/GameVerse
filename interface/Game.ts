import InvolvedCompany from "./InvolvedCompany";
import RelatedGame from "./RelatedGame";

export default interface Game {
    id: number;
    name: string;
    cover?: { url: string };
    summary?: string;
    rating?: number;
    platforms?: { name: string }[];
    genres?: { name: string }[];
    release_dates?: { date: number }[];
    involved_companies: InvolvedCompany[];
    related_games?: RelatedGame[];
    videos: number[];
}