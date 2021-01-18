const axios = require('./axios');
const processOptions = require('./processOptions');

module.exports = async (req, optionsParam, policy, resource) => {
  try {
    const options = processOptions(optionsParam, req);
    if (!options) {
      return false;
    }
    if (typeof options !== 'object') {
      return false;
    }
    const {
      authorizerUrl,
      useAuthorizationHeader,
      identity,
      subject
    } = options;

    const url = `${authorizerUrl}/is/allowed`;
    const headers = {
      ContentType: 'application/json'
    };
    const body = {
      policy
    };
    if (resource) {
      body.resource = resource;
    }

    // if the useAuthorizationHeader flag is true, set the Authorization header
    if (useAuthorizationHeader) {
      headers.Authorization = req.headers.authorization;
    } else {
      // otherwise, if the identity header was set, use this in the request body
      if (identity) {
        body.identity = identity;
      } else {
        // use the subject as the identity in the request body
        body.identity = subject;
      }
    }

    // make the request to the authorizer
    const response = await axios.post(url, body, {
      headers: headers
    });

    if (response.status == 500) {
      const message =
        (response.data && response.data.message) || response.statusText;
      console.error(
        `express-jwt-aserto: isAuthorized returned error: ${message}`
      );
      return null;
    }

    const allowed = response.data && response.data.allowed;
    return allowed;
  } catch (err) {
    console.error(`express-jwt-aserto: isAuthorized caught exception ${err}`);
    return null;
  }
};
