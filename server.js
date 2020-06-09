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

// 500 error message
const error = (err, res) => {
  console.log('Error', err);
  res.status(500).send('There was an error on our part.');
}

// location path
app.get('/location', (req, res) => {

  try {
    let city = req.query.city;

    // NEW
    // url to the data that we want
    let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_DATA_API_KEY}q=${city}&format=json`

    // NEW
    // grab results from superagent
    superAgent.get(url)
      .then(results => {
        console.log(results.body);
        let obj = new Location(city, results.body[0]);

        res.status(200).send(obj);
      });

    let jsonData = require('./data/location.json');
    let locationData = new Location(city, jsonData[0]);

    res.status(200).send(locationData);

  } catch (err) {
    error(err, res);
  }
});

// weather path
app.get('/weather', (req, res) => {

  try {
    // NEW
    let city = req.query.formatted_query;

    // NEW
    let url = `http://api.weatherbit.io/.v2.0/current?city=${city}&key=${process.env.WEATHER_API_KEY}`;

    // NEW
    superAgent(url)
      .then(results => {
        console.log(results.body);
      }).catch(err => console.log(err));

    let wxArr = [];
    let wxData = require('./data/weather.json');

    wxData.data.forEach(day => {
      wxArr.push(new Weather(day));
    });

    res.status(200).send(wxArr);

  } catch (err) {
    error(err, res);
  }
});

// catch all for unknown routes
app.get('*', (req, res) => {
  res.status(404).send('Sorry, this route does not exist.');
})

// listen on port 3000
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});


// URL for simple rest client
// GET https://us1.locationiq.com/v1/search.php?key=YOUR_PRIVATE_TOKEN&q=SEARCH_STRING&format=json

// make the key private

// TODO: delete 'NEW' comments