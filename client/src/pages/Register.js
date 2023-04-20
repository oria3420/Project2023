import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom';
import './Connect.css';

function validatePassword(password) {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/;
  return passwordRegex.test(password);
}

function RegisterPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [gender, setGender] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [district, setDistrict] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');


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
        confirmPassword
      }),
    })

    const data = await response.json()
    if(name === ""){
      setNameError("Please write your name")
    }
    else{
      setNameError("")
    }

    if(email === ""){
      setEmailError("Enter your email");
    }
    else if(data.error === 'Duplicate email'){
      setEmailError("This email already exist");
    }
    else{
      setEmailError("");
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }else{
      setConfirmPasswordError("");
    }
    if (data.status === 'ok') {
      navigate('/login')
    }

  }

  return (
    <div className="connect-body">
      <div className="form-connect">
        <form onSubmit={registerUser}>
          <img src="/images/logo_black_english.png" alt="Logo" className="logo-register" />
          <label for="validationCustom01" className="form-title">Create a new account</label>
          <input
            className={`form-control input-register ${nameError ? 'error' : ''}` }
            value={name}
            id="validationCustom01"
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder='Full Name'
          />
          {nameError ? (
            <div className="error-message visible">
              <p>{nameError}</p>
            </div>
          ) : (
            <br/>
          )}
          <input
            className={`form-control input-register ${emailError ? 'error' : ''}` }
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder='Email'
          />
          {emailError ? (
            <div className="error-message visible">
              <p>{emailError}</p>
            </div>
          ) : (
            <br/>
          )}
          <select className="form-select input-register input-select" value={gender} onChange={(e) => setGender(e.target.value)} required>
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
            required
          />
          <br />
          <select className="form-select input-register input-select" value={district} onChange={(e) => setDistrict(e.target.value)} required>
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
            className={`form-control input-register ${!validatePassword(password) ? 'error' : ''}` }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder='Password'
            required
          />
          <div className={`error-message ${password && !validatePassword(password) ? 'visible' : ''}`}>
          {password && !validatePassword(password) && <p>Password must be between 6 and 20 characters and include at least one letter and one number</p>}
          </div>
          <br />
          <input
            className={`form-control input-register ${confirmPasswordError ? 'error' : ''}` }
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            placeholder='Confirm Password'
          />
          {confirmPasswordError ? (
            <div className="error-message visible">
              <p>{confirmPasswordError}</p>
            </div>
          ) : (
            <br/>
          )}
          <p>Already have an account? <Link to="/login">Log in</Link></p>
          <input id="btn-register" className="btn btn-primary" type="submit" value="Register" />
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
