import { useState } from 'react'
import jwt_decode from "jwt-decode";
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
      <div className="form-connect">
          <img src="/images/logo.png" alt="Logo" className="logo-login" />
          <h1 className="form-title">WELCOME TO MA MEATBASHEL</h1>
          <br />
          <input id="btn-login" className="btn btn-primary" type="submit" value="Login" onClick={redirectToLogin} />
          <input id="btn-register" className="btn btn-primary" type="button" value="SignUp" onClick={redirectToRegister} />
      </div>
    </div>
  );
}

export default WelcomePage;
