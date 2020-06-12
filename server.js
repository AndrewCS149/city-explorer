'use strict';

const express = require('express')
const app = express()
const superAgent = require('superagent');
const pg = require('pg');
require('dotenv').config();
const PORT = process.env.PORT || 3001;

// remove browser protection to be able to pull data
const cors = require('cors');
app.use(cors());

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.log(err));

// constructor function for Location data
function Location(searchQuery, obj) {
  this.search_query = searchQuery;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

// constructor function for weather data
function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.datetime;
}

function Hike(obj) {
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = obj.conditions;
  this.condition_date = new Date(obj.conditionDate).toLocaleDateString();
  this.condition_time = new Date(obj.conditionDate).toLocaleTimeString();
}

// 500 error message
const error = (err, res) => {
  console.log('Error', err);
  res.status(500).send('There was an error on our part.');
}

// Trails path
app.get('/trails', (req, res) => {

  let lat = req.query.latitude;
  let long = req.query.longitude;

  let url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${long}&maxDistance=10&key=${process.env.TRAIL_API_KEY}`

  superAgent.get(url)
    .then(results => {
      let hikeObj = results.body.trails.map(hike => new Hike(hike));

      res.status(200).send(hikeObj);
    }).catch(err => error(err, res));
});

// location path
app.get('/location', (req, res) => {

  let city = req.query.city;

  // url to the data that we want
  let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_DATA_API_KEY}&q=${city}&format=json`;

  // check city_explorer DB data
  let citiesQuery = 'SELECT * FROM locations WHERE search_query LIKE ($1);';

  let safeVal = [city];
  client.query(citiesQuery, safeVal)
    .then(results => {

      // if the results already exist in DB, then send that data
      if (results.rowCount) {
        res.status(200).send(results.rows[0]);

        // if results dont exist in the DB, grab API data
      } else {
        let locationObj;
        let format;
        let lat;
        let long;
        superAgent.get(url)
          .then(results => {
            locationObj = new Location(city, results.body[0]);
            format = locationObj.formatted_query;
            lat = locationObj.latitude;
            long = locationObj.longitude;
            res.status(200).send(locationObj);

            let safeValues = [city, format, lat, long];
            let sqlQuery = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';

            client.query(sqlQuery, safeValues)
              .then()
              .catch(err => error(err, res));
          }).catch(err => error(err, res));
      }
    }).catch(err => error(err, res));
});

// weather path
app.get('/weather', (req, res) => {

  let city = req.query.search_query;

  let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${process.env.WEATHER_API_KEY}&days=8`;

  superAgent.get(url)
    .then(results => {
      let wxArr = results.body.data.map(day => new Weather(day));
      res.status(200).send(wxArr);
    }).catch(err => error(err, res));
});

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

// app.listen(PORT, () => {
//   console.log(`listening on ${PORT}.`);
// });

// TODO: Fix potential issue with the try catch function displaying no matter what