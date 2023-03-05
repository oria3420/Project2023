import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom';

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
    <div>
      <h1>Register</h1>
      <form onSubmit={registerUser}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder='Name'
        />
        <br />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder='Email'
        />
        <br />
        <input
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          type="text"
          placeholder='Gender'
        />
        <br />
        <input
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
        type="date"
        placeholder='Birth Date'
      />
      <br />
        <input
        value={district}
        onChange={(e) => setDistrict(e.target.value)}
        type="text"
        placeholder='District'
      />
      <br />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder='Password'
        />
        <br />
        <p>Already have an account? <Link to="/login">Log in</Link></p>
        <input type="submit" value="Register" />
      </form>
    </div>
  );
}

export default RegisterPage;
