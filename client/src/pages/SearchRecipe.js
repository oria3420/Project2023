import Navbar from '../components/Navbar';
import { useLocation } from 'react-router-dom';
import './App.css';
import React, { useState, useEffect } from 'react';

const SearchRecipe = () => {
    const location = useLocation();
    const name = location.state.name;
    const [collectionsData, setCollectionsData] = useState([]);

    useEffect(() => {
        fetch('http://localhost:1337/api/home/search_recipe')
            .then(response => response.json())
            .then(data => setCollectionsData(data))
            .catch(error => console.error(error));
    }, []);

    for (const propertyName in collectionsData) {
        console.log("_____propertyName:"+ propertyName);
        console.log(collectionsData[propertyName])
        // for(const row in collectionsData[propertyName]){
        //     console.log(row);
        // }
        
      }
    console.log(collectionsData.kosher_categories);

    // collectionsData.cooking_types_categories.forEach(kitchen => {
    //     console.log(kitchen.cookingtype);
    //   });
    return (
        <div>
            {name && <Navbar name={name} />}
            <div className='filter-menu'>

            </div>

        </div>
    )
}

export default SearchRecipe
