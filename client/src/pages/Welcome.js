import './Welcome.css';
import myVideo from './bgVideo1.mp4';

function WelcomePage() {


  function redirectToRegister() {
    window.location.href = "/register";
  }

  function redirectToLogin() {
    window.location.href = "/login";
  }



  return (
    <div className="welcome-body">
      <div className="video-container">
        <video autoPlay loop muted onLoadedMetadata={(e) => e.target.play()}>
          <source src={myVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="welcome-connect">
        <img src="/images/logo_black_english.png" alt="Logo" className="logo-welcome" />
        <h1 className="welcome-titel">WELCOME TO MA MITBASHEL</h1>
        <br />
        <h3>Get started</h3>
        <input id="btn-login-welcome" className="btn btn-primary" type="submit" value="Login" onClick={redirectToLogin} />
        <input id="btn-register-welcome" className="btn btn-primary" type="button" value="SignUp" onClick={redirectToRegister} />
      </div>
    </div>

  );
}

export default WelcomePage;


// <div className="welcome-body">
//       <div className='welcome-video'>
//         <video autoPlay loop muted>
//           <source src="bgVideo1.mp4" type="video/mp4" />
//           Your browser does not support the video tag.
//         </video>
//       </div>

//     </div>