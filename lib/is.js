const post = require('./post');
const processOptions = require('./processOptions');
const processParams = require('./processParams');
const identityContext = require('./identityContext');
const log = require('./log');

module.exports = async (
  decision,
  req,
  optionsParam,
  packageName,
  resourceMap
) => {
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
        decisions: [decision]
      },
      identityContext: identityContext(req, identityContextOptions),
      resourceContext
    };

    // make the request to the authorizer
    const response = await post(url, headers, body, axiosOptions);

    if (response.status == 500) {
      const message =
        (response.data && response.data.message) || response.statusText;
      log(`express-jwt-aserto: 'is' returned error: ${message}`, 'ERROR');
      return null;
    }

    const allowed =
      response.data &&
      response.data.decisions &&
      response.data.decisions.length &&
      response.data.decisions[0].is;
    return allowed;
  } catch (err) {
    log(`express-jwt-aserto: 'is' caught exception ${err}`, 'ERROR');
    return null;
  }
};
