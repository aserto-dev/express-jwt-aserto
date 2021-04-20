const getAxios = require('./axios');
const processOptions = require('./processOptions');
const processParams = require('./processParams');
const identityContext = require('./identityContext');

module.exports = (optionsParam, packageName, resourceMap) => {
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
      authorizerApiKey,
      tenantId,
      policyId,
      policyRoot,
      useAuthorizationHeader
    } = options;

    // get a well-configured axios instance based on the options
    const axios = getAxios(options);

    // process the parameter values to extract policy and resourceContext
    const { policy, resourceContext } = processParams(
      req,
      packageName,
      resourceMap,
      policyRoot
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
        const url = `${authorizerUrl}/is`;
        const headers = {
          ContentType: 'application/json'
        };
        if (useAuthorizationHeader) {
          headers.Authorization = req.headers.authorization;
        }
        if (tenantId) {
          headers['Aserto-Tenant-Id'] = tenantId;
        }
        if (authorizerApiKey) {
          headers['Aserto-API-Key'] = `basic ${authorizerApiKey}`;
        }

        const body = {
          policyContext: {
            id: policyId,
            path: policy,
            decisions: ['allowed']
          },
          identityContext: identityContext(req, options),
          resourceContext
        };

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

        const allowed =
          response.data &&
          response.data.decisions &&
          response.data.decisions.length &&
          response.data.decisions[0].is;
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
