const getAxios = require('./axios');
const processOptions = require('./processOptions');
const processParams = require('./processParams');
const identityContext = require('./identityContext');

module.exports = async (decision, req, optionsParam, policy, resource) => {
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
      useAuthorizationHeader
    } = options;

    // get a well-configured axios instance based on the options
    const axios = getAxios(options);

    // process the parameter values to extract policy and resource
    const params = processParams(req, policy, null, policyRoot);
    // if the policy and resource weren't passed in, use the inferred values
    if (!policy) {
      policy = params.policy;
    }
    if (!resource) {
      resource = params.resource;
    }

    const url = `${authorizerUrl}/is/${decision}`;
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
        decisions: [decision]
      },
      identityContext: identityContext(req, options)
    };
    if (resource) {
      body.resourceContxt = {
        resource
      };
    }

    // make the request to the authorizer
    const response = await axios.post(url, body, {
      headers: headers
    });

    if (response.status == 500) {
      const message =
        (response.data && response.data.message) || response.statusText;
      console.error(`express-jwt-aserto: 'is' returned error: ${message}`);
      return null;
    }

    const allowed = response.data && response.data.is;
    return allowed;
  } catch (err) {
    console.error(`express-jwt-aserto: 'is' caught exception ${err}`);
    return null;
  }
};
