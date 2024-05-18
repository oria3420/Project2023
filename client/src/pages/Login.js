import { useState } from 'react'
import jwt_decode from "jwt-decode";
import './Connect.css';

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('');
  const ADMIN_EMAIL = "admin@gmail.com";

  function redirectToRegister() {
    window.location.href = "/register";
  }

  async function loginUser(event) {
    event.preventDefault()

    const response = await fetch('http://localhost:1337/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const data = await response.json()

    if (data.user) {
      localStorage.setItem('token', data.user)
      const user = jwt_decode(data.user)
      if (user.email === ADMIN_EMAIL) {
        window.location.href = '/admin'
      }
      else {
        window.location.href = '/search_recipe'

      }

    }
    else {
      setErrorMessage('Please check your username and password');
    }
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
    setErrorMessage(''); // Clear error message when typing in the email field
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
    setErrorMessage(''); // Clear error message when typing in the password field
  }



  return (
    <div className="connect-body">

      <div className='image-container-connect'>
        <img src="/images/connect-image.jpg" alt="Connect" className="connect-image" />
      </div>
      
      <div className='form-container-login'>
        <div className='logo-form-login'>

          <img src="/images/logo_white_english.png" alt="Logo" className="logo-login" />
          <div className="form-login">
            <form onSubmit={loginUser} id='login-form'>

              <label className="form-title">Login</label>
              <div className='input-fields-login'>
                <input
                  id="input-login-email"
                  className={`form-control ${errorMessage ? 'error' : ''}`}
                  value={email}
                  onChange={handleEmailChange}
                  type="email"
                  placeholder='Email'
                />
                <br />
                <input
                  id="input-login-password"
                  className={`form-control ${errorMessage ? 'error' : ''}`}
                  value={password}
                  onChange={handlePasswordChange}
                  type="password"
                  placeholder='Password'
                />

              </div>
              <div className={`error-message ${errorMessage ? 'visible' : ''}`}>
                {errorMessage && <p>{errorMessage}</p>}
              </div>
              <div className='login-buttons'>
                <input id="btn-login" className="btn btn-primary" type="submit" value="Login" />
                <input id="btn-register" className="btn btn-primary" type="button" value="New Account" onClick={redirectToRegister} />
              </div>

            </form>

          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

