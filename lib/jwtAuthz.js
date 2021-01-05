//const axios = require('axios');
// temporarily disable SSL cert for local dev
const https = require('https');
const axios = require('axios').create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

const processOptions = require('./processOptions');

module.exports = (policy, resource, optionsParam) => {
  if (typeof policy !== 'string') {
    throw new Error(
      'express-jwt-aserto: parameter "policy" must be a string representing the policy to evaluate'
    );
  }
  if (typeof resource !== 'string') {
    throw new Error(
      'express-jwt-aserto: parameter "resource" must be a string representing the resource to evaluate'
    );
  }

  return async (req, res, next) => {
    const options = processOptions(optionsParam, req, res, next);
    if (!options) {
      return;
    }
    if (typeof options !== 'object') {
      return options;
    }
    const {
      failWithError,
      authorizerUrl,
      useAuthorizationHeader,
      subject
    } = options;

    const error = (res, err_message = 'express-jwt-aserto: unknown error') => {
      if (failWithError) {
        return next({
          statusCode: 403,
          error: 'Forbidden',
          message: err_message
        });
      }

      res.append('WWW-Authenticate', `Bearer error="${err_message}"`);
      res.status(403).send(err_message);
    };

    const callAuthorizer = async () => {
      try {
        const url = `${authorizerUrl}/authorize`;
        const headers = {
          ContentType: 'application/json'
        };
        const body = {
          policy,
          resource
        };

        // if the useAuthorizationHeader flag is true, set the Authorization header
        if (useAuthorizationHeader) {
          headers.Authorization = req.headers.authorization;
        } else {
          // use the subject as the identity in the request body
          body.identity = subject;
        }

        // make the request to the authorizer
        const response = await axios.post(url, body, {
          headers: headers
        });
        const allowed = response.data && response.data.allowed;
        return allowed;
      } catch (err) {
        console.error(`accessMap: caught exception ${err}`);
        error(res, err.message);
      }
    };

    const allowed = await callAuthorizer();
    return allowed ? next() : error(res, `Forbidden by policy ${policy}`);
  };
};
