import React, { useState, useEffect } from 'react';
import './Components.css';
import '../pages/AddRecipe.css'
import 'bootstrap-icons/font/bootstrap-icons.css';

const Carousel = ({ images, fromAddRecipe, onEditImage, onDeleteImage }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevSlide = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  };

  const goToNextSlide = () => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  };

  useEffect(() => {
    if (currentIndex >= images.length) {
      setCurrentIndex(images.length - 1);
    }
    console.log('Current Index:', currentIndex);
    console.log('len:', images.length);
  }, [images.length, currentIndex]);

  return (
    <div className="carousel">
      <button className="carousel-btn left-btn" onClick={goToPrevSlide}>
        <i className="bi bi-chevron-left"></i>
      </button>
      <div className="slide-container">
        {images.map((image, index) => (
          <div
            key={index}
            className={`slide ${index === currentIndex ? 'active' : ''}`}
            style={{
              display: index === currentIndex ? 'block' : 'none',
            }}
            onClick={() => goToSlide(index)}
          >
            <img
              className={fromAddRecipe ? 'recipe-image-upload' : 'recipe-image'}
              src={image}
              alt={`Slide ${index}`}
            />
            {fromAddRecipe && (
              <div className="image-actions">
                <button className="image-action-btn" onClick={() => onEditImage(index)}>
                  <i className="bi bi-pencil-fill"></i>
                </button>
                <button className="image-action-btn" onClick={() => onDeleteImage(index)}>
                  <i className="bi bi-trash3-fill"></i>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <button className="carousel-btn right-btn" onClick={goToNextSlide}>
        <i className="bi bi-chevron-right"></i>
      </button>
    </div>
  );
};

export default Carousel;
