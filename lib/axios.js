// an axios wrapper that returns a well-configured axios

//const axios = require('axios');

// temporarily disable SSL cert for local dev
const https = require('https');
const axios = require('axios').create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  validateStatus: function(status) {
    // throw on all errors 400 or greater, except for 500
    return status >= 400 && status != 500;
  }
});

module.exports = axios;
