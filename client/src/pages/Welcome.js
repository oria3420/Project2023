import './Welcome.css';
import bgVideo from './bgVideo1.mp4';

function WelcomePage() {

  function redirectToRegister() {
    window.location.href = "/register";
  }

  function redirectToLogin() {
    window.location.href = "/login";
  }

  function redirectToGuest() {
    localStorage.setItem('guestUser', 'true');
    window.location.href = "/search_recipe";
  }
  return (
    <div className="welcome-body">

      <div className="video-container">
        <video autoPlay loop muted onLoadedMetadata={(e) => e.target.play()}>
          <source src={bgVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="welcome-connect">

        <img src="/images/logo_white_english.png" alt="Logo" className="logo-welcome" />

        <div className='welcome-connect-body'>
          <h1 className="welcome-title-up">Cook, Create, Enjoy:</h1>
          <h1 className="welcome-title-bottom">Welcome to
            <br></br>
            Ma Mitbashel</h1>
          <h3 className='sub-title'>Get started</h3>
          <div className='buttons-container'>
            <input id="btn-login-welcome" className="btn btn-primary" type="submit" value="Login" onClick={redirectToLogin} />
            <input id="btn-register-welcome" className="btn btn-primary" type="button" value="Register" onClick={redirectToRegister} />
          </div>

        </div>

        <div className='guest-welcome'>
          <input
            id="guest-button-welcome"
            className="btn"
            type="submit"
            value="Continue as a Guest"
            onClick={redirectToGuest}
          />
          <i class="guest-arrow bi bi-arrow-right"></i>
        </div>

      </div>
    </div>
  );
}

export default WelcomePage;

