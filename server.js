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

// routes
app.get('/yelp', restaurantHandler);
app.get('/movies', movieHandler);
app.get('/location', locationHandler);
app.get('/trails', trailHandler);
app.get('/weather', weatherHandler);

////////////////////CONSTRUCTORS//////////////////////////////////

// constructor for Location data
function Location(searchQuery, obj) {
  this.search_query = searchQuery;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

// constructor for weather data
function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.datetime;
}

// constructor for trails / hikes
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

// constructor for movies
function Movie(obj) {
  this.title = obj.title;
  this.overview = obj.overview;
  this.average_votes = obj.vote_average;
  this.total_votes = obj.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500${obj.poster_path}`;
  this.popularity = obj.popularity;
  this.released_on = obj.release_date;
}

// constructor for yelp
function Yelp(obj) {
  this.name = obj.name;
  this.image_url = obj.image_url;
  this.price = obj.price;
  this.rating = obj.rating;
  this.url = obj.url;
}

//////////////////////HELPER FUNCTIONS//////////////////////////////////////

// 500 error message
const error = (err, res) => {
  console.log('Error', err);
  res.status(500).send('There was an error on our part.');
}

////////////////////////////ROUTES//////////////////////////////////////////

function restaurantHandler(req, res) {

  let city = req.query.search_query;
  let url = `https://api.yelp.com/v3/businesses/search`;

  let queryParams = {
    location: city,
    term: 'restaurants',
    limit: 5
  }

  // pull yelp api data
  superAgent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .query(queryParams)
    .then(data => {

      let yelpArr = data.body.businesses;
      let yelp = yelpArr.map(val => new Yelp(val));
      res.status(200).send(yelp);

    }).catch(err => error(err, res));
}

// Movies route
function movieHandler(req, res) {

  let city = req.query.search_query;
  let url = `https://api.themoviedb.org/3/search/movie`;

  let queryParams = {
    api_key: process.env.MOVIE_API_KEY,
    query: city,
    limit: 20
  }

  // pull movie api data
  superAgent.get(url)
    .query(queryParams)
    .then(data => {

      let moviesArr = data.body.results;
      let movies = moviesArr.map(val => new Movie(val));
      res.status(200).send(movies);

    }).catch(err => error(err, res));
}

// Trails route
function trailHandler(req, res) {

  let lat = req.query.latitude;
  let long = req.query.longitude;
  let url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${long}&maxDistance=10&key=${process.env.TRAIL_API_KEY}`;

  superAgent.get(url)
    .then(results => {

      let hikeObj = results.body.trails.map(hike => new Hike(hike));
      res.status(200).send(hikeObj);

    }).catch(err => error(err, res));
}

// location route
function locationHandler(req, res) {

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
        superAgent.get(url)
          .then(results => {
            let locationObj = new Location(city, results.body[0]);
            let format = locationObj.formatted_query;
            let lat = locationObj.latitude;
            let long = locationObj.longitude;
            res.status(200).send(locationObj);

            let safeValues = [city, format, lat, long];
            let sqlQuery = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';

            client.query(sqlQuery, safeValues)
              .then()
              .catch(err => error(err, res));
          }).catch(err => error(err, res));
      }
    }).catch(err => error(err, res));
}

// weather route
function weatherHandler(req, res) {

  let city = req.query.search_query;

  let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${process.env.WEATHER_API_KEY}&days=8`;

  superAgent.get(url)
    .then(results => {
      let wxArr = results.body.data.map(day => new Weather(day));
      res.status(200).send(wxArr);
    }).catch(err => error(err, res));
}

/////////////////ROUTE LISTENERS////////////////////////////////////

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

// TODO: Fix potential issue with the try catch function displaying no matter what
// TODO: make city a global variable