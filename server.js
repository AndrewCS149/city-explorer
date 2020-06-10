const express = require('express')
const app = express()
// NEW
const superAgent = require('superagent');
require('dotenv').config();
const PORT = process.env.PORT || 3001;

// remove browser protection to be able to pull data
const cors = require('cors');
app.use(cors());

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
  this.hikeLength = obj.length;
  this.stars = obj.stars;
  this.starVotes = obj.star_votes;
  this.summary = obj.summary;
  this.trailUrl = obj.trail_url;
  this.conditions = obj.conditions;
  this.conditionDate = obj.condition_date;
  this.conditionTime = obj.condition_time;
}

// 500 error message
const error = (err, res) => {
  console.log('Error', err);
  res.status(500).send('There was an error on our part.');
}

// Trails path
app.get('/trails', (req, res) => {
  try {
    // url https://www.hikingproject.com/data/get-trails?lat=40.0274&lon=-105.2519&maxDistance=10&key=200792370-31f0e3dc974b27040f45339ce8bc995f


  } catch (err) {
    error(err, res);
  }
})


// location path
app.get('/location', (req, res) => {
  try {
    let city = req.query.city;

    // url to the data that we want
    let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_DATA_API_KEY}&q=${city}&format=json`;

    // grab results from superagent
    superAgent.get(url)
      .then(results => {
        // console.log(results.body);
        let locationObj = new Location(city, results.body[0]);
        console.log(locationObj);
        res.status(200).send(locationObj);
      });

  } catch (err) {
    error(err, res);
  }
});

// weather path
app.get('/weather', (req, res) => {

  try {
    let city = req.query.search_query;

    let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${process.env.WEATHER_API_KEY}&days=8`;

    superAgent(url)
      .then(results => {
        let wxArr = results.body.data.map(day => new Weather(day));
        console.log(wxArr);
        res.status(200).send(wxArr);
      }).catch(err => console.log(err));

  } catch (err) {
    error(err, res);
  }
});

// catch all for unknown routes
app.get('*', (req, res) => {
  res.status(404).send('Sorry, this route does not exist.');
})

app.listen(PORT, () => {
  console.log(`listening on ${PORT}.`);
})

// make the key private

// TODO: Fix potential issue with the try catch function displaying no matter what
