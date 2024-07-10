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
    const [currentUserId, setCurrentUserId] = useState(null);
    const [name, setName] = useState(null);
    // eslint-disable-next-line
    const [user, setUser] = useState(null);
    const [newEmail, setNewEmail] = useState('');
    const [newName, setNewName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [district, setDistrict] = useState('');
    const [formValid, setFormValid] = useState(false);
    const [showAlert, setShowAlert] = useState(true);
    const [passwordError, setPasswordError] = useState('');
    const [emailError, setEmailError] = useState('');

    function validatePassword(password) {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/;
        return passwordRegex.test(password);
    }

    function handleEmailChange(e) {
        setNewEmail(e.target.value);
        setEmailError(''); // Clear error message when typing in the email field
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwordError) {
            return;
        }

        const userData = {
            newEmail: newEmail,
            newName: newName,
            newPassword: newPassword,
            newDistrict: district,
        };

        try {
            const response = await fetch(`http://localhost:1337/api/update_user_details/${currentUserId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const result = await response.json();
            if (response.ok) {
                // Handle success (e.g., show a success message or update the UI)
                console.log('User details updated successfully:', result);
                setFormValid(true);
                setShowAlert(true);

                // Reset form fields
                setNewEmail('');
                setNewName('');
                setNewPassword('');
                setDistrict('');

            } else {
                // Handle error (e.g., show an error message)
                console.error('Failed to update user details:', result.message);
            }
        } catch (error) {
            console.error('Error updating user details:', error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            const _user = jwt_decode(token)
            setName(_user.name)
            setUser(_user)
            setCurrentUserId(_user.email)
            if (!_user) {
                localStorage.removeItem('token')
                navigate.replace('/login')
            }
        }
    }, [navigate])

    const handleFieldFocus = () => {
        setShowAlert(false); // Hide the success alert when any field gains focus
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

                    <form onSubmit={handleSubmit}>

                        <div className='settings-inputs-line'>

                            <div className='settings-desc-field'>
                                <label className='settings-input-title'>Email</label>
                                <input
                                    id='new-email'
                                    className={`settings-input-field email-settings ${emailError ? 'pass-settings-error' : ''}`}
                                    type="email"
                                    value={newEmail || ''}
                                    onChange={handleEmailChange}
                                    onFocus={handleFieldFocus} // Dismiss alert on focus
                                    required
                                />
                            </div>



                            <div className='settings-desc-field'>
                                <label className='settings-input-title'>Name</label>
                                <input
                                    id='new-name'
                                    className='settings-input-field'
                                    type="text"
                                    value={newName || ''}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onFocus={handleFieldFocus} // Dismiss alert on focus
                                    required
                                />
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
                                    required
                                />
                                {passwordError &&
                                    <div className="error-msg-settings">
                                        {passwordError}
                                    </div>
                                }
                            </div>



                        </div>

                        <div className='settings-desc-field settings-district-container'>
                            <label className='settings-input-title'>District</label>
                            <select id="settings-input-district"
                                className="settings-input-field input-select"
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                                onFocus={handleFieldFocus}>
                                <option value="">Select district</option>
                                <option value="northern">Northern District (HaTzafon)</option>
                                <option value="haifa">Haifa District (Hefa)</option>
                                <option value="central">Central District (HaMerkaz)</option>
                                <option value="tel_aviv">Tel Aviv District (Gush Dan)</option>
                                <option value="southern">Southern District (HaDarom)</option>
                                <option value="jerusalem">Jerusalem District (Yerushalayim)</option>
                            </select>
                        </div>

                        <div className='settings-save-btn-container'>
                            <button className='settings-save-btn' type="submit">Update Details</button>
                        </div>


                    </form>


                </div>


            </div>
        </div>
    )
}

export default Settings;
