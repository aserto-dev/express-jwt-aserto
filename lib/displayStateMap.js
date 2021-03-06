const post = require('./post');
const processOptions = require('./processOptions');
const identityContext = require('./identityContext');
const log = require('./log');

module.exports = optionsParam => {
  return (req, res, next) => {
    // determine the endpoint path
    let endpointPath = `/__displaystatemap`;
    if (
      optionsParam &&
      optionsParam.endpointPath !== null &&
      typeof optionsParam.endpointPath === 'string'
    ) {
      endpointPath = optionsParam.endpointPath;
    }
    // bail if this isn't a request for the display state map endpoint
    if (req.path !== endpointPath) {
      next();
      return;
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
      authorizerApiKey,
      tenantId,
      policyId,
      policyRoot
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

    (async () => {
      try {
        const url = `${authorizerUrl}/decisiontree`;
        const headers = {
          ContentType: 'application/json'
        };
        if (tenantId) {
          headers['Aserto-Tenant-Id'] = tenantId;
        }
        if (authorizerApiKey) {
          headers['Aserto-API-Key'] = `basic ${authorizerApiKey}`;
        }

        const body = {
          policyContext: {
            id: policyId,
            path: policyRoot,
            decisions: ['visible', 'enabled']
          },
          options: {
            grouping: 'FLAT',
            pathSeparator: 'SLASH'
          },
          identityContext: identityContext(req, options)
        };

        // make the request to the authorizer
        const response = await post(url, headers, body, options);

        if (response.status == 500) {
          const message =
            (response.data && response.data.message) || response.statusText;
          error(res, `express-jwt-aserto: error: ${message}`);
          return;
        }
        res.status(200).send(response.data && response.data.path);
        return;
      } catch (err) {
        log(
          `express-jwt-aserto: displayStateMap caught exception ${err}`,
          'ERROR'
        );
        error(res, err.message);
      }
    })();
  };
};
