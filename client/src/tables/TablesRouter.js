import { useParams } from "react-router-dom";
import React, { useState, useEffect } from 'react'
import Table from './Table';
import { TABLE_NAMES } from '../common/tablesNames';

function InvalidTableType() {
  return <div>Invalid table type</div>;
}

function TablesRouter() {
  const { type } = useParams();
  const [tableRows, setTableRows] = useState([]);


  useEffect(() => {
    if (!Object.values(TABLE_NAMES).includes(type)) {
      console.log(TABLE_NAMES.users)
      return;
    }
    fetch(`http://localhost:1337/api/table/${type}`)
      .then(res => res.json())
      .then(data => setTableRows(data))
      .catch(error => console.error(error))
  }, [type]);

  if (!Object.values(TABLE_NAMES).includes(type)) {
    return <InvalidTableType />;
  }

  return <Table rows={tableRows} />;
}


export default TablesRouter