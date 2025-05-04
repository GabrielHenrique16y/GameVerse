export default interface RelatedGame {
    id: number;
    name: string;
    cover?: { url: string };
    rating?: number;
}