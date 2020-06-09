const express = require('express')
const app = express()

require('dotenv').config();
const PORT = process.env.PORT || 3001;

// remove browser protection to be able to pull data
// this throws an error for some reason
// const cors = require('cors');
// app.use(cors());

// Test run
// app.get('/', function (req, res) {
//   res.send('Hello World');
// });

// location path
app.get('/location', (req, res) => {

  try {
    // console.log(req.query.city)
    let searchQuery = req.query.city;
    let jsonData = req('data/location.json');
    let wxData = new Location(searchQuery, jsonData[0]);

    console.log(wxData);

    res.status(200).send(wxData);
  } catch (err) {
    console.log("Error", err);
    res.status(500).send("There was an error on our part.");
  }
});

// app.get('/location', (req, res) => {
//   res.send("HELLO ANDREW.");
// })


function Location(searchQuery, obj) {
  this.searchQuery = searchQuery;
  this.formatQuery = obj.formatted_query;
  this.lat = obj.latitude;
  this.long = obj.longitude;
}



app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});