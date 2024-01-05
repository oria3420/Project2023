import './Components.css';
import LogoutBtn from './LogoutBtn';
import SettingBtn from './SettingBtn';
import FavoriesBtn from './FavoritesBtn';
import ShoppingBtn from './ShoppingBtn'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react';
import SearchBar from './SearchBar';
import MyRecipesBtn from './MyRecipesBtn';
import GuestModal from './GuestModal';


const Navbar = ({ name }) => {
    const navigate = useNavigate()
    const [showModal, setShowModal] = useState(false);
    //const [_pressButton, setPressButton] = useState(""); // eslint-disable-line no-unused-vars
    const [message, setMessage] = useState("");
    const token = localStorage.getItem('token');

    const handleGuestClick = (obj) => {
        //setPressButton(obj);
        // console.log(obj)
        setMessage(`To access the 'Add Recipe' page, please log in or register`)
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
            handleGuestClick('groceries');
            return;
          }
        navigate('/groceries')
    }
    const addRecipe = (event) => {
        event.preventDefault()
        if (!token && name === "Guest") {
            handleGuestClick("add recipe");
            return;
          }
        navigate('/add_recipe')
    }
    // console.log("message "+pressButton)
    return (
        <>
        <nav className="navbar bg-body-tertiary our-navbar">
            <div className="container-fluid d-flex justify-content-between align-items-center">
                <a href='/search_recipe'>
                    <img className='logo-navbar' src="/images/logo_white_english.png" alt="Logo" />
                </a>
                <div className='navbar-text nevigate' onClick={recipes}>
                    Recipes
                </div>
                <div className='navbar-text nevigate' onClick={trending}>
                    Popular this Week
                </div>
                <div className='navbar-text nevigate' onClick={groceries}>
                    Groceries at Home
                </div>
                <SearchBar />
                <div className='navbar-text nevigate' onClick={addRecipe}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
                    </svg>
                </div>
                <div className='name-container'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                        <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                    </svg>

                    <div className="dropdown">

                        <span className="navbar-text dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            {name}
                        </span>
                        {!token && name === "Guest"? (
                            <ul className="dropdown-menu dropdown-position">
                            <li><button type="button" className="dropdown-item"><LogoutBtn userName={name} /></button></li>
                            </ul>
                            ):(
                            <ul className="dropdown-menu dropdown-position">
                            <li><button type="button" className="dropdown-item"><MyRecipesBtn /></button></li>
                            <li><button type="button" className="dropdown-item"><FavoriesBtn /></button></li>
                            <li><button type="button" className="dropdown-item"><ShoppingBtn /></button></li>
                            <li><button type="button" className="dropdown-item"><SettingBtn /></button></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><button type="button" className="dropdown-item"><LogoutBtn userName={name} /></button></li>
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
