const express = require('express')
const app = express()

require('dotenv').config();
const PORT = process.env.PORT || 3001;

// Test run
app.get('/', function (req, res) {
  res.send('Hello World')
});

// remove browser protection to be able to pull data
const cors = require('cors');
app.use(cors());

// location path
app.get('/location', (req, res) => {

  let jsonData = req('data/location.json');
  let searchQuery = req.query.city;
  let wxData = new Location(searchQuery, jsonData[0])
});


function Location(searchQuery, obj) {
  this.searchQuery = searchQuery;
  this.formatQuery = obj.formatted_query;
  this.lat = obj.latitude;
  this.long = obj.longitude;
}



app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});