const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' }); // object to where the configuration file is located

// console.log(process.env);  // log all the environment variable to the console

const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    // this is the connection object
    console.log(`DataBase Connection successful !`);
  })
  .catch((err) => {
    console.log("There's an error in the connection of data");
  });

// Read Json File
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));



// Import Data into dataBase
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users,{validateBeforeSave : false});
    await Review.create(reviews);


    
    console.log('Data successfully loaded ! ');
  } catch (err) {
    console.log(err);
  }
};

// DELETE ALL DATA FROM Collection

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted !');
  } catch (err) {
    console.log(err);
  }
};


// deleteData();
importData()