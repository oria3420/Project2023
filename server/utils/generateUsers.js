const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/user.model');  // Adjust the path if necessary
mongoose.set('strictQuery', false);

const districts = ['northern', 'haifa', 'central', 'tel_aviv', 'southern', 'jerusalem'];

const generateUsers = async (numUsers) => {

  const users = [];
  const plainPassword = "aaa123";  // Define the password to be the same for all users
  const hashedPassword = await bcrypt.hash(plainPassword, 10);  // Hash the password once

  for (let i = 0; i < numUsers; i++) {
    console.log('user ', i);
    const firstName = faker.person.firstName();  // Updated API
    const lastName = faker.person.lastName();  // Updated API
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}${i}@gmail.com`; // Ensure uniqueness by adding index
    const gender = faker.helpers.arrayElement(['male', 'female']);  // Updated API
    const birthDate = faker.date.between({ from: '1954-01-01', to: '2009-01-01' }).toISOString().slice(0, 10);  // Updated API and format
    const district = faker.helpers.arrayElement(districts);  // Updated API

    users.push({
      name,
      email,
      gender,
      birthDate,
      district,
      password: hashedPassword,  // Use the pre-hashed password
    });
  }

  return users;
};

const saveUsers = async (users) => {
  try {
    await User.insertMany(users);
    console.log('Users generated and saved successfully');
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

const main = async () => {
  mongoose.connect('mongodb+srv://shirataitel:shirataitel123@project2023.wtpkihw.mongodb.net/project2023', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  console.log('MongoDB connected successfully');

  const numUsers = 250;  // Generate 250 users
  const users = await generateUsers(numUsers);
  await saveUsers(users);

  mongoose.disconnect();
  console.log('MongoDB disconnected');
};

// Execute the main function
main().catch(err => console.error('Error in main function:', err));
