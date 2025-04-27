import { Routes, Route } from 'react-router-dom';

import MyRoute from './MyRoute';

import Home from '../Pages/Others/Home';
import CatalogPage from '../Pages/GamesPages/CatalogPage';
import GameDetails from '../Pages/GamesPages/GameDetails';
import PlatformPage from '../Pages/PlatformPages/PlatformPage';
import CatalogPlatform from '../Pages/PlatformPages/CatalogPlatform';
import Page404 from '../Pages/Others/Page404';
import Login from '../Pages/AuthPages/Login';
import Register from '../Pages/AuthPages/Register';
import PlayListPage from '../Pages/ProfilePages/PlayListPage';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/details/:id" element={<GameDetails />} />
            <Route path="/platforms" element={<PlatformPage />} />
            <Route path="/platform/:id" element={<CatalogPlatform />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/playlist" element={<MyRoute IsClosed><PlayListPage /></MyRoute>} />

            <Route path="*" element={<Page404 />} />
        </Routes>
    );
}
