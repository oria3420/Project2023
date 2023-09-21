import './Components.css';
import LogoutBtn from './LogoutBtn';
import SettingBtn from './SettingBtn';
import FavoriesBtn from './FavoritesBtn';
import ShoppingBtn from './ShoppingBtn'
import { useNavigate } from 'react-router-dom'

const Navbar = ({ name }) => {
    const navigate = useNavigate()

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
        navigate('/groceries')
    }
    return (
        <nav className="navbar bg-body-tertiary our-navbar">
            <div className="container-fluid d-flex justify-content-between align-items-center">
                <a href='/search_recipe'>
                    <img className='logo-navbar' src="/images/logo_white_english.png" alt="Logo" />
                </a>
                <div className='navbar-text nevigate' onClick={recipes}>
                Recipes
                </div>
                <div className='navbar-text nevigate' onClick={trending}>
                Trending
                </div>
                <div className='navbar-text nevigate' onClick={groceries}>
                Groceries at Home
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

                        <ul className="dropdown-menu dropdown-position">
                           <il> <FavoriesBtn/></il>
                           <il> <ShoppingBtn/></il>
                           <il> <SettingBtn/></il>
                           <il> <LogoutBtn/></il>
                        </ul>

                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
