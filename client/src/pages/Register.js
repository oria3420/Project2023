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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
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

    if (data.error === 'Duplicate email') {
      setEmailError("This email already exists");
    } else {
      setEmailError("");
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    } else {
      setConfirmPasswordError("");

    }
    if (data.status === 'ok') {
      navigate('/login')
    }

  }



  function validatePassword(password) {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/;
    return passwordRegex.test(password);
  }


  function handleEmailChange(e) {
    setEmail(e.target.value);
    setEmailError(''); // Clear error message when typing in the email field
  }


  function handleConfirmChange(e) {
    setConfirmPassword(e.target.value);
    setConfirmPasswordError(''); // Clear error message when typing in the email field
    // Check if all errors are empty
  }

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Check password validity and set error message accordingly
    if (!validatePassword(newPassword)) {
      setPasswordError('Password must be 6-20 characters long and contain at least one letter and one digit.');
    } else {
      setPasswordError('');
    }
  };



  return (
    <div className="connect-body">

      <div className='image-container-connect'>
        <img src="/images/connect-image.jpg" alt="Connect" className="connect-image" />
      </div>


      <div className='form-container-login'>
        <div className='logo-form-register'>

          <div className='logo-container-registger'>
            <img src="/images/logo_white_english.png" alt="Logo" className="logo-register" />

          </div>

          <div className='form-register-wrapper'>
            <form onSubmit={registerUser} id='register-form'>

              <label id='new-account-title' className="form-title">Create a new account</label>
              <div className='input-fields-register'>

                <input
                  className={`form-control`}
                  value={name}
                  id="input-register-name"
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder='Full Name'
                  required
                />
                <br />

                <input
                  className={`form-control ${emailError ? 'error' : ''}`}
                  value={email}
                  id="input-register-email"
                  onChange={handleEmailChange}
                  type="email"
                  placeholder='Email'
                  required
                />
                {emailError ? (
                  <div className="error-msg-reg visible-reg">
                    <p>{emailError}</p>
                  </div>
                ) : (
                  <br />
                )}

                <select id="input-register-gender" className="form-select input-select" value={gender} onChange={(e) => setGender(e.target.value)} required>
                  <option value="">Select Gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
                <br />

                <input
                  className="form-control"
                  value={birthDate}
                  id="input-register-birth"
                  onChange={(e) => setBirthDate(e.target.value)}
                  type="date"
                  placeholder='Birth Date'
                  required
                />
                <br />

                <select id="input-register-district" className="form-select input-select" value={district} onChange={(e) => setDistrict(e.target.value)} required>
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
                  className={`form-control ${passwordError ? 'error' : ''}`}
                  value={password}
                  id='input-register-password'
                  onChange={handlePasswordChange}
                  type="password"
                  placeholder='Password'
                  required
                />
                {passwordError ? (
                  <div className="error-msg-reg visible-reg">
                    <p>{passwordError}</p>
                  </div>
                ) : (
                  <br />
                )}


                <input
                  className={`form-control ${confirmPasswordError ? 'error' : ''}`}
                  value={confirmPassword}
                  id='input-register-password2'
                  onChange={handleConfirmChange}
                  type="password"
                  placeholder='Confirm Password'
                  required
                />
              </div>
              {confirmPasswordError ? (
                <div className="error-msg-reg visible-reg">
                  <p>{confirmPasswordError}</p>
                </div>
              ) : (
                <br />
              )}


              <p className='link-reg'>Already have an account? <Link id='login-link' to="/login">Log in</Link></p>

              <input id="btn-register2" className="btn" type="submit" value="Register" />
            </form>

          </div>
        </div>
      </div>
    </div >
  );
}

export default RegisterPage;

// Password must be between 6 and 20 characters and include at least one letter and one number