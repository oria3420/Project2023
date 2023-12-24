import React, { useState, useEffect } from 'react';
import './Components.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


const Carousel = ({ images }) => {
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
    console.log('Current Index:', currentIndex);
  }, [currentIndex]);

  return (
    <div className="carousel">
      <button className="carousel-btn left-btn" onClick={goToPrevSlide}><i class="bi bi-arrow-left-circle"></i></button>
      <div className="slide-container">
        {images.map((image, index) => (
          <div
            key={index}
            className={`slide ${index === currentIndex ? 'active' : ''}`}
            style={{
                backgroundImage: `url(${image})`,
                display: index === currentIndex ? 'block' : 'none',
              }}
            onClick={() => goToSlide(index)}
          ></div>
        ))}
      </div>
      <button className="carousel-btn right-btn" onClick={goToNextSlide}><i class="bi bi-arrow-right-circle"></i></button>
    </div>
  );
};

export default Carousel;
