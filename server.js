'use strict';

const express = require('express')
const app = express()
const pg = require('pg');
require('dotenv').config();
const PORT = process.env.PORT || 3001;
const cors = require('cors');
app.use(cors());
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.log(err));

// bring in modules
const weatherMod = require('./weather.js');
const trailMod = require('./trails.js');
const movieMod = require('./movies');
const foodMod = require('./food.js');
const locationMod = require('./location.js');

// routes
app.get('/yelp', foodMod.restaurantHandler);
app.get('/movies', movieMod.movieHandler);
app.get('/location', locationMod.locationHandler);
app.get('/trails', trailMod.trailHandler);
app.get('/weather', weatherMod.weatherHandler);

// catch all for unknown routes
app.get('*', (req, res) => {
  res.status(404).send('Sorry, this route does not exist.');
});

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
    });
  });

module.exports.client = client;

// TODO: Fix potential issue with the try catch function displaying no matter what
// TODO: make city a global variable
// TODO: throw this into a helper function file// 500 error message
// const error = (err, res) => {
//   console.log('Error', err);
//   res.status(500).send('There was an error on our part.');
// }