const axios = require('./axios');
const processOptions = require('./processOptions');
const processParams = require('./processParams');

module.exports = (optionsParam, policyName, resourceKey) => {
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
      applicationName,
      authorizerUrl,
      useAuthorizationHeader,
      identity,
      subject
    } = options;

    // process the parameter values to extract policy and resource
    const { policy, resource } = processParams(
      req,
      policyName,
      resourceKey,
      applicationName
    );

    const error = (res, err_message = 'express-jwt-aserto: unknown error') => {
      if (failWithError) {
        return next({
          statusCode: 403,
          error: 'Forbidden',
          message: err_message
        });
      }

      res.append(
        'WWW-Authenticate',
        `Bearer error="${encodeURIComponent(err_message)}"`
      );
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
          error(res, `express-jwt-aserto: error: ${message}`);
          return null;
        }

        const allowed = response.data && response.data.allowed;
        return allowed;
      } catch (err) {
        console.error(`express-jwt-aserto: jwtAuthz caught exception ${err}`);
        error(res, err.message);
        return null;
      }
    };

    const allowed = await callAuthorizer();
    if (allowed != null) {
      return allowed ? next() : error(res, `Forbidden by policy ${policy}`);
    }
  };
};
