import './Components.css';

const Navbar = ({ name }) => {

    return (
        <nav className="navbar bg-body-tertiary our-navbar">
            <div className="container-fluid">
                <span className="navbar-text">
                   {name}
                </span>
            </div>
        </nav>
    )
}

export default Navbar
