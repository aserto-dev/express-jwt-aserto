// create identity context

const jwt_decode = require('jwt-decode');
const log = require('./log');

module.exports = (req, options) => {
  const { useAuthorizationHeader, identity, subject } = options;

  // construct the identity context
  const identityContext = {};

  // set the identity context
  if (useAuthorizationHeader) {
    try {
      // decode the JWT to make sure it's valid
      const token = jwt_decode(req.headers.authorization);
      identityContext.identity = token && token.sub;
      identityContext.type = 'IDENTITY_TYPE_SUB';

      // instead of fishing out the subject, just pass the JWT itself
      // TODO: create a flag for choosing one behavior over another
      identityContext.identity = req.headers.authorization.replace(
        'Bearer ',
        ''
      );
      identityContext.type = 'IDENTITY_TYPE_JWT';
    } catch (error) {
      console.error(
        log(
          `express-jwt-aserto: Authorization header contained malformed JWT: ${
            error.message
          }`,
          'ERROR'
        )
      );
      identityContext.type = 'IDENTITY_TYPE_NONE';
    }
  } else {
    if (subject) {
      // use the subject as the identity
      identityContext.identity = subject;
      identityContext.type = 'IDENTITY_TYPE_SUB';
    } else {
      // fall back to anonymous context
      identityContext.type = 'IDENTITY_TYPE_NONE';
    }
  }

  // if provided, use the identity header as the identity override
  if (identity) {
    identityContext.identity = identity;
    identityContext.type = 'IDENTITY_TYPE_SUB';
  }

  return identityContext;
};
