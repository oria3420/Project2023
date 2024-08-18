import Navbar from '../components/Navbar';
import './App.css';
import './Settings.css'
import './AddRecipe.css'
import './Groceries.css'
import React, { useState, useEffect } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom'


const Settings = () => {
    const navigate = useNavigate()
    // eslint-disable-next-line
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [initialDistrict, setInitialDistrict] = useState('');
    const [district, setDistrict] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [formValid, setFormValid] = useState(false);
    const [showAlert, setShowAlert] = useState(true);
    const [passwordError, setPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(true);


    function validatePassword(password) {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/;
        return passwordRegex.test(password);
    }


    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setNewPassword(newPassword);

        // Check password validity and set error message accordingly
        if (!validatePassword(newPassword)) {
            setPasswordError('Password must be 6-20 characters long and contain at least one letter and one digit.');
        } else {
            setPasswordError('');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                const _user = jwt_decode(token);
                console.log(_user);
                setName(_user.name);
                setEmail(_user.email);
                setUser(_user); // Set the user state here
                if (!_user) {
                    localStorage.removeItem('token');
                    navigate.replace('/login');
                    return;
                }

                // Fetch the birth date
                try {
                    const response = await fetch(`http://localhost:1337/api/user_settings/${_user.email}`);
                    const data = await response.json();
                    setBirthDate(data.birthDate);
                    setDistrict(data.district);
                    setInitialDistrict(data.district);
                    setIsLoading(false);
                    console.log(data);
                } catch (error) {
                    console.error('Error fetching user settings:', error);
                }
            }
        };

        fetchData();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwordError) {
            return;
        }

        if (newPassword === '' && district === initialDistrict) {
            console.log('No changes detected');
            return;
        }

        const userData = {
            newPassword: newPassword,
            newDistrict: district,
        };

        try {
            const response = await fetch(`http://localhost:1337/api/update_user_details/${user.email}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const result = await response.json();

            if (response.ok) {
                console.log('User details updated successfully:', result);
                setFormValid(true);
                setShowAlert(true);
            } else {
                // Handle error (e.g., show an error message)
                console.error('Failed to update user details:', result.message);
            }
        } catch (error) {
            console.error('Error updating user details:', error);
        }
    };

    const handleFieldFocus = () => {
        setShowAlert(false); // Hide the success alert when any field gains focus
    };

    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    };


    return (
        <div>
            {name && <Navbar name={name} />}
            <div className='settings-main-container'>

                <div className='settings-head'>
                    <div className='settings-head-img-container'>
                        <img className='settings-head-img' src='../images/settings-bg.jpg' alt='settings-head' />
                    </div>
                    <div className='settings-head-title-container'>
                        <div className='settings-title'>
                            Manage Your
                            <br />
                            Details

                        </div>
                        <div className='settings-title-heart-container'>
                            <i className="bi bi-gear-fill settings-title-icon"></i>
                        </div>
                    </div>
                </div>

                <div className='settings-page-bottom'>
                    <label id='black-title-settings' className='black-title'>Settings</label>


                    {formValid && showAlert && (
                        <div className="alert alert-success" role="alert">
                            Success! Your details have been updated.
                        </div>
                    )}

                    {isLoading ? (
                        <div className="loading-message">
                            <div className="loading-spinner"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>


                            <div className='settings-inputs-line'>

                                <div className='settings-desc-field'>
                                    <label className='settings-input-title'>Email</label>
                                    <input
                                        disabled
                                        className={`settings-disable email-settings`}
                                        type="text"
                                        value={email}
                                    />
                                </div>



                                <div className='settings-desc-field'>
                                    <label className='settings-input-title'>Name</label>
                                    <input
                                        disabled
                                        className='settings-disable'
                                        type="text"
                                        value={name}
                                    />
                                </div>

                                <div className='settings-desc-field'>
                                    <label className='settings-input-title'>Birth Date</label>
                                    <input
                                        disabled
                                        className='settings-disable'
                                        type="data"
                                        value={formatDate(birthDate)}
                                    />
                                </div>


                            </div>

                            <div className='settings-inputs-line'>

                                <div className='settings-desc-field settings-district-container'>
                                    <label className='settings-input-title'>District</label>

                                    <select
                                        id="settings-input-district"
                                        className="settings-input-field input-select"
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                        onFocus={handleFieldFocus}
                                    >
                                        <option value="">Select district</option>
                                        <option value="northern">Northern District (HaTzafon)</option>
                                        <option value="haifa">Haifa District (Hefa)</option>
                                        <option value="central">Central District (HaMerkaz)</option>
                                        <option value="tel_aviv">Tel Aviv District (Gush Dan)</option>
                                        <option value="southern">Southern District (HaDarom)</option>
                                        <option value="jerusalem">Jerusalem District (Yerushalayim)</option>
                                    </select>

                                </div>

                                <div className='settings-desc-field'>
                                    <label className='settings-input-title'>Password</label>
                                    <input
                                        id='new-password'
                                        className={`settings-input-field ${passwordError ? 'pass-settings-error' : ''}`}
                                        type="password"
                                        value={newPassword || ''}
                                        onChange={handlePasswordChange}
                                        onFocus={handleFieldFocus} // Dismiss alert on focus
                                        autoComplete="new-password"
                                    />
                                    {passwordError &&
                                        <div className="error-msg-settings">
                                            {passwordError}
                                        </div>
                                    }
                                </div>

                            </div>

                            <div className='settings-save-btn-container'>
                                <button className='settings-save-btn' type="submit">Update Details</button>
                            </div>


                        </form>
                    )}




                </div>


            </div>
        </div>
    )
}

export default Settings;


