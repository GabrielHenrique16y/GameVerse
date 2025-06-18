import axios from "axios";
import { JSX, useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { notifyError } from "../../../../_utils/toastMessage";
import Loading from "../../../components/Loading";
import './index.css'
import UserProfile from "../../../../interface/Profile";
import Game from "../../../../interface/Game";
import { useAuth } from "../../../context/AuthContext";

export default function Profile(): JSX.Element {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [games, setGames] = useState<Game[] | null>(null);
    const { id } = useParams()
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const getUser = async () => {
            try {
                setIsLoading(true);
                const response = await axios.post('/api/profile', { id });
                setProfile(response.data);
            } catch {
                notifyError('Não foi possível encontrar o usuário.', '');
            } finally {
                setIsLoading(false);
            }
        };

        getUser();
    }, [id]);

    useEffect(() => {
        const getGames = async () => {
            if (!profile?.id) return;

            try {
                setIsLoading(true);
                const response = await axios.post('/api/playlist', {
                    user_id: profile.id,
                });
                setGames(response.data);
            } catch {
                notifyError('Não foi possível encontrar os jogos desse usuário.', '');
            } finally {
                setIsLoading(false);
            }
        };

        getGames();
    }, [profile]);

    if (isLoading) return <Loading isLoading={isLoading} />
    const isYouProfile = user?.id === profile?.id;
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

    const btnDelete = async(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();

        await axios.post('api/auth', {
            action: 'delete',
            payload: {id: user?.id}
        })
    }

    return (
        <>
            <div className="flex">
                <div className="profile-section">
                    <h1>Perfil do Usuário</h1>
                    <div className="user-section">
                        <div className="img-container">
                            <FaUserCircle size={180} />
                        </div>
                        <div className="user-container">
                            <h1>{profile?.name}#{profile?.tag}</h1>
                            <h2>{profile?.email}</h2>
                            {isYouProfile && (
                                <div className="user-actions">
                                    <a href={`/edit/${user?.id}`} className="btn">Editar conta</a>
                                    <a href="/" onClick={(e) => btnDelete(e)} className="btn">Excluir conta</a>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="games-section">
                        <h1>Jogos Favoritos</h1>
                        <div className="card-section">
                            {games && games.length > 0 ? (
                                games.slice(0, 4).map((game) => (
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
                                        <p>{game.summary ? `${game.summary.slice(0, 100)}...` : 'Sem descrição.'}</p>
                                        <a className="btn" href={`/details/${game.id}`}>Ver Mais</a>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-message">Este usuário não salvou jogos ainda.</p>
                            )}
                        </div>
                        {games && games.length > 0 && (
                            <div className="actions-content">
                                <a className="btn" href={`/playlist/${profile?.id}`}>Ver Todos</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}