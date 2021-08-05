// process options map

const fs = require('fs');
const log = require('./log');

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
  const authorizerUrl = `${authorizerServiceUrl}/api/v1/authz`;

  // set the authorizer API key
  let authorizerApiKey = null;
  if (
    options &&
    typeof options.authorizerApiKey === 'string' &&
    options.authorizerApiKey
  ) {
    authorizerApiKey = options.authorizerApiKey;
  }

  // set the tenant ID
  let tenantId = null;
  if (options && typeof options.tenantId === 'string' && options.tenantId) {
    tenantId = options.tenantId;
  }

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
      log(`express-jwt-aserto: ${text}`, 'ERROR');
      return error(res, `express-jwt-aserto: ${text}`);
    }
  }

  // set the policy ID
  const policyId =
    options && typeof options.policyId === 'string' && options.policyId;
  if (!policyId) {
    return error(
      res,
      'express-jwt-aserto: must provide policyId in option map'
    );
  }

  // set the policy root
  const policyRoot =
    options && typeof options.policyRoot === 'string' && options.policyRoot;
  if (!policyRoot) {
    return error(
      res,
      'express-jwt-aserto: must provide policyRoot in option map'
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
    authorizerApiKey,
    tenantId,
    policyId,
    policyRoot,
    identityContextOptions: {
      useAuthorizationHeader,
      identity,
      subject
    },
    axiosOptions: {
      authorizerCert,
      disableTlsValidation
    }
  };
};
