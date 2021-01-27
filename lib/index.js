const jwtAuthz = require('./jwtAuthz');
const accessMap = require('./accessMap');
const isAllowed = require('./is');

module.exports = {
  jwtAuthz,
  accessMap,
  is
};
