const axios = require('axios');

module.exports = options => {
  return (req, res, next) => {
    const error = (res, err_message = 'express-jwt-aserto: unknown error') => {
      if (options && options.failWithError) {
        return next({
          statusCode: 403,
          error: 'Forbidden',
          message: err_message
        });
      }

      res.status(403).send(err_message);
    };

    // set the authorizer URL
    const authorizerService =
      options &&
      typeof options.authorizerService === 'string' &&
      options.authorizerService;
    if (!authorizerService) {
      error(
        res,
        'express-jwt-aserto: must provide authorizerService in option map'
      );
    }
    const authorizerUrl = `https://${authorizerService}/api/v1/edge/accessmap`;

    // set the endpoint path
    let endpointPath = `/__accessmap`;
    if (
      options &&
      options.endpointPath !== null &&
      typeof options.endpointPath === 'string'
    ) {
      endpointPath = options.endpointPath;
    }

    // set the user key
    let userKey = 'user';
    if (
      options &&
      options.customUserKey != null &&
      typeof options.customUserKey === 'string'
    ) {
      userKey = options.customUserKey;
    }

    if (!req[userKey]) {
      return error(res, 'accessMap: no user key');
    }

    const email = req[userKey].email;
    if (!email) {
      return error(res, 'accessMap: no email claim for user');
    }

    // if the access map endpoint was requested, return it now
    if (req.path === endpointPath) {
      (async () => {
        try {
          const token = 'hello'; // placeholder
          const headers = {
            ContentType: 'application/json',
            Authorization: `Bearer ${token}`
          };
          const body = {
            identity: email
          };
          const response = await axios.post(authorizerUrl, body, headers);
          res.status(200).send(response);
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

const getDefinition = policyFile => {
  try {
    const definition = fs.readFileSync(policyFile, 'utf8');
    const policy = YAML.parse(definition);
    policy.text = definition;

    // TODO: validation
    return policy;
  } catch (error) {
    console.error(`getDefinition: caught exception: ${error}`);
    return null;
  }
};
