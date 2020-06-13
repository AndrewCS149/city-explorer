'use strict';

const express = require('express')
const app = express()
const superAgent = require('superagent');
const pg = require('pg');
require('dotenv').config();
const cors = require('cors');
app.use(cors());
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.log(err));

// constructor for weather data
function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.datetime;
}

// 500 error message
const error = (err, res) => {
  console.log('Error', err);
  res.status(500).send('There was an error on our part.');
}

// weather route
function weatherHandler(req, res, city) {

  city = req.query.search_query;

  let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${process.env.WEATHER_API_KEY}&days=8`;

  superAgent.get(url)
    .then(results => {
      let wxArr = results.body.data.map(day => new Weather(day));
      res.status(200).send(wxArr);
    }).catch(err => error(err, res));
}

module.exports.weatherHandler = weatherHandler;