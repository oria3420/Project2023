import { useParams } from "react-router-dom";
import React, { useState, useEffect, useMemo } from 'react'
import Table from './Table';

function InvalidTableType() {
  return <div>Invalid table type</div>;
}

function TablesRouter() {
  const { type } = useParams();
  const [tableRows, setTableRows] = useState([]);

  const tableArr = useMemo(() =>
  ["users", "recipes", "times_categories", "seasons_categories", "kosher_categories", "health_categories", "cooking_types_categories", "allergies_categories"],
    []);


  useEffect(() => {
    if (!tableArr.includes(type)) {
      return;
    }
    fetch(`http://localhost:1337/api/table/${type}`)
      .then(res => res.json())
      .then(data => setTableRows(data))
      .catch(error => console.error(error))
  }, [type, tableArr]);

  if (!tableArr.includes(type)) {
    return <InvalidTableType />;
  }

  return <Table rows={tableRows} />;
}


export default TablesRouter