const processOptions = require('../lib/processOptions');

describe('should succeed', () => {
  it('should return options object when required parameters are given', () => {
    const options = {
      authorizerServiceUrl: 'https://localhost:8383',
      policyId: 'policy-id-guid',
      policyRoot: 'mycars'
    };

    const req = {
      headers: {
        authorization:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImFzZXJ0byIsImlhdCI6MTUxNjIzOTAyMn0.pDfgz2ABlhqXbkmA9F68X64nr9S4qal40nDb1XcJTJk'
      }
    };

    const res = {};

    const next = jest.fn();

    const returnedOptions = processOptions(options, req, res, next);

    const finalOptions = {
      authorizerApiKey: null,
      authorizerUrl: 'https://localhost:8383/api/v1/authz',
      failWithError: false,
      policyId: 'policy-id-guid',
      policyRoot: 'mycars',
      tenantId: null,
      identityContextOptions: {
        identity: undefined,
        subject: undefined,
        useAuthorizationHeader: true
      },
      axiosOptions: {
        authorizerCert: null,
        disableTlsValidation: false
      }
    };

    expect(returnedOptions).toStrictEqual(finalOptions);
  });
});

describe('should error', () => {
  it('should throw an error when options object is missing required authorizerServiceUrl', () => {
    const options = {
      policyId: 'policy-id-guid',
      policyRoot: 'mycars'
    };

    const req = {
      headers: {
        authorization:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImFzZXJ0byIsImlhdCI6MTUxNjIzOTAyMn0.pDfgz2ABlhqXbkmA9F68X64nr9S4qal40nDb1XcJTJk'
      }
    };

    const send = jest.fn();
    const res = {
      append: jest.fn(),
      status: jest.fn(() => ({ send }))
    };

    const next = jest.fn();

    processOptions(options, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(send).toHaveBeenCalledWith(
      'express-jwt-aserto: must provide authorizerServiceUrl in option map'
    );
  });

  it('should throw an error when options object is missing required policyId', () => {
    const options = {
      authorizerServiceUrl: 'https://localhost:8383',
      policyRoot: 'mycars'
    };

    const req = {
      headers: {
        authorization:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImFzZXJ0byIsImlhdCI6MTUxNjIzOTAyMn0.pDfgz2ABlhqXbkmA9F68X64nr9S4qal40nDb1XcJTJk'
      }
    };

    const send = jest.fn();
    const res = {
      append: jest.fn(),
      status: jest.fn(() => ({ send }))
    };

    const next = jest.fn();

    processOptions(options, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(send).toHaveBeenCalledWith(
      'express-jwt-aserto: must provide policyId in option map'
    );
  });

  it('should throw an error when options object is missing required policyRoot', () => {
    const options = {
      authorizerServiceUrl: 'https://localhost:8383',
      policyId: 'policy-id-guid'
    };

    const req = {
      headers: {
        authorization:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImFzZXJ0byIsImlhdCI6MTUxNjIzOTAyMn0.pDfgz2ABlhqXbkmA9F68X64nr9S4qal40nDb1XcJTJk'
      }
    };

    const send = jest.fn();
    const res = {
      append: jest.fn(),
      status: jest.fn(() => ({ send }))
    };

    const next = jest.fn();

    processOptions(options, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(send).toHaveBeenCalledWith(
      'express-jwt-aserto: must provide policyRoot in option map'
    );
  });
});
