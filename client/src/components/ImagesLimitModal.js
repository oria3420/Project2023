import React from 'react';
import { useNavigate } from 'react-router-dom'
import './GuestModal.css'

const ImagesLimitModal = ({ showModal, onClose }) => {


  return (
    <div className={`center-modal modal ${showModal ? 'show ' : ''}`} tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title orange-title">Image Upload Limit</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>You can upload a maximum of 5 images.</p>
          </div>
          <div className="modal-footer">
            <button id='modal-reg-btn' type="button" className="btn btn-primary" onClick={onClose}>
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );

};

export default ImagesLimitModal;
