import React, { useState, useEffect } from 'react'


const UsersTable = () => {
    const [users, setUsers] = useState([])

    useEffect(() => {
      fetch('http://localhost:1337/api/users-table')
        .then(res => res.json())
        .then(data => setUsers(data))
        .catch(error => console.error(error))
    }, [])
    
    return (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Gender</th>
              <th>Birth Date</th>
              <th>District</th>
            </tr>
          </thead>
          <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.gender}</td>
              <td>{user.birthDate}</td>
              <td>{user.district}</td>
            </tr>
          ))}
        </tbody>
        </table>
      )
    
}

export default UsersTable
