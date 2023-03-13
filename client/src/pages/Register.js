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
    <div className="connect-body">
      <div className="form-connect">
        <form onSubmit={registerUser}>
          <img src="/images/logo.png" alt="Logo" className="logo-register" />
          <label className="form-title">Create a new account</label>
          <input
            className="form-control input-register"
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder='Full Name'
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
          <select className="form-select input-register input-select" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select Gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
          <br />
          <input
            className="form-control input-register"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            type="date"
            placeholder='Birth Date'
          />
          <br />
          <select className="form-select input-register input-select" value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="">Select district</option>
            <option value="northern">Northern District (HaTzafon)</option>
            <option value="haifa">Haifa District (Hefa)</option>
            <option value="central">Central District (HaMerkaz)</option>
            <option value="tel_aviv">Tel Aviv District (Gush Dan)</option>
            <option value="southern">Southern District (HaDarom)</option>
            <option value="jerusalem">Jerusalem District (Yerushalayim)</option>
          </select>
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
          <input id="btn-register" className="btn btn-primary" type="submit" value="Register" />
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
