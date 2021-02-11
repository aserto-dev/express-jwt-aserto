// an axios wrapper that returns a well-configured axios
// import and use like this:
//   const createAxios = require('axios');
//   const axios = createAxios(options);

const axios = require('axios');
const https = require('https');

module.exports = options => {
  const { disableTlsValidation, authorizerCert } = options;
  const httpsAgent = disableTlsValidation
    ? new https.Agent({
        rejectUnauthorized: false
      })
    : authorizerCert
      ? new https.Agent({
          ca: authorizerCert
        })
      : new https.Agent();

  return axios.create({
    httpsAgent,
    validateStatus: function(status) {
      // throw on all errors 400 or greater, except for 500
      if (status == 500) {
        return true;
      }
      return status >= 200 && status < 300;
    }
  });
};
