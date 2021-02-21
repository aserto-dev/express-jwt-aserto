// process options map

const fs = require('fs');

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
    return error(
      res,
      'express-jwt-aserto: must provide authorizerServiceUrl in option map'
    );
  }
  const authorizerUrl = `${authorizerServiceUrl}/api/v1/edge`;

  // set the disableTlsValidation flag
  let disableTlsValidation = false;
  if (
    options &&
    options.disableTlsValidation !== null &&
    typeof options.disableTlsValidation === 'boolean'
  ) {
    disableTlsValidation = options.disableTlsValidation;
  }

  // set the authorizer cert file
  let authorizerCertFile = null;
  if (
    options &&
    typeof options.authorizerCertFile === 'string' &&
    options.authorizerCertFile
  ) {
    authorizerCertFile = options.authorizerCertFile;
  }

  let authorizerCert = null;
  if (!disableTlsValidation && authorizerCertFile) {
    const certfilesplit = authorizerCertFile.split('$HOME/');
    const certfile =
      certfilesplit.length > 1
        ? `${process.env.HOME}/${certfilesplit[1]}`
        : authorizerCertFile;
    try {
      authorizerCert = fs.readFileSync(certfile);
    } catch (e) {
      const text = `Certificate for CA not found at ${authorizerCertFile}. To disable TLS certificate validation, use the 'disableTlsValidation: true' option.`;
      console.error(`express-jwt-aserto: ${text}`);
      return error(res, `express-jwt-aserto: ${text}`);
    }
  }

  // set the application name
  const applicationName =
    options &&
    typeof options.applicationName === 'string' &&
    options.applicationName;
  if (!applicationName) {
    return error(
      res,
      'express-jwt-aserto: must provide applicationName in option map'
    );
  }

  // set the identity header
  let identityHeader = 'identity';
  if (
    options &&
    options.identityHeader !== null &&
    typeof options.identityHeader === 'string'
  ) {
    identityHeader = options.identityHeader;
  }

  // set the identity based on what is in the identity header (if anything)
  const identity = req.headers[identityHeader];

  // set the useAuthorizationHeader flag
  let useAuthorizationHeader = true;
  if (
    options &&
    options.useAuthorizationHeader !== null &&
    typeof options.useAuthorizationHeader === 'boolean'
  ) {
    useAuthorizationHeader = options.useAuthorizationHeader;
  }

  // set the failWithError flag
  let failWithError = false;
  if (
    options &&
    options.failWithError !== null &&
    typeof options.failWithError === 'boolean'
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

  return {
    failWithError,
    authorizerUrl,
    authorizerCert,
    disableTlsValidation,
    applicationName,
    useAuthorizationHeader,
    identity,
    subject
  };
};
