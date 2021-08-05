const post = require('./post');
const processOptions = require('./processOptions');
const processParams = require('./processParams');
const identityContext = require('./identityContext');
const log = require('./log');

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
      identityContextOptions,
      axiosOptions
    } = options;

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
        if (tenantId) {
          headers['Aserto-Tenant-Id'] = tenantId;
        }
        if (authorizerApiKey) {
          headers['Authorization'] = `basic ${authorizerApiKey}`;
        }

        const body = {
          policyContext: {
            id: policyId,
            path: policy,
            decisions: ['allowed']
          },
          identityContext: identityContext(req, identityContextOptions),
          resourceContext
        };

        // make the request to the authorizer
        const response = await post(url, headers, body, axiosOptions);

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
        log(`express-jwt-aserto: jwtAuthz caught exception ${err}`, 'ERROR');
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
