import './RecommendationsModal.css';
import './GuestModal.css';
import '../pages/AddRecipe.css';
import axios from 'axios';
import React, { useState } from 'react';


const RecommendationstModal = ({ showModal, onClose }) => {
  const [userId, setUserId] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [showMoreTags, setShowMoreTags] = useState(false);
  const numOfTags = 16;

  const handleInputChange = (e) => {
    setUserId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setIsLoading(true);
    await fetchUserRecommendations();
    setIsLoading(false);
  };

  const fetchUserRecommendations = async () => {
    try {
      const response = await axios.get(`http://localhost:1337/api/admin/user-recommendations/${userId}`);

      // Clear any previous error message
      setErrMsg('');

      // Set the user profile and recommendations
      setUserProfile(response.data.activeProfile);
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error('Error fetching user recommendations:', error);

      // Check if the error is due to a non-existent user or a user without a profile
      if (error.response && error.response.status === 404) {
        const errorMessage = error.response.data.error; // This should contain the specific error message from the server

        // Set the error message based on the server's response
        setErrMsg(errorMessage);
        console.log(errorMessage);
      } else {
        setErrMsg('An unexpected error occurred. Please try again later.');
      }
    }
  };



  const getHighlightedTags = (tagsAndCategories) => {
    const userTagsAndCategories = userProfile ? userProfile.map(item => item.name) : [];
    return tagsAndCategories.map((tag, index) => (
      <span
        className='user-profile-tag'
        key={index}
        style={{
          fontWeight: userTagsAndCategories.includes(tag.name) ? 'bold' : 'normal',
          color: userTagsAndCategories.includes(tag.name) ? 'green' : 'orange',
          borderColor: userTagsAndCategories.includes(tag.name) ? 'green' : 'orange',
          marginRight: '5px'
        }}
      >
        {tag.name}
      </span>
    ));
  };

  const uniqueNames = new Set(userProfile ? userProfile.map(item => item.name) : []);
  const uniqueNamesArray = Array.from(uniqueNames); // Convert the Set to an Array
  const tagsToShow = showMoreTags ? uniqueNamesArray : uniqueNamesArray.slice(0, numOfTags); // Show either all tags or just the first 20
  

  return (
    <div className={`center-modal modal ${showModal ? 'show' : ''}`} tabIndex="-1">
      <div className="rec-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">User Recommendation Analysis</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>


              <div className='rec-group-field'>
                <input
                  id='userId'
                  className='rec-user-email'
                  type="email"
                  placeholder="Enter user email"
                  value={userId}
                  onChange={handleInputChange}
                  required
                />

                <button type="submit" className="rec-search-user">
                  <i className="bi bi-search rec-search-icon"></i>
                </button>

              </div>

            </form>

            {submitted && <hr className="rec-separator" />}

            {isLoading ? (
              <div className="loading-message">
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <>
                {errMsg ? (
                  <div className="error-msg-rec-modal">
                    <span> {errMsg}</span>
                  </div>
                ) : (
                  userProfile && recommendations.length > 0 && (
                    <div className="rec-modal-proof">
                      <div className="modal-user-profile-container">
                        <span className="rec-modal-black-title">User Tags & Categories</span>
                        <div className="user-profile-row">
                          {tagsToShow.map((name, index) => (
                            <span className="user-profile-tag" key={index}>
                              {name}
                              {console.log(uniqueNames.size)}
                            </span>
                          ))}
                        </div>
                        {uniqueNames.size > numOfTags && (
                          <button
                            className="show-more-btn"
                            onClick={() => setShowMoreTags(!showMoreTags)}
                          >
                            {showMoreTags ? 'Show Less' : 'Show More'}
                          </button>
                        )}
                      </div>

                      <hr className="rec-separator" />

                      <div className="modal-top-recs">
                        <span className="rec-modal-black-title">Top 3 Recommendations</span>

                        <div className="rec-modal-legend">
                          <div>
                            <span className='leg-orange-txt'><span className="tag-legend-orange"></span>Not in user profile</span>
                            <span className='leg-green-txt'><span className="tag-legend-green"></span>Tag in user profile</span>
                          </div>
                        </div>

                        {recommendations.map((rec, index) => (
                          <div className="modal-recipe" key={index}>
                            <span className="recipe-name-modal">
                              {index + 1}. {rec.recipe.Name} (Similarity: {rec.similarityScore.toFixed(2)})
                            </span>
                            <div className="user-profile-row">
                              {getHighlightedTags(rec.recipe.tagsAndCategories)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </>

            )}

          </div>

          <div className="modal-footer">
            <button id='shopping-list-modal-add' type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationstModal;
