const mongoose = require('mongoose')

const User = new mongoose.Schema(
    {
        name: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        gender: {type: String},
        birthDate: {type: String},
        district: {type: String},
        password: {type: String, required: true},
    },
    {collection: 'Users'}
)

const model = mongoose.model('UserData', User)

module.exports = model 