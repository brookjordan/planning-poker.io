const entry    = require('./back/entry/entry.js');

global.PORT     = process.env.port || 3000;
global.ROOT_DIR = __dirname;

entry();
