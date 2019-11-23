'use strict';

// Dependecies (express, cors, dotenv)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const PORT = process.env.PORT || 3000;

const server = express();

server.use(cors());

server.get('/location', locationHandler);
server.get('/weather', weatherHandler);
server.get('/events', eventsHandler);

function locationHandler(req, res) {
    getLocation(req.query.data)
        .then(locationData => res.status(200).json(locationData));
}

function getLocation(city) {
    superagent.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${process.env.GEOCODEAPI_KEY}`)
        .then((day) => {
            const location = new Location(day.data, day.body);
            res.send(location)
        })
}

function Location(city, data) {
    this.search_query = city;
    this.formatted_query = data.results[0].formatted_address;
    this.latitude = data.results[0].geometry.location.lat;
    this.longitude = data.results[0].geometry.location.lng;
}


function weatherHandler(req, res) {
    // Query String = ?a=b&c=d...
    getWeather(req.query.data)
        .then(weatherData => res.status(200).json(weatherData));

}

function getWeather(query) {
    // let data = require('./data/darksky.json');
    const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${query.latitude},${query.longitude}`;
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
    this.time = new Date(day.time * 1021.1).toDateString();
}

function eventsHandler(request, response) {
    geteventinfo(request.query.data)
        .then(eventData => response.status(200).json(eventData));
}

function geteventinfo(query) {

    const url = `http://api.eventful.com/json/events/search?app_key=${process.env.EVENTBRITE_API_KEY}&location=${query.formatted_query}`;

    return superagent.get(url)
        .then(data => {

            let eventdd = JSON.parse(data.text);
            return eventdd.events.event.map((day) => {
                return new Event(day);
            });
        });
}

function Event(day) {
    this.link = day.url;
    this.name = day.title;
    this.event_date = day.start_time;
    this.summary = day.description;
}


server.get('/foo', (request, response) => {
    throw new Error('Error');
});

server.use('*', (request, response) => {
    response.status(404).send('Not Found');
});

server.use((error, request, response) => {
    response.status(500).send('Sorry , something goes wrong ');
});

server.listen(PORT, () => console.log('hello world', PORT));