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
      identityContext.mode = 'MANUAL';
      const token = jwt_decode(req.headers.authorization);
      identityContext.identity = token && token.sub;
    } catch (error) {
      console.error(
        log(
          `express-jwt-aserto: Authorization header contained malformed JWT: ${
            error.message
          }`,
          'ERROR'
        )
      );
      identityContext.mode = 'ANONYMOUS';
    }
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

  // if provided, use the identity header as the identity override
  if (identity) {
    identityContext.identity = identity;
    identityContext.mode = 'MANUAL';
  }

  return identityContext;
};
