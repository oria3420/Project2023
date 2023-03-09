import { useNavigate } from 'react-router-dom'
import './Components.css';

const LogoutBtn = () => {
    const navigate = useNavigate()

    const logOut = (event) => {
        event.preventDefault()
        localStorage.clear('')
        navigate('/login')
    }

    return (
        <form onSubmit={logOut}>
            <input className='logout-btn' type="submit" value="Log out" />
        </form>
    )
}

export default LogoutBtn
