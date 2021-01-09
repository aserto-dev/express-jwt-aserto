const jwtAuthz = require('./jwtAuthz');
const accessMap = require('./accessMap');
const isAuthorized = require('./isAuthorized');

module.exports = {
  jwtAuthz,
  accessMap,
  isAuthorized
};
