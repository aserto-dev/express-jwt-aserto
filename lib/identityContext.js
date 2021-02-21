// create identity context

module.exports = (req, options) => {
  const { useAuthorizationHeader, identity, subject } = options;

  // construct the identity context
  const identityContext = {};

  // set the identity context
  if (useAuthorizationHeader) {
    // if the useAuthorizationHeader flag is true, set the Authorization header
    headers.Authorization = req.headers.authorization;
    identityContext.mode = 'JWT';
  } else {
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
  }

  return identityContext;
};
