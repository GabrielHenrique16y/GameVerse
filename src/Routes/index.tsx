import { Routes, Route } from 'react-router-dom';

import MyRoute from './MyRoute';

import Home from '../Pages/Home';
import CatalogPage from '../Pages/CatalogPage';
import GameDetails from '../Pages/GameDetails';
import PlatformPage from '../Pages/PlatformPage';
import CatalogPlatform from '../Pages/CatalogPlatform';
import Page404 from '../Pages/Page404';

export default function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <MyRoute IsClosed={false}>
                        <Home />
                    </MyRoute>
                }
            />
            <Route
                path="/catalog"
                element={
                    <MyRoute IsClosed={false}>
                        <CatalogPage />
                    </MyRoute>
                }
            />
            <Route
                path="/details/:id"
                element={
                    <MyRoute IsClosed={false}>
                        <GameDetails />
                    </MyRoute>
                }
            />
            <Route
                path="/platforms"
                element={
                    <MyRoute IsClosed={false}>
                        <PlatformPage />
                    </MyRoute>
                }
            />
            <Route
                path="/platform/:id"
                element={
                    <MyRoute IsClosed={false}>
                        <CatalogPlatform />
                    </MyRoute>
                }
            />
            <Route
                path="*"
                element={
                    <MyRoute IsClosed={false}>
                        <Page404 />
                    </MyRoute>
                }
            />
        </Routes>
    );
}
