const getAxios = require('./axios');
const processOptions = require('./processOptions');

module.exports = optionsParam => {
  return (req, res, next) => {
    // determine the endpoint path
    let endpointPath = `/__accessmap`;
    if (
      optionsParam &&
      optionsParam.endpointPath !== null &&
      typeof optionsParam.endpointPath === 'string'
    ) {
      endpointPath = optionsParam.endpointPath;
    }
    // bail if this isn't a request for the access map endpoint
    if (req.path !== endpointPath) {
      next();
    }

    // process options parameter
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
      useAuthorizationHeader,
      identity,
      subject
    } = options;

    // get a well-configured axios instance based on the options
    const axios = getAxios(options);

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

    (async () => {
      try {
        const url = `${authorizerUrl}/decisiontree`;
        const headers = {
          ContentType: 'application/json'
        };
        const body = {
          application: applicationName,
          options: {
            elementList: ['visible', 'enabled'],
            grouping: 'FLAT',
            pathSeparator: 'SLASH',
            prefixPathWithApplication: false,
            useConvention: false
          }
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
          return;
        }
        res.status(200).send(response.data && response.data.path);
        return;
      } catch (err) {
        console.error(`express-jwt-aserto: accessMap caught exception ${err}`);
        error(res, err.message);
      }
    })();
  };
};
