const fs = require('fs');
const YAML = require('yaml');

let definition;

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

      res.append(
        'WWW-Authenticate',
        `Bearer scope="${expectedScopes.join(' ')}", error="${err_message}"`
      );
      res.status(403).send(err_message);
    };

    // set the policy file name
    let policyFile = './policy.yml';
    if (
      options &&
      options.policyFile !== null &&
      typeof options.policyFile === 'string'
    ) {
      policyFile = options.policyFile;
    }

    // set the endpoint name
    let endpointName = '/__accessmap';
    if (
      options &&
      options.endpointName !== null &&
      typeof options.endpointName === 'string'
    ) {
      endpointName = options.endpointName;
    }

    if (!definition) {
      definition = getDefinition(policyFile);
      if (!definition) {
        const message = `express-jwt-aserto: policy not found`;
        return error(res, message);
      }
    }

    // if the metadata endpoint was requested, return it now
    if (req.path === endpointName) {
      const policy = definition;
      res.status(200).send(policy);
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
