import {useState} from 'react'
import jwt_decode from "jwt-decode";
import { Link } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const ADMIN_EMAIL = "admin@gmail.com";
  

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

    if(data.user){
      localStorage.setItem('token', data.user)
      alert('Login successful ')
      const user = jwt_decode(data.user)
      if(user.email === ADMIN_EMAIL){
        window.location.href = '/admin'
      }
      else{
        window.location.href = '/home'

      }

    }
    else{
      alert('Please check your username and password')
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={loginUser}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder='Email'
        />
        <br />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder='Password'
        />
        <br />
        <p>Don't have an account? <Link to="/register">Register now</Link></p>
        <input type="submit" value="Login"/>
      </form>
    </div>
  );
}

export default LoginPage;
