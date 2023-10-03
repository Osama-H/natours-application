const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

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

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);

});
