const getAxios = require('./axios');
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

    // if the access map endpoint was requested, return it now
    if (req.path === endpointPath) {
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
            // otherwise use an identity context
            const identityContext = { mode: 'MANUAL' };
            if (identity) {
              // use the identity header as the identity
              identityContext.identity = identity;
            } else {
              // use the subject as the identity
              identityContext.identity = subject;
            }

            // set the identity context on the body
            body.identityContext = identityContext;
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
          console.error(
            `express-jwt-aserto: accessMap caught exception ${err}`
          );
          error(res, err.message);
        }
      })();
      return;
    }

    // pass the request forward
    next();
  };
};
