module.exports = entry;

function entry() {
  const initRouting   = require('../init/routing');
  const initApp       = require('../init/app');
  const initListening = require('../init/listening');

  initRouting();
  initApp();
  initListening();
}
