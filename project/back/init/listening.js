const HTTP = require('../store/http');

module.exports = initListening;

function initListening() {
  const PORT = global.PORT;

  HTTP.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT}`);
  });
}
