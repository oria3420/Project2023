import './Components.css';
import LogoutBtn from './LogoutBtn';
import SettingBtn from './SettingBtn';
import FavoriesBtn from './FavoritesBtn';
import ShoppingBtn from './ShoppingBtn';
import MyRecipesBtn from './MyRecipesBtn';
import AnalysisBtn from './AnalysisBtn';
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';

import GuestModal from './GuestModal';


const Navbar = ({ name }) => {
    const navigate = useNavigate()
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (name.endsWith('(Admin)')) {
            setIsAdmin(true);
            console.log("admin")
        } else {
            setIsAdmin(false);
        }
    }, [name]);


    const handleAnalysisClick = () => {
        navigate('/admin');
    };

    const handleMyRecipesClick = () => {
        navigate('/my_recipes');
    };

    const handleFavoritesClick = () => {
        navigate('/favorites');
    };

    const handleShoppingClick = () => {
        navigate('/shopping');
    };

    const handleSettingsClick = () => {
        navigate('/settings');
    };

    const handleLogOutClick = (event) => {
        console.log("LogoutBtn")
        event.preventDefault();
        localStorage.clear();
        navigate('/');
    };


    const handleGuestClick = (obj) => {
        //setPressButton(obj);
        // console.log(obj)
        setMessage(`To access the ${obj} page, please log in or register`)
        setShowModal(true);
    };

    const recipes = (event) => {
        event.preventDefault()
        navigate('/search_recipe')
    }

    const trending = (event) => {
        event.preventDefault()
        navigate('/trending')
    }

    const groceries = (event) => {
        event.preventDefault()
        if (!token && name === "Guest") {
            handleGuestClick("'Meal Prep Basket'");
            return;
        }
        navigate('/groceries')
    }
    const addRecipe = (event) => {
        event.preventDefault()
        if (!token && name === "Guest") {
            handleGuestClick(" 'Add Recipe' ");
            return;
        }
        navigate('/add_recipe')
    }

    return (
        <>
            <nav className="navbar bg-body-tertiary our-navbar">
                <div className="container-fluid d-flex justify-content-between align-items-center">
                    <a href='/search_recipe'>
                        <img className='logo-navbar' src="/images/logo_white_english.png" alt="Logo" />
                    </a>
                    <SearchBar />
                    <div className='navbar-text navigate navbar-hover' onClick={recipes}>
                        Recipes
                    </div>
                    <div className='navbar-text navigate navbar-hover' onClick={trending}>
                        Popular this Week
                    </div>
                    <div className='navbar-text navigate navbar-hover' onClick={groceries}>
                        Cook with What You Have
                    </div>


                    <button id='add-recipe-btn-navbar' type="button" className="btn btn-primary navigate navbar-text" onClick={addRecipe}>
                        Add a new recipe
                    </button>

                    <div className='name-container'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
                            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                            <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                        </svg>

                        <div className="dropdown">

                            <span className="navbar-text dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                {name}
                            </span>
                            {!token && name === "Guest" ? (
                                <ul className="dropdown-menu dropdown-position">
                                    <li><button type="button" className="dropdown-item"><LogoutBtn userName={name} /></button></li>
                                </ul>
                            ) : (
                                <ul className="dropdown-menu dropdown-position">
                                    {isAdmin &&
                                        <li onClick={handleAnalysisClick} className="dropdown-item">
                                            <AnalysisBtn />
                                        </li>}
                                    <li onClick={handleMyRecipesClick} className="dropdown-item">
                                        <MyRecipesBtn />
                                    </li>
                                    <li onClick={handleFavoritesClick} className="dropdown-item">
                                        <FavoriesBtn />
                                    </li>
                                    <li onClick={handleShoppingClick} className="dropdown-item">
                                        <ShoppingBtn />
                                    </li>
                                    <li onClick={handleSettingsClick} className='dropdown-item'>
                                        <SettingBtn />
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li onClick={handleLogOutClick} className="dropdown-item">
                                        <LogoutBtn userName={name} />
                                    </li>
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            {showModal && (
                <GuestModal
                    message={message} // Set a default component if needed
                    showModal={showModal}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    )
}

export default Navbar
