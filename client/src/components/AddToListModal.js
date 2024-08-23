import React, { useState } from 'react';
import './AddToListModal.css';
import './GuestModal.css';

const AddToListModal = ({ showModal, onClose, ingredients, userId }) => {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [reqValid, setReqValid] = useState(false);

  const handleCheckboxChange = (ingredient) => {
    setSelectedIngredients((prevSelected) =>
      prevSelected.includes(ingredient)
        ? prevSelected.filter((i) => i !== ingredient)
        : [...prevSelected, ingredient]
    );
    setReqValid(false);
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    // Assuming 'selectedIngredients' is an array of selected ingredient objects
    const newItems = selectedIngredients.map((ingredient) => ({
      name: ingredient.name,
      addedDate: new Date().toISOString()
    }));
    console.log(userId)
    try {
      const response = await fetch(`http://localhost:1337/api/add_item_to_shopping_list/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: newItems })
      });

      if (response.ok) {
        setReqValid(true);
        setSelectedIngredients([])
      } else {
        // Handle errors here
        console.error('Failed to save shopping list');
      }
    } catch (error) {
      // Handle network errors
      console.error('Network error:', error);
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



            {reqValid && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                Items have been successfully added to your shopping list!
              </div>

            )}
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
