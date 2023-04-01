import './Connect.css';

function WelcomePage() {


  function redirectToRegister() {
    window.location.href = "/register";
  }

  function redirectToLogin() {
    window.location.href = "/login";
  }



  return (
    <div className="connect-body">
      <div className="welcome-connect">
          <img src="/images/logo.png" alt="Logo" className="logo-welcome" />
          <h1 className="welcome-titel">WELCOME TO MA MITBASHEL</h1>
          <br />
          <h3>!האתר הכי מוש בעולם</h3>
          <input id="btn-login-welcome" className="btn btn-primary" type="submit" value="Login" onClick={redirectToLogin} />
          <input id="btn-register-welcome" className="btn btn-primary" type="button" value="SignUp" onClick={redirectToRegister} />
      </div>
    </div>
  );
}

export default WelcomePage;
