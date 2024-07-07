import React, { useState } from 'react';
import './AddToListModal.css';
import './GuestModal.css';

const AddToListModal = ({ showModal, onClose, ingredients }) => {
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  const handleCheckboxChange = (ingredient) => {
    setSelectedIngredients((prevSelected) =>
      prevSelected.includes(ingredient)
        ? prevSelected.filter((i) => i !== ingredient)
        : [...prevSelected, ingredient]
    );
  };

  const handleSubmit = async () => {
    try {
      console.log(selectedIngredients)
      const response = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: selectedIngredients }),
      });

      if (response.ok) {
        console.log('Ingredients added to shopping list');
        onClose();
      } else {
        console.error('Failed to add ingredients');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className={`center-modal modal ${showModal ? 'show' : ''}`} tabIndex="-1">
      <div className="add-to-list-modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Ingredients to Shopping List</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form className='add-list-modal-ingredients'>
              {ingredients.map((ingredient) => (
                <div key={ingredient.name} className="form-check">
                  <input
                    className="form-check-input add-to-list-check-input"
                    type="checkbox"
                    id="modal-check-box"
                    value={ingredient.name}
                    checked={selectedIngredients.includes(ingredient)}
                    onChange={() => handleCheckboxChange(ingredient)}
                  />
                  <label className="ing-check-label" htmlFor={ingredient.name}>
                    {ingredient.name}
                  </label>
                </div>
              ))}
            </form>
          </div>
          <div className="modal-footer">
            <button id="shopping-list-modal-close" type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button id="shopping-list-modal-add" type="button" className="btn btn-primary" onClick={handleSubmit}>
              Add Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToListModal;
