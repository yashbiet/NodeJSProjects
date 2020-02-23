const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

//console.log(process.env);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log(' DB Connection Successful ⚙️'));

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

//IMPORT DATA in DB
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data Sucessfully loaded');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// DELTE DATA from DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data Deleted Sucessfully ');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
