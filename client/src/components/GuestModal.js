import React from 'react';
import { useNavigate } from 'react-router-dom'

const GuestModal = ({ showModal, onClose,message }) => {
    const navigate = useNavigate()

    const handleLogin = () => {
        // Handle login logic
        console.log('Login logic');
        onClose(); // Close the modal after login
        navigate('/login')
      };
    
      const handleRegister = () => {
        // Handle register logic
        console.log('Register logic');
        onClose(); // Close the modal after registration
        navigate('/register')
      };
    
      return (
        <div className={`modal ${showModal ? 'show' : ''}`} tabIndex="-1" style={{ display: showModal ? 'block' : 'none' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Login or Register</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={onClose}></button>
              </div>
              <div className="modal-body">
                <p>{message}.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleLogin}>
                  Login
                </button>
                <button type="button" className="btn btn-primary" onClick={handleRegister}>
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    };

export default GuestModal;
