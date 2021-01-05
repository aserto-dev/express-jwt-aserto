const axios = require('./axios');
const processOptions = require('./processOptions');

module.exports = optionsParam => {
  return (req, res, next) => {
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
      applicationName,
      endpointPath,
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

      res.status(403).send(err_message);
    };

    // if the access map endpoint was requested, return it now
    if (req.path === endpointPath) {
      (async () => {
        try {
          const url = `${authorizerUrl}/accessmap`;
          const headers = {
            ContentType: 'application/json'
          };
          const body = {
            application: applicationName
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
          res.status(200).send(response.data && response.data.path);
          return;
        } catch (err) {
          console.error(`accessMap: caught exception ${err}`);
          error(res, err.message);
        }
      })();
      return;
    }

    // pass the request forward
    next();
  };
};
