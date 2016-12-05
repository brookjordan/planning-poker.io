const APP      = require('../store/app');
const http     = require('http');

module.exports = http.Server(APP);
