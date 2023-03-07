import React, { useState, useEffect } from 'react'
import Table from './Table';

const TimesCat = () => {
    const [times, setTimes] = useState([])

    useEffect(() => {
        fetch('http://localhost:1337/api/table/times')
            .then(res => res.json())
            .then(data => setTimes(data))
            .catch(error => console.error(error))
    }, [])

    return (
        <div>
            <Table rows={times} />
        </div>
    )


}

export default TimesCat
