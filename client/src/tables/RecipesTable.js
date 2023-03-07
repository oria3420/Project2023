import React, { useState, useEffect } from 'react'
import Table from './Table';

const RecipesTable = () => {
    const [recipes, setRecipes] = useState([])

    useEffect(() => {
        fetch('http://localhost:1337/api/table/recipes')
            .then(res => res.json())
            .then(data => setRecipes(data))
            .catch(error => console.error(error))
    }, [])
    
    return (
        <div>
            <Table rows={recipes} />
        </div>
    )

}

export default RecipesTable
