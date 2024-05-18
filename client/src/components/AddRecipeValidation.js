import React from 'react';

const AddRecipeValidation = ({ formSubmitted, formValid }) => {
  return (
    <>
      {formSubmitted && !formValid && (
        <div className="alert alert-danger" role="alert">
          Please fill in all required fields.
        </div>
      )}
      {formSubmitted && formValid && (
        <div className="alert alert-success" role="alert">
          Success! Your recipe has been added to our collection. Thank you for sharing your delicious creation with us!
        </div>
      )}
    </>
  );
};

export default AddRecipeValidation;
