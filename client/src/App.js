import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/Login'
import Home from './pages/Home';
import RegisterPage from './pages/Register'

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/home" element={<Home />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;