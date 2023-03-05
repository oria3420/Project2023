import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/Login'
import Home from './pages/Home';
import RegisterPage from './pages/Register'
import Admin from './pages/Admin'
import Recipe from './pages/Recipe'

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/home" element={<Home />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/recipe" element={<Recipe />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;