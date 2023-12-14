import React from 'react';

const ImageModal = ({ imageUrl, closeModal }) => {
    const handleClick = (event) => {
        event.stopPropagation();
        closeModal();
    };

    return (
        <div className="image-modal">
            <div className="image-modal-content">
                <span className="close" onClick={handleClick}>&times;</span>
                <img className="modal-content" src={imageUrl} alt="Modal" />
            </div>
        </div>
    );
};

export default ImageModal;
