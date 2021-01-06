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
    if (status == 500) {
      return true;
    }
    return status >= 200 && status < 300;
  }
});

module.exports = axios;
