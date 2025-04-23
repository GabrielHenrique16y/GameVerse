import { useEffect, useState, JSX } from "react";
import { useParams } from "react-router-dom";

import './index.css';

import axios from "axios";
import Loading from "../../components/Loading";

import Game from '../../interface/Game';
import Video from '../../interface/Video';
import Link from '../../interface/Link';

export default function GameDetails(): JSX.Element {
    const [game, setGame] = useState<Game | null>(null);
    const [video, setVideo] = useState<Video[] | null>(null);
    const [link, setLink] = useState<Link | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams();

    const getFormattedDate = (unixTimestamp?: number) => {
        if (!unixTimestamp) return "Data não disponível";
        const date = new Date(unixTimestamp * 1000);
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };
    useEffect(() => {
        const fetchGame = async () => {
            try {
                const response = await axios.post(`/api/games/gameByid`, {
                    id: id,
                    headers: {
                        'Cache-Control': 'no-cache',
                    },
                    params: {
                        _t: Date.now(),
                    },
                });
                const gameData = response.data;
                setGame(gameData);
                await getLink(gameData.name);
                setLoading(false);
            } catch (e) {
                console.error(e);
                setError('Erro ao carregar os jogos.');
                setLoading(false);
            }
        };

        const getLink = async (gameName: string) => {
            setLoading(true);
            try {
                const searchResponse = await axios.get(`https://api.rawg.io/api/games?search=${encodeURIComponent(gameName)}&key=a6e8a25ea494453793806fd36b4e38c8`);
                const firstGame = searchResponse.data.results[0];
                if (!firstGame) return;

                const linkResponse = await axios.get(`https://api.rawg.io/api/games/${firstGame.id}/stores?key=a6e8a25ea494453793806fd36b4e38c8`);
                setLink(linkResponse.data);
                setLoading(false);
            } catch (e) {
                console.error(e);
                setError('Erro ao buscar link de compra.');
                setLoading(false);
            }
        };

        fetchGame();
    }, [id]);

    useEffect(() => {
        const fetchVideo = async () => {
            if (!game?.videos || game.videos.length === 0) return;

            try {
                const response = await axios.post(`/api/games/video?id=${game.videos[0]}`);
                setVideo(response.data);
            } catch (e) {
                console.error(e);
                setError('Erro ao carregar vídeo.');
            }
        };

        fetchVideo();
    }, [game]);


    if (error || !game) return <p>{error || "Jogo não encontrado."}</p>;

    const developers = game?.involved_companies
        ?.filter((c) => c.developer)
        .map((c) => c.company.name)
        .join(", ");

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

    const purchaseUrl = link?.results?.[0]?.url;

    return (
        <>
            <Loading isLoading={loading} />
            <section className="game-details">
                <div className="game-header">
                    {game.cover?.url && (
                        <img src={game.cover.url.replace('t_thumb', 't_cover_big')} alt={game.name} />
                    )}
                    <div className="game-info">
                        <h1>{game.name}</h1>
                        <p><span>Gênero: </span>{game.genres?.map((genre) => genre.name).join(', ')}</p>
                        <p><span>Plataformas: </span>{game.platforms?.map((plataform) => plataform.name).join(', ')}</p>
                        <p><span>Avaliação: </span>{game.rating?.toFixed(2)}</p>
                        <p><span>Data de Lançamento: </span>{getFormattedDate(game.release_dates?.[0]?.date)}</p>
                        <p><span>Desenvolvedor: </span>{developers}</p>
                        <div className="game-actions">
                            {purchaseUrl ? (
                                <a href={purchaseUrl} target="_blank" rel="noopener noreferrer">Comprar Agora</a>
                            ) : (
                                <a href="/catalog">Link para compra indisponível</a>
                            )}
                            <a href="#">Adicionar aos Favoritos</a>
                        </div>
                    </div>
                </div>
                <div className="game-description">
                    <h2>Descrição</h2>
                    <p>{game.summary}</p>
                </div>
                <div className="game-trailer">
                    <h2>Trailer</h2>
                    {video && video.length > 0 && video[0].video_id ? (
                        <iframe
                            src={`https://www.youtube.com/embed/${video[0].video_id}`}
                            title={video[0].name}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <p>Trailer indisponível.</p>
                    )}
                </div>

                {game.related_games && game.related_games.length > 0 && (
                    <div className="similar-games">
                        <h2>Jogos Relacionados</h2>
                        <div className="games-grid">
                            {game.related_games.map((relatedGame) => (
                                <div className="game-card" key={relatedGame.id}>
                                    {relatedGame.cover?.url && (
                                        <img src={relatedGame.cover.url.replace('t_thumb', 't_cover_big')} alt={relatedGame.name} />
                                    )}
                                    {typeof relatedGame.rating === 'number' && (
                                        <p className="rating">
                                            {renderStars(relatedGame.rating)} ({relatedGame.rating.toFixed(1)})
                                        </p>
                                    )}
                                    <h3>{relatedGame.name}</h3>
                                    <a href={`/details/${relatedGame.id}`}>Ver Mais</a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
            {error && <div className="error-message">{error}</div>}
        </>
    );
}
