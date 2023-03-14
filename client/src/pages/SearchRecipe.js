import Navbar from '../components/Navbar';
import { useLocation } from 'react-router-dom';
import './App.css';

const SearchRecipe = () => {
    const location = useLocation();
    const name = location.state.name;
    
    
    return (
        <div>
            {name && <Navbar name={name} />}
            <div className='filter-menu'>

            </div>

            </div>
            )
}

            export default SearchRecipe
