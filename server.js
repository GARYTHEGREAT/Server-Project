'use strict' 

//import express from the express node module
const express = require('express')

//import superagent to make get requests
const superagent = require('superagent')

//import cors from the cors; 
const cors = require('cors')

//require in the dotenv module and invoke the config method allowing us to add environment variables
require('dotenv').config()

//require mongoose in order to connect and interact with our database
const mongoose = require('mongoose')
//invoke the connect method and pass the url for our DB
mongoose.connect(`mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@ds255253.mlab.com:55253/code301`)
//destructing with ES6 to retrieve the Schema object off of mongoose
const { Schema } = mongoose
// same thing as about 
//const SChema = mongoose.Schema
//retreive the connectin object off of mongoose
const db = mongoose.connection
//invoke the on methon on our connection object to look for ' and send bac a response'
db.on('error', console.error.bind(console, 'connection error'))
//invoke the once method on our connection object to look for an 'open' event and cll a callback medthod that we pass to it
db.once('open', () => {
    console.log('DB connection open!')
})

//initiate an instance of express
const app = express()

//tell our express app to use cor(cross origin resource sharing)
app.use(cors())

//listen for a get request at route '/' and send back the response
app.get('/location', (request, response) => {
// const url = 'https://maps.googleapis.com/maps/api/geocode/json?${GEOCODE_API_KEY}&address=7600+Wisconsin+Ave+Bethesda+MD'
// superagent.get(url)
// .then(res => response.send({
//     latitude: res.body.results[0].geometry.location.lat,
//     longitude: res.body.results[0].geometry.location.lng
// }))
// .catch(err => response.send('<img scr="http://http.cat/404" />'))
getLocation(request.query.data)
.then(res => response.send(res))
.catch(err => response.send(handleError(err)))

})

app.get('/weather', getWeather)

//listen for a get request at any route, this is a catch all, and send back an error
app.get('*', (request, response) =>{
    response.send('<img src="http://http.cat/500" />')
})


//declare a variable called port that will use either the environment variable of port or 3000
const PORT = process.env.PORT || 3000

//tell express to listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is now running on port ${PORT}`)
  })

//   function Location(lat,long) {
//       this.latitude = lat
//       this.longitude =long
//   }

//   function Weather(weatherObj) {
//       this.summary = weatherObj.currently.summary
//       this.temp = weatherObj.currently.temperature
//       this.humidity = weatherObj.currently.humidity
//   }
function Weather(summary, temp, humidity) {
    this.summary = summary
    this.temp = temp
    this.humidity = humidity
}

//declare a variable that will hold a new Schema or bluepring for our locations collection in our DB,  similar to our constructo functions we have used in the past
 let locationSchema = new Schema({
     address: String,
     latitude: Number,
     longitude: Number,
 })

//invoke the model method than when called will pas an instance of our location schema into a locations collection in our DB 
let Location = mongoose.model('Location', locationSchema)



function getLocation(query) {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?key=${process.env.GEOCODE_API_KEY}&ADDRESS=${query}`
 //use the findOne method to look in our Location collection to see if the key/value pair exists in our collection
return Location.findOne({address: query})
.then(res =>{
    //if the collection exists, send it back to the client
    if(res) {
      return res
    } else{
        //if it does not exist, send a superagent request to the API and get the lat/long for the query location
      return superagent.get(url)
      .then(res => {
          //once a response is received instantiate a new location mocel based on our locationSchema blueprint
          let currentLocation = new Location({
            address: query,
            latitude: res.body.results[0].geometry.location.lat,
            longitude: res.body.results[0].geometry.location.lng
      })
      //save our new model to our db
      currentLocation.save()
      return res
    })
}
})
}


    function getWeather(request, response) {
        const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data}`


   return superagent.get(url)
    .then(res => {
      let resBody =res.body.currently
      return response.send(new Weather(resBody.summary, resBody.temperature, resBody.humidity))
    })
    .catch(err => response.send(handleError(err)))
}


    let handleError = err => ({error: err, message: 'Something Broke'})

