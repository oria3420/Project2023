import { useState } from 'react'
import jwt_decode from "jwt-decode";
import './Connect.css';

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      alert('Login successful ')
      const user = jwt_decode(data.user)
      if (user.email === ADMIN_EMAIL) {
        window.location.href = '/admin'
      }
      else {
        window.location.href = '/home'

      }

    }
    else {
      alert('Please check your username and password')
    }
  }



  return (
    <div className="body">
      <div className="form-connect">

        <form onSubmit={loginUser}>
          <img src="/images/logo.png" alt="Logo" className="logo-login" />
          <label className="form-title">Login</label>
          <input
            className="form-control input-login"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder='Email'
          />
          <br />
          <input
            className="form-control input-login"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder='Password'
          />

          <input id="btn-login" className="btn btn-primary" type="submit" value="Login" />
          <input id="btn-register" className="btn btn-primary" type="button" value="New Account" onClick={redirectToRegister} />
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
