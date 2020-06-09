const express = require('express')
const app = express()

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
  this.datetime = obj.datetime;
}

// location path
app.get('/location', (req, res) => {

  try {
    let searchQuery = req.query.city;
    let jsonData = require('./data/location.json');
    let locationData = new Location(searchQuery, jsonData[0]);

    res.status(200).send(locationData);
  } catch (err) {
    console.log('Error', err);
    res.status(500).send('There was an error on our part.');
  }
});

// weather path
app.get('/weather', (req, res) => {

  try {
    let searchQuery = req.query.weather;
    let jsonData = require('./data/weather.json');
    //   let wxData = new
  } catch (err) {
    console.log('Error', err);
    res.status(500).send('There was an error on our part.');
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