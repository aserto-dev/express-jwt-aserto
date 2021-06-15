const getAxios = require('./axios');
const log = require('./log');

module.exports = async (url, headers, body, options) => {
  // get a well-configured axios instance based on the options
  const axios = getAxios(options);

  log(`POST ${url}`, 'DETAIL');
  log(JSON.stringify(headers), 'DETAIL');
  log(JSON.stringify(body), 'DETAIL');
  // make the request to the authorizer
  const response = await axios.post(url, body, {
    headers: headers
  });
  log(JSON.stringify(response.data), 'DETAIL');
  return response;
};
