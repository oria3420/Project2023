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
import Setting from './pages/Setting';
import SettingsNew from './pages/SettingsNew';
import FavoriteRecipes from './pages/FavoriteRecipes'
import Shopping from './pages/Shopping';
import Trending from './pages/Trending';
import Groceries from './pages/Groceries';
import AddRecipe from './pages/AddRecipe';
import MyRecipes from './pages/MyRecipes'
import Recommendations from './components/Recommendations'


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
                <Route path="/setting" element={<Setting />} />
                <Route path="/settings_new" element={<SettingsNew />} />
                <Route path="/favorites" element={<FavoriteRecipes />} />
                <Route path="/shopping" element={<Shopping />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/groceries" element={<Groceries />} />
                <Route path="/add_recipe" element={<AddRecipe />} />
                <Route path="/my_recipes" element={<MyRecipes />} />
                <Route path="/recommended" element={<Recommendations />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;