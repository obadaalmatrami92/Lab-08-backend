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
    // Query String = ?a=b&c=d
    getLocation(req.query.data)
        .then(locationData => res.status(200).json(locationData));
}

function getLocation(city) {
    // No longer get from file
    // let data = require('./data/geo.json');

    // Get it from Google Directly`
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${process.env.GEOCODE_API_KEY}`

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
    this.time = new Date(day.time * 1022).toDateString();
}

function eventsHandler(req, res) {
    getEvent(req.query.data)
        .then(eventData => res.status(200).json(eventData));

}

function getEvent(query) {
    // let data = require('./data/darksky.json');
    const url = `http://api.eventful.com/json/events/search?app_key=${process.env.API_EVENT_KEY}&location=${city}`;
    return superagent.get(url)
        .then(data => {
            let event = JSON.parse(data.text)
            return event.events.event.map((day) => {
                return new Event(day);
            });
        });
}

function Event(day) {
    "link" = day.url,
        "name" = day.title,
        "event_date" = day.start_time,
        "summary" = day.description
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