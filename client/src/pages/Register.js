import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom';
import './Connect.css';

function RegisterPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [gender, setGender] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [district, setDistrict] = useState('')
  const [password, setPassword] = useState('')

  async function registerUser(event) {
    event.preventDefault()

    const response = await fetch('http://localhost:1337/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        gender,
        birthDate,
        district,
        password,
      }),
    })

    const data = await response.json()

    if (data.status === 'ok') {
      navigate('/login')
    }
  }

  return (
    <div className="body">
    <div className="form-connect">
      <form onSubmit={registerUser}>
        <img src="/images/logo.png" alt="Logo" className="logo-register" />
        <label className="form-title">Create a new account</label>
        <input
          className="form-control input-register"
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder='Name'
        />
        <br />
        <input
         className="form-control input-register"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder='Email'
        />
        <br />
        <input
        className="form-control input-register"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          type="text"
          placeholder='Gender'
        />
        <br />
        <input
        className="form-control input-register"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
        type="date"
        placeholder='Birth Date'
      />
      <br />
        <input
        className="form-control input-register"
        value={district}
        onChange={(e) => setDistrict(e.target.value)}
        type="text"
        placeholder='District'
      />
      <br />
        <input
        className="form-control input-register"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder='Password'
        />
        <br />
        <p>Already have an account? <Link to="/login">Log in</Link></p>
        <input id="btn-register" class="btn btn-primary" type="submit" value="Register" />
      </form>
    </div>
    </div>
  );
}

export default RegisterPage;
