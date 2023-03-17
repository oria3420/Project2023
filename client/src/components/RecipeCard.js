import './Components.css';


const RecipeCard = (props) => {
    const recipe = props.recipe
    return (
        <div>
        <ul>
            <li key={recipe.Name}>{recipe.Name}</li>
            </ul>
        </div>
    )
}

export default RecipeCard
