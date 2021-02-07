const getAxios = require('./axios');
const processOptions = require('./processOptions');
const processParams = require('./processParams');

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
      applicationName,
      useAuthorizationHeader,
      identity,
      subject
    } = options;

    // get a well-configured axios instance based on the options
    const axios = getAxios(options);

    // process the parameter values to extract policy and resource
    const params = processParams(req, policy, null, applicationName);
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
    const body = {
      policy
    };
    if (resource) {
      body.resource = resource;
    }

    // set the identity context
    if (useAuthorizationHeader) {
      // if the useAuthorizationHeader flag is true, set the Authorization header
      headers.Authorization = req.headers.authorization;
    } else {
      // otherwise use an identity context
      const identityContext = {};
      if (identity) {
        // use the identity header as the identity
        identityContext.identity = identity;
        identityContext.mode = 'MANUAL';
      } else {
        if (subject) {
          // use the subject as the identity
          identityContext.identity = subject;
          identityContext.mode = 'MANUAL';
        } else {
          // fall back to anonymous context
          identityContext.mode = 'ANONYMOUS';
        }
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
