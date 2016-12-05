const express  = require('express');
const APP      = require('../store/app');
const pagePath = require('../path/page');

module.exports = initRouting;

function initRouting() {
  APP.get('/', (req, res) => {
    res.sendFile(pagePath('index'));
  });

  APP.use('/js',  express.static('dist/scripts'))
  APP.use('/css', express.static('dist/styles'))
}
