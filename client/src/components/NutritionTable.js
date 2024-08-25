import React, { useEffect } from 'react';
import './Components.css';

const NutritionTable = ({ recipe }) => {
    const nutritionFields = [
        { key: 'Calories', label: 'Calories', unit: 'kcal' },
        { key: 'FatContent', label: 'Fat', unit: 'g' },
        { key: 'SaturatedFatContent', label: 'Saturated Fat', unit: 'g' },
        { key: 'CholesterolContent', label: 'Cholesterol', unit: 'mg' },
        { key: 'SodiumContent', label: 'Sodium', unit: 'mg' },
        { key: 'CarbohydrateContent', label: 'Carbohydrates', unit: 'g' },
        { key: 'FiberContent', label: 'Fiber', unit: 'g' },
        { key: 'SugarContent', label: 'Sugar', unit: 'g' },
        { key: 'ProteinContent', label: 'Protein', unit: 'g' },
    ];

    useEffect(() => {
        // Find the maximum width among all .nutrition-field elements
        const nutritionFieldsElements = document.querySelectorAll('.nutrition-field');
        let maxWidth = 0;

        nutritionFieldsElements.forEach((field) => {
            maxWidth = Math.max(maxWidth, field.clientWidth);
        });

        // Set the width for all .nutrition-field elements
        nutritionFieldsElements.forEach((field) => {
            field.style.width = maxWidth + 'px';
        });
    }, []); // The empty dependency array ensures that this effect runs only once after the initial render

    return (
        <div className='nutrition-container'>
            <span className='nutrition-title'>
                <i className="nutrition-icon bi bi-clipboard-data-fill"></i>
                Nutrition
            </span>

            <div className='nutrition-table'>
                {nutritionFields.map((field, index) => (
                    <React.Fragment key={field.key}>
                        <div className='nutrition-field'>
                            <span className='field-value'>
                                <span className='nutrition-key'>{recipe[field.key]}</span>
                                <span>{field.unit}</span>
                            </span>

                            <br />
                            <span className='field-label'>{field.label}</span>
                        </div>
                        {index < nutritionFields.length - 1 && <div className='nutrition-divider'></div>}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default NutritionTable;
