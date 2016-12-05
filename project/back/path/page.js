module.exports = getPagePath;

function getPagePath(fileName) {
  return `${global.ROOT_DIR}/dist/pages/${fileName}.html`;
};
