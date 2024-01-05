import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import './CommentsContainer.css';
import GuestModal from './GuestModal';
import ImageModal from './ImageModal';
import FormData from 'form-data';

const CommentsContainer = ({ id, user_id, user_name, recipe }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageUploadStatus, setImageUploadStatus] = useState('');
    const [modalOpenArray, setModalOpenArray] = useState([]);


    const openModal = (index) => {
        setModalOpenArray((prev) => {
            const newArray = [...prev];
            newArray[index] = true;
            return newArray;
        });
    };

    const closeModal = (index) => {
        // Update the specific index in modalOpenArray
        setModalOpenArray((prev) => {
            const newArray = [...prev];
            newArray[index] = false;
            return newArray;
        });
    };


    useEffect(() => {
        setSelectedImage(null);
    }, []);


    const handleImageUploadReset = () => {
        setImageUploadStatus('');
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            handleImageUploadReset();
        }, 3000);

        return () => clearTimeout(timer);
    }, [imageUploadStatus]);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImageUploadStatus('Image uploaded successfully');
        }
    };

    const handleChange = (e) => {
        setNewComment(e.target.value);
        if (errorMessage.trim() !== '' && e.target.value.trim() !== '') {
            setErrorMessage('');
        }
    };

    const handleImageUploadClick = (event) => {
        if (user_id === "Guest") {
            event.preventDefault();
            handleGuestClick();
            return;
        }
    };

    const handleSubmit = async () => {
        if (user_id === "Guest") {
            handleGuestClick();
            return;
        }
        const trimmedComment = newComment.trim();
        if (trimmedComment === '') {
            setErrorMessage('Please enter a non-empty comment text.');
            return;
        }
        setErrorMessage('');
        handleCommentSubmit(trimmedComment);
    };

    const handleCommentSubmit = async (trimmedComment) => {
        try {
            const formData = new FormData();
            formData.append('comment_text', trimmedComment);
            formData.append('recipe_id', id);
            formData.append('user_id', user_id);
            formData.append('user_name', user_name);
            formData.append('comment_image', selectedImage);

            const response = await fetch('http://localhost:1337/api/recipes/new_comment', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            setComments([...comments, result.newComment]);
            setNewComment('');

        } catch (error) {
            console.error('Error submitting comment:', error);
        } finally {
            handleImageUploadReset();
            setSelectedImage(null);
        }
    };

    useEffect(() => {
        async function fetchComments() {
            try {
                const response = await fetch(`http://localhost:1337/api/recipes/${id}/comments`);
                const data = await response.json();

                setComments(data);
            } catch (error) {
                console.error(error);
            } finally {
                handleImageUploadReset();
            }
        }

        fetchComments();
    }, [id]);


    const handleGuestClick = () => {
        setShowModal(true);
    };

    function formatDateComment(dateString) {
        const isoDate = new Date(dateString);

        const monthNames = [
            'January', 'February', 'March', 'April',
            'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December'
        ];

        const day = isoDate.getDate();
        const month = monthNames[isoDate.getMonth()];
        const year = isoDate.getFullYear();
        const hours = isoDate.getHours();
        const minutes = isoDate.getMinutes();

        // Function to add the ordinal suffix to the day (e.g., 1st, 2nd, 3rd)
        const getOrdinalSuffix = (number) => {
            const suffixes = ['st', 'nd', 'rd'];
            const v = number % 100;
            return number + (suffixes[(v - 20) % 10] || suffixes[v] || 'th');
        };

        const formattedDate = `${month} ${getOrdinalSuffix(day)}, ${year} at ${hours}:${minutes.toString().padStart(2, '0')}`;

        return formattedDate;
    }


    return (
        <div className='comments-container'>
            <div className='title'>
                <i className="comments-icon bi bi-chat-left-text-fill"></i>
                Reviews & Comments
            </div>
            <div className="comment-title">Your Review</div>
            <div className='new-comment-container'>
                <div className='user-container'>
                    <i id="user-icon" className="bi bi-person-circle"></i>
                    <span id="user-name">{user_name}</span>
                </div>

                <div className='new-comment'>
                    <div className='comment-input-container'>
                        <textarea
                            className={`comment-input ${errorMessage ? 'error' : ''}`}
                            placeholder="Write your comment here"
                            value={newComment}
                            onChange={handleChange}
                        ></textarea>

                        {errorMessage && <div className="empty-comment-error-msg">{errorMessage}</div>}
                    </div>

                    <div className="button-container">

                        <div className="image-upload-container">
                            <label className='add-image-btn' onClick={handleImageUploadClick}>
                                <input type='file' accept='image/*' style={{ display: 'none' }} onChange={handleImageChange} />
                                <i className="bi bi-image"></i>
                            </label>

                            {imageUploadStatus && (
                                <div className="upload-status">
                                    <span className="upload-message">{imageUploadStatus}</span>
                                </div>
                            )}
                        </div>

                        <button className='submit-btn' onClick={handleSubmit}>
                            <i className="bi bi-send"></i>
                        </button>


                    </div>
                </div>
            </div>



            <div className="comment-title">Overall rating</div>
            <StarRating rating={recipe.AggregatedRating} reviewCount={recipe.ReviewCount} />

            <div className="comment-count">{`${comments.length} ${comments.length === 1 ? 'Comment' : 'Comments'}`}</div>
            <hr className="comment-line" />

            {comments.length > 0 ? (
                comments.slice().reverse().map((comment, index) => (
                    <div key={index} className="comment">
                        <div className='comment-top'>
                            <div className='user-container'>
                                <i id="user-icon" className="bi bi-person-circle"></i>
                                <span id="user-name">{comment.user_name}</span>
                            </div>
                            <span id="comment-date">{formatDateComment(comment.comment_date)}</span>
                        </div>
                        <div className='comment-bottom'>
                            <span id="comment-text">{comment.comment_text}</span>
                            <div className='comment-image'>
                                {comment.comment_image && comment.comment_image.fileId && (
                                    <img
                                        src={`http://localhost:1337/api/comments/images/${comment.comment_image.fileId}`}
                                        alt="Comment"
                                        onClick={() => openModal(index)}
                                    />
                                )}
                            </div>
                            {modalOpenArray[index] && (
                                <ImageModal
                                    imageUrl={`http://localhost:1337/api/comments/images/${comment.comment_image.fileId}`}
                                    closeModal={() => closeModal(index)} // Pass the index to closeModal
                                />
                            )}
                        </div>
                        <hr className="comment-line" />
                    </div>
                ))
            ) : (
                <div className='no-comments-container'>
                    <span id="no-comment-first">No comments yet. </span>
                    <br />
                    <span id="no-comment-second">Be the first to comment!</span>
                </div>
            )}
            <GuestModal
                message={'To comment or upload an image on the recipe, please log in or register'}
                showModal={showModal}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
};

export default CommentsContainer;
