import Navbar from '../components/Navbar';
import './App.css';
import './SettingsNew.css'
import './AddRecipe.css'
import './Groceries.css'
import React, { useState, useEffect } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom'


const SettingsNew = () => {
    const navigate = useNavigate()
    const [name, setName] = useState(null);
    // eslint-disable-next-line
    const [user, setUser] = useState(null);
    const [newEmail, setNewEmail] = useState('');
    const [newName, setNewName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [district, setDistrict] = useState('');


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

    const handleSubmit = (event) => {
        event.preventDefault();

        // Here, you would typically send the updated settings to the server
        // using an API call or any other method.

        // Reset the form fields after submission
        setNewName('');
        setNewPassword('');
    };

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            const _user = jwt_decode(token)
            setName(_user.name)
            setUser(_user)
            if (!_user) {
                localStorage.removeItem('token')
                navigate.replace('/login')
            }
        }
    }, [navigate])


    // useEffect(() => {
    //     if (user && user.email) {
    //         fetch(`http://localhost:1337/api/favorites/${user.email}`)
    //             .then(res => {
    //                 if (!res.ok) {
    //                     throw new Error('Network response was not ok');
    //                 }
    //                 return res.json();
    //             })
    //             .then(data => {
    //                 setFavoritesRecipes(data);
    //                 setFilteredRecipes(data);
    //                 setIsLoading(false);
    //             })
    //             .catch(error => console.error('Error fetching favorite recipes:', error));
    //     }
    // }, [user]);



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
                    <label className='black-title'>Settings</label>

                    <form onSubmit={handleSubmit}>

                        <div className='settings-inputs-line'>

                            <div className='settings-desc-field'>
                                <label className='settings-input-title'>Email</label>
                                <input
                                    id='new-email'
                                    className='settings-input-field email-settings'
                                    type="text"
                                    value={newEmail || ''}
                                    onChange={(e) => setNewEmail(e.target.value)}
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
                                    required
                                />
                            </div>

                            <div className='settings-desc-field'>
                                <label className='settings-input-title'>Password</label>
                                <input
                                    id='new-password'
                                    className='settings-input-field'
                                    type="text"
                                    value={newPassword || ''}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className='settings-desc-field settings-district-container'>
                            <label className='settings-input-title'>District</label>
                            <select id="settings-input-district" className="settings-form-select input-select" value={district} onChange={(e) => setDistrict(e.target.value)}>
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
                            <button className='settings-save-btn' type="submit">Save Changes</button>
                        </div>


                    </form>


                </div>


            </div>
        </div>
    )
}

export default SettingsNew
