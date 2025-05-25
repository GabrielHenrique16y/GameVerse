import { JSX } from "react";
import Game from "../../../interface/Game";
import renderStars from "../../../_utils/renderStars";
import CatalogProps from "../../../interface/CatalogProps";

export default function CatalogComponent({ games, error }: CatalogProps): JSX.Element {
    return (
        <div className="catalog-grid">
            {error ? (
                <p>{error}</p>
            ) : games.length > 0 ? (
                games.map((game: Game) => (
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
                        <p>{game.summary?.slice(0, 100)}...</p>
                        <a className="btn" href={`/details/${game.id}`}>Ver Mais</a>
                    </div>
                ))
            ) : (
                <p>Nenhum jogo encontrado.</p>
            )}
        </div>
    );
}
