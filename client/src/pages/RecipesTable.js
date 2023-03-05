import React, { useState, useEffect } from 'react'


const RecipesTable = () => {
    const [recipes, setRecipes] = useState([])

    useEffect(() => {
        fetch('http://localhost:1337/api/recipes-table')
            .then(res => res.json())
            .then(data => setRecipes(data))
            .catch(error => console.error(error))
    }, [])

    var fieldNames = []
    if(recipes[0]){
        fieldNames = Object.keys(recipes[0])
    }
    fieldNames.shift()
    console.log(fieldNames)
    
    return (
        <table>
            <thead>
            <tr>
            {fieldNames.map(fieldName => (
                <th key={fieldName}>{fieldName}</th>
            ))}
                </tr>
            </thead>
            <tbody>
                {recipes.map(recipe => (
                    <tr key={recipe._id}>
                    {fieldNames.map(fieldName => (
                        <td key={fieldName}>{recipe[fieldName]}</td>
                    ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )

}

export default RecipesTable
