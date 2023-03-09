import React from 'react'

const Table = (props) => {
    const rows = props.rows

    var fieldNames = []
    if (rows.length !== 0) {
        fieldNames = Object.keys(rows[0])
    }
    fieldNames.shift()

    return (
        <table className="table table-bordered table-hover">
            <thead>
                <tr>
                    {fieldNames.map(fieldName => (
                        <th key={fieldName}>{fieldName}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map(row => (
                    <tr key={row._id}>
                        {fieldNames.map(fieldName => (
                            <td key={fieldName}>{row[fieldName]}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )

}

export default Table
