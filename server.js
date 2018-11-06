'use strict'

//import express from the express node module
const express = require('express')

//import superagent to make get requests
const superagent = require('superagent')

//import cors from the cors; 
const cors = require('cors')

//require in the dotenv module and invoke the config method allowing us to add environment variables
require('dotenv').config()

//initiate an instance of express
const app = express()

app.use(cors())

//listen for a get request at rout '/' and send backt the response
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

//listen for a get request at any rout, this is a catch all, and send back an error
app.get('*', (request, response) =>{
    response.send('<img src="http://http.cat/500" />')
})


//declare a variable called port that will use either the environment variable of port or 3000
const PORT = process.env.PORT || 3000

//tell express to listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is now running on port ${PORT}`)
  })

  function Location(lat,long) {
      this.latitude = lat
      this.longitude =long
  }

  function Weather(weatherObj) {
      this.summary = weatherObj.currently.summary
      this.temp = weatherObj.currently.temperature
      this.humidity = weatherObj.currently.humidity
  }

  function getLocation(query) {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?key=${process.env.GEOCODE_API_KEY}&ADDRESS=${query}`
 
      return superagent.get(url)
      .then(res => {
          return new Lococation(res.body.results[0].geometry.location.lat,res.body.results[0].geometry.location.lng)
      })
    }

    function getWeather(request, response){
        const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data}`
    }

    superagent.get(url)
    .then(res => response.send(new Weather(res.body)))
    .catch(err => response.send(handleError(err))) 

    let handleError = err => ({error: err, message: 'Something Broke'})
