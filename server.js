const express = require('express')
const app = express()

require('dotenv').config();
const PORT = process.env.PORT || 3001;

// remove browser protection to be able to pull data
// this throws an error for some reason
const cors = require('cors');
app.use(cors());

// Test run
// app.get('/', function (req, res) {
//   res.send('Hello World');
// });

// location path
app.get('/location', (req, res) => {

  try {
    let searchQuery = req.query.city;
    let jsonData = require('./data/location.json');
    let wxData = new Location(searchQuery, jsonData[0]);

    console.log(wxData);

    res.status(200).send(wxData);
  } catch (err) {
    console.log('Error', err);
    res.status(500).send('There was an error on our part.');
  }
});

function Location(searchQuery, obj) {
  this.search_query = searchQuery;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});