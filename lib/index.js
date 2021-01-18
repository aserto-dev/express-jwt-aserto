const jwtAuthz = require('./jwtAuthz');
const accessMap = require('./accessMap');
const isAllowed = require('./isAllowed');

module.exports = {
  jwtAuthz,
  accessMap,
  isAllowed
};
