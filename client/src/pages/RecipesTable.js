import React, { useState, useEffect } from 'react'


const RecipesTable = () => {

    const [recipes, setRecipes] = useState([])

    useEffect(() => {
        fetch('http://localhost:1337/api/recipes-table')
            .then(res => res.json())
            .then(data => setRecipes(data))
            .catch(error => console.error(error))
    }, [])
    
    console.log(recipes[0])
    return (
        <table>
            <thead>
                <tr>
                    <th>RecipeId</th>
                    <th>Name</th>
                    <th>AuthorId</th>
                    <th>AuthorName</th>
                    <th>CookTime</th>
                    <th>PrepTime</th>
                    <th>TotalTime</th>
                    <th>DatePublished</th>
                    <th>Description</th>
                    <th>RecipeCategory</th>
                    <th>Calories</th>
                    <th>FatContent</th>
                    <th>SaturatedFatContent</th>
                    <th>CholesterolContent</th>
                    <th>SodiumContent</th>
                    <th>CarbohydrateContent</th>
                    <th>FiberContent</th>
                    <th>SugarContent</th>
                    <th>ProteinContent</th>
                    <th>RecipeServings</th>
                    <th>RecipeYield</th>
                    <th>RecipeInstructions</th>
                </tr>
            </thead>
            <tbody>
                {recipes.map(recipe => (
                    <tr key={recipe._id}>
                        <td>{recipe.RecipeId}</td>
                        <td>{recipe.Name}</td>
                        <td>{recipe.AuthorId}</td>
                        <td>{recipe.AuthorName}</td>
                        <td>{recipe.CookTime}</td>
                        <td>{recipe.PrepTime}</td>
                        <td>{recipe.TotalTime}</td>
                        <td>{recipe.DatePublished}</td>
                        <td>{recipe.Description}</td>
                        <td>{recipe.RecipeCategory}</td>
                        <td>{recipe.Calories}</td>
                        <td>{recipe.FatContent}</td>
                        <td>{recipe.SaturatedFatContent}</td>
                        <td>{recipe.CholesterolContent}</td>
                        <td>{recipe.SodiumContent}</td>
                        <td>{recipe.CarbohydrateContent}</td>
                        <td>{recipe.FiberContent}</td>
                        <td>{recipe.SugarContent}</td>
                        <td>{recipe.ProteinContent}</td>
                        <td>{recipe.RecipeServings}</td>
                        <td>{recipe.RecipeYield}</td>
                        <td>{recipe.RecipeInstructions}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )

}

export default RecipesTable