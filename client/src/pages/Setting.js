import React, { useState, useEffect } from 'react';
import jwt_decode from "jwt-decode";
import './Connect.css';
import Navbar from '../components/Navbar';
import './App.css';
import { useNavigate } from 'react-router-dom';

function Setting() {
  const navigate = useNavigate();
  const [nameNew, setNameNew] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState('');
  const [name, setName] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const _user = jwt_decode(token);
      setName(_user.name);
      if (!_user) {
        localStorage.removeItem('token');
        navigate.replace('/login');
      }
    }
  }, [navigate]);

  const handleNameChange = (event) => {
    setNameNew(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleImageChange = (event) => {
    setImage(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Here, you would typically send the updated settings to the server
    // using an API call or any other method.

    // Reset the form fields after submission
    setNameNew('');
    setPassword('');
    setImage('');
  };

  return (
    <div>
      {name && <Navbar name={name} />}
      <div className="connect-body">
        <div className="form-connect">
          <form onSubmit={handleSubmit}>
            <img src="/images/logo_black_english.png" alt="Logo" className="logo-login" />
            <label className="form-title">Settings</label>
            <div>
              <label>Name:</label>
              <input type="text" value={nameNew} onChange={handleNameChange} />
            </div>
            <div>
              <label>Password:</label>
              <input type="password" value={password} onChange={handlePasswordChange} />
            </div>
            <div>
              <label>Profile Image URL:</label>
              <input type="text" value={image} onChange={handleImageChange} />
            </div>
            <button type="submit">Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Setting;
