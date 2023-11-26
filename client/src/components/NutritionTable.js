import React from 'react';
import './Components.css';

const NutritionTable = ({ recipe }) => {
  const nutritionFields = [
    { key: 'Calories', label: 'Calories' },
    { key: 'FatContent', label: 'Fat' },
    { key: 'SaturatedFatContent', label: 'Saturated Fat' },
    { key: 'CholesterolContent', label: 'Cholesterol' },
    { key: 'SodiumContent', label: 'Sodium' },
    { key: 'CarbohydrateContent', label: 'Carbohydrates' },
    { key: 'FiberContent', label: 'Fiber' },
    { key: 'SugarContent', label: 'Sugar' },
    { key: 'ProteinContent', label: 'Protein' },
  ];

  return (
    <div className='nutrition-table'>
      {nutritionFields.map((field, index) => (
        <React.Fragment key={field.key}>
          <div className='nutrition-field'>
            {recipe[field.key]}
            <br />
            {field.label}
          </div>
          {index < nutritionFields.length - 1 && <div className='nutrition-divider'></div>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default NutritionTable;
