// process options map

module.exports = (options, req, res, next) => {
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
  const authorizerServiceUrl =
    options &&
    typeof options.authorizerServiceUrl === 'string' &&
    options.authorizerServiceUrl;
  if (!authorizerServiceUrl) {
    error(
      res,
      'express-jwt-aserto: must provide authorizerServiceUrl in option map'
    );
  }
  const authorizerUrl = `${authorizerServiceUrl}/api/v1/edge`;

  // set the application name
  const applicationName =
    options &&
    typeof options.applicationName === 'string' &&
    options.applicationName;
  if (!applicationName) {
    error(
      res,
      'express-jwt-aserto: must provide applicationName in option map'
    );
  }

  // set the endpoint path
  let endpointPath = `/__accessmap`;
  if (
    options &&
    options.endpointPath !== null &&
    typeof options.endpointPath === 'string'
  ) {
    endpointPath = options.endpointPath;
  }

  // set the useAuthorizationHeader flag
  let useAuthorizationHeader = true;
  if (
    options &&
    options.useAuthorizationHeader !== null &&
    typeof options.useAuthorizationHeader === 'bool'
  ) {
    useAuthorizationHeader = options.useAuthorizationHeader;
  }

  // set the failWithError flag
  let failWithError = false;
  if (
    options &&
    options.failWithError !== null &&
    typeof options.failWithError === 'bool'
  ) {
    failWithError = options.failWithError;
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

  if (!useAuthorizationHeader && !req[userKey]) {
    return error(res, 'accessMap: no user key');
  }

  // set the subject key
  let subjectKey = 'sub';
  if (
    options &&
    options.customSubjectKey != null &&
    typeof options.customSubjectKey === 'string'
  ) {
    subjectKey = options.customSubjectKey;
  }

  const subject = req[userKey] && req[userKey][subjectKey];
  if (!useAuthorizationHeader && !subject) {
    return error(res, 'accessMap: no sub claim found for user');
  }

  return {
    failWithError,
    authorizerUrl,
    applicationName,
    endpointPath,
    useAuthorizationHeader,
    subject
  };
};
