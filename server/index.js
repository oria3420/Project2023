const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/user.model')
const Recipes = require('./models/recipe.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')


app.use(cors())
app.use(express.json())
try {
    mongoose.connect('mongodb+srv://shirataitel:shirataitel123@project2023.wtpkihw.mongodb.net/project2023', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    console.log('connected to db successfuly')
}
catch (error) {
    console.log(error)
    console.log('connection failed')
}

app.get('/api/users-table', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
})

app.get('/api/recipes-table', async (req, res) => {
    try {
        const recipes = await Recipes.find({});
        res.status(200).json(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
})

app.post('/api/register', async (req, res) => {
    console.log(req.body)
    try {
        const newPassword = await bcrypt.hash(req.body.password, 10)
        await User.create({
            name: req.body.name,
            email: req.body.email,
            gender: req.body.gender,
            birthDate: req.body.birthDate,
            district: req.body.district,
            password: newPassword,
        })
        res.json({ status: 'ok' })
    } catch (err) {
        console.log(err)
        res.json({ status: 'error', error: 'Duplicate email' })
    }
})

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
    })

    if (!user) {
        return res.json({ status: 'error', error: 'Invalid login' })
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password)

    if (isPasswordValid) {
        const token = jwt.sign(
            {
                name: user.name,
                email: user.email,
            }, 'secret123')
        return res.json({ status: 'ok', user: token })
    }
    else {
        return res.json({ status: 'error', user: false })
    }
})

// app.get('/api/home', async (req, res) => {
//     const token = req.headers['x-access-token']

//     try {
//         const decoded = jwt.verify(token, 'secret123')
//         const email = decoded.email
//         const user = await User.findOne({ email: email })
//         console.log(user)
//         return res.json({ status: 'ok', name: user.name })
//     } catch (error) {
//         console.log(error)
//         res.json({ status: 'error', error: 'invalid user' })
//     }
// })

app.listen(1337, () => {
    console.log('Server saterted on 1337')
})