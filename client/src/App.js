import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';
import Home from './pages/Home';
import RegisterPage from './pages/Register';
import Admin from './pages/Admin';
import TablesRouter from './tables/TablesRouter';
import RecipePage from './pages/Recipe';
import SearchRecipe from './pages/SearchRecipe';
import WelcomePage from './pages/Welcome'

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/home" element={<Home />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/table/:type" element={<TablesRouter />} />
                <Route path="/recipes/:id" element={<RecipePage />} />
                <Route path="/home/search_recipe" element={<SearchRecipe />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;