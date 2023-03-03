import { useNavigate } from 'react-router-dom'

const LogoutBtn = () => {
    const navigate = useNavigate()

    const logOut = (event) => {
        event.preventDefault()
        localStorage.clear('')
        navigate('/login')
    }

    return (
        <form onSubmit={logOut}>
            <input type="submit" value="Log out" />
        </form>
    )
}

export default LogoutBtn
