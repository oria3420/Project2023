const ImageModal = ({ imageUrl, closeModal }) => {
    const handleClick = (event) => {
        event.stopPropagation();
        closeModal();
    };

    return (
        <div className="image-modal" onClick={closeModal}>
            <div className="image-modal-content">
                <span className="close" onClick={closeModal}>&times;</span>
                <img className="modal-content" src={imageUrl} alt="Modal" />
            </div>
        </div>
    );
};

export default ImageModal;
