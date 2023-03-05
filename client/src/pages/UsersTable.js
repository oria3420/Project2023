import React, { useState, useEffect } from 'react'
import Table from '../components/Table';

const UsersTable = () => {
    const [users, setUsers] = useState([])

    useEffect(() => {
        fetch('http://localhost:1337/api/table-users')
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(error => console.error(error))
    }, [])

    return (
        <div>
            <Table rows={users} />
        </div>
    )


}

export default UsersTable
