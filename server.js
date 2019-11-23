`use strict`;
require('dotenv').config();
const express = require('express')
const cors = require('cors')
const superagent = require('superagent');
const PORT = process.env.PORT || 3000;
const server = express();
server.use(cors());
server.get('/', (request, response) => {
    response.status(200).send('Hello everyone')
})
server.get('/location', locationHandler);
server.get('/weather', weatherHandler);
server.get('/events', eventHandler);

function locationHandler(req, res) {
    getLocation(req.query.data)
        .then(locationData => res.status(200).json(locationData));
}

function getLocation(city) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${process.env.GEOCODE_API_KEY}`
    console.log('url', url);
    return superagent.get(url)
        .then(data => {
            return new Location(city, data.body);
        })
}

function Location(city, data) {
    this.search_query = city;
    this.formatted_query = data.results[0].formatted_address;
    this.latitude = data.results[0].geometry.location.lat;
    this.longitude = data.results[0].geometry.location.lng;
}

function weatherHandler(req, res) {
    // Query String = ?a=b&c=d
    getWeather(req.query.data)
        .then(weatherData => res.status(200).json(weatherData));
}

function getWeather(query) {
    const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${query.latitude},${query.longitude}`;
    console.log('url', url);
    return superagent.get(url)
        .then(data => {
            let weather = data.body;
            return weather.daily.data.map((day) => {
                return new Weather(day);
            });
        });
}

function Weather(day) {
    this.forecast = day.summary;
    this.time = new Date(day.time * 1000).toDateString();
}

function eventHandler(req, res) {
    getEvent(req.query.data)
        .then(eventData => res.status(200).json(eventData));
}

function getEvent(query) {
    const url = `http://api.eventful.com/json/events/search?app_key=${process.env.EVENTFUL_API_KEY}&location=${query.formatted_query}`;
    console.log('naseem', url);
    return superagent.get(url)
        .then(data => {
            const eventData = JSON.parse(data.text);
            return eventData.events.event.map((eventday) => {
                return new Event(eventday);
            });
        });
}

function Event(day) {
    this.link = day.url;
    this.name = day.title;
    this.event_data = day.start_time;
    this.summary = day.description;
}
server.get('/foo', (request, response) => {
    throw new Error('ops');
});
server.use('*', (request, response) => {
    response.status(404).send('Not Found')
});
server.use((error, request, response) => {
    response.status(500).send(error)
});
server.listen(PORT, () => console.log(`app listening on ${PORT}`))