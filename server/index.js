const globals = require('../client/src/common/tablesNames');
const TABLE_NAMES = globals.TABLE_NAMES;
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/user.model')
const Collection = require('./models/collection.model');
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


app.get('/api/admin', (req, res) => {
    mongoose.connection.db.listCollections().toArray((err, collections) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
        } else {
            const collectionNames = collections.map(collection => collection.name);
            res.status(200).json(collectionNames);
        }
    });
});


app.post('/api/register', async (req, res) => {
    try {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(409).json({ error: 'Duplicate email' });
      }
      if(req.body.confirmPassword !==req.body.password){
        return res.status(409).json({ error: 'Passwords dont match' });
      }
      const newPassword = await bcrypt.hash(req.body.password, 10);
      await User.create({
        name: req.body.name,
        email: req.body.email,
        gender: req.body.gender,
        birthDate: req.body.birthDate,
        district: req.body.district,
        password: newPassword,
      });
  
      res.json({ status: 'ok' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
      }
});

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


// tables
const getCollection = (collectionName) => async (req, res) => {
    try {
        const Model = Collection.getModel(collectionName);
        const data = await Model.find({});
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

const tableRoutes = Object.values(TABLE_NAMES).map(tableName => {
    return {
        path: `/api/table/${tableName}`,
        handler: getCollection(tableName)
    };
});

tableRoutes.forEach(route => {
    app.get(route.path, route.handler);
});


// recipe
app.get('/api/recipes/:id', (req, res) => {
  const Recipe = Collection.getModel(TABLE_NAMES.RECIPES);
  const id = parseInt(req.params.id);
  Recipe.findOne({ RecipeId: id }, (err, recipe) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else if (!recipe) {
      res.sendStatus(404);
    } else {
      res.send(recipe);
    }
  });
});

  // filters
  app.get('/api/home/search_recipe', async (req, res) => {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const filteredCollections = collections.filter(collection => /^(?!recipe).*categories$/.test(collection.name));
      const result = {};
      for (const collection of filteredCollections) {
        const documents = await mongoose.connection.db.collection(collection.name).find().toArray();
        const values = documents.map(doc => Object.values(doc)[2]);
        result[collection.name] = values;
      }
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/api/home/popular_recipes', async (req, res) => {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const filteredCollections = collections.filter(collection => /^(?!recipe).*categories$/.test(collection.name));
      const result = {};
      for (const collection of filteredCollections) {
        const documents = await mongoose.connection.db.collection(collection.name).find().toArray();
        const values = documents.map(doc => Object.values(doc)[2]);
        result[collection.name] = values;
      }
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/api/recipes/images/:recipeId', async (req, res) => {
    const Image = Collection.getModel(TABLE_NAMES.RECIPES_IMAGES);
    const id = parseInt(req.params.recipeId);
    Image.findOne({ recipe_ID: id }, (err, recipe) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error fetching image');
      } else if (!recipe) {
        res.status(404).send('Image not found');
      } else {
        res.send(recipe.image_link);
      }
    });
  });

  app.listen(1337, () => {
    console.log('Server saterted on 1337')
})