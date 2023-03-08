import React from 'react';
import { useParams } from "react-router-dom";

const RecipePage = () => {
    const { type } = useParams();
    
    return (
        <div>
            <h1>Recipe</h1>
        </div>
    )
}

export default RecipePage
