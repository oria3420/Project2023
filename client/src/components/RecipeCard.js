import './Components.css';


const RecipeCard = (props) => {
    const recipe = props.recipe
    return (
        <div>
            <div className="card recipe-card">
                <div className="card-body">
                    <h6 className="card-title">{recipe.Name}</h6>
                    <label>Total time: {recipe.TotalTime}</label>
                </div>
            </div>
        </div>
    )
}

export default RecipeCard
