import React, { useState, useEffect } from 'react'


const UsersTable = () => {
    const [users, setUsers] = useState([])

    useEffect(() => {
      fetch('http://localhost:1337/api/users-table')
        .then(res => res.json())
        .then(data => setUsers(data))
        .catch(error => console.error(error))
    }, [])
    
    var fieldNames = []
    if(users[0]){
        fieldNames = Object.keys(users[0])
    }
    fieldNames.shift()
    
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
                {users.map(user => (
                    <tr key={user._id}>
                    {fieldNames.map(fieldName => (
                        <td key={fieldName}>{user[fieldName]}</td>
                    ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
    
}

export default UsersTable
