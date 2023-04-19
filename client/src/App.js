import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Admin from './pages/Admin';
import TablesRouter from './tables/TablesRouter';
import RecipePage from './pages/Recipe';
import SearchRecipe from './pages/SearchRecipe';
import WelcomePage from './pages/Welcome'
import PopularRecipes from './pages/PopularRecipes'

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/table/:type" element={<TablesRouter />} />
                <Route path="/recipes/:id" element={<RecipePage />} />
                <Route path="/search_recipe" element={<SearchRecipe />} />
                <Route path="/popular_recipes" element={<PopularRecipes />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;