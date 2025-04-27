import { useEffect, useState, JSX } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

import './index.css';

import Loading from "../../../components/Loading";

import Game from '../../../interface/Game';
import Video from '../../../interface/Video';
import TypeLink from '../../../interface/Link';
import { useAuth } from "../../../context/AuthContext";
import { notifyError, notifySuccess, notifyWarning } from "../../../../_utils/toastMessage";

export default function GameDetails(): JSX.Element {
    const [game, setGame] = useState<Game | null>(null);
    const [video, setVideo] = useState<Video[] | null>(null);
    const [link, setLink] = useState<TypeLink | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { id } = useParams();
    const navigate = useNavigate()

    const { user, setUser } = useAuth();

    useEffect(() => {
        const userCookie = Cookies.get('user');
        const parsedUser = userCookie ? JSON.parse(userCookie) : null;
        setUser(parsedUser);
    }, []);

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
            } catch {
                notifyError('Erro ao carregar os jogos.', '❌');
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
            } catch {
                notifyError('Erro ao buscar link de compra.', '❌');
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
            } catch {
                notifyError('Erro ao carregar vídeo.', '❌');
            }
        };

        fetchVideo();
    }, [game]);

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

    const addToFavoritesBtn = async () => {
        try {
            if (!user) {
                notifyWarning('Você precisa fazer login para adicionar aos favoritos', '⚠️')
            } else {
                const response = await axios.post(`/api/playlist/addToGames`, {
                    game_id: id,
                    user_id: user?.id,
                });
                setVideo(response.data);
                notifySuccess('Jogo adicionado com sucesso!', '🎮');
                navigate('/playlist')
            }
        } catch {
            notifyError('Erro ao adicionar aos favoritos.', '❌');
        }
    }

    if (loading) return <Loading isLoading={true} />;
    if (!game) return <p>Jogo não encontrado.</p>;
    const purchaseUrl = link?.results?.[0]?.url;

    return (
        <>
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
                                <Link to={purchaseUrl} target="_blank" rel="noopener noreferrer">Comprar Agora</Link>
                            ) : (
                                <Link to="/catalog">Link para compra indisponível</Link>
                            )}
                            <Link to="#" onClick={addToFavoritesBtn}>Adicionar aos favoritos</Link>
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
                                    <Link to={`/details/${relatedGame.id}`}>Ver Mais</Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </>
    );
}
