const is = require('../lib/is');
const axios = require('axios');

jest.mock('axios');

describe('should succeed', () => {
  it('should return a boolean when all required arguments, packageName, and resourceMap are provided as inputs', async () => {
    const decision = 'some decision';

    axios.create.mockImplementation(() => ({
      post: () =>
        Promise.resolve({
          data: {
            decisions: [
              {
                decision,
                is: true
              }
            ]
          }
        })
    }));

    const req = {
      headers: {
        authorization:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImFzZXJ0byIsImlhdCI6MTUxNjIzOTAyMn0.pDfgz2ABlhqXbkmA9F68X64nr9S4qal40nDb1XcJTJk'
      }
    };

    const packageName = 'aserto.GET.user';
    const resourceMap = { id: 'value-of-id' };

    const options = {
      policyRoot: 'root',
      policyId: '123',
      authorizerServiceUrl: 'aserto.com',
      identityHeader: 'Authorization'
    };

    const allowed = await is(decision, req, options, packageName, resourceMap);

    expect(allowed).toBe(true);
  });

  it('should return a boolean when all required arguments are provided as inputs and req object is populated', async () => {
    const decision = 'some decision';

    axios.create.mockImplementation(() => ({
      post: () =>
        Promise.resolve({
          data: {
            decisions: [
              {
                decision,
                is: true
              }
            ]
          }
        })
    }));

    const req = {
      headers: {
        authorization:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImFzZXJ0byIsImlhdCI6MTUxNjIzOTAyMn0.pDfgz2ABlhqXbkmA9F68X64nr9S4qal40nDb1XcJTJk'
      },
      params: { id: 'value-of-id' },
      route: {
        path: 'aserto.GET.user'
      }
    };

    const options = {
      policyRoot: 'root',
      policyId: '123',
      authorizerServiceUrl: 'aserto.com',
      identityHeader: 'Authorization'
    };

    const allowed = await is(decision, req, options);

    expect(allowed).toBe(true);
  });
});

describe('should error', () => {
  it('should update response with correct error code and error message when response status is 500', async () => {
    const decision = 'some decision';
    const message = 'some error';
    axios.create.mockImplementation(() => ({
      post: () =>
        Promise.resolve({
          data: {
            message
          },
          status: 500
        })
    }));

    const req = {
      headers: {
        authorization:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImFzZXJ0byIsImlhdCI6MTUxNjIzOTAyMn0.pDfgz2ABlhqXbkmA9F68X64nr9S4qal40nDb1XcJTJk'
      }
    };

    const packageName = 'aserto.GET.user';
    const resourceMap = { id: 'value-of-id' };

    const options = {
      policyRoot: 'root',
      policyId: '123',
      authorizerServiceUrl: 'aserto.com',
      identityHeader: 'Authorization'
    };

    const allowed = await is(decision, req, options, packageName, resourceMap);

    expect(allowed).toBeNull();
  });

  it('should update response with correct error code and error message with a rejected promise', async () => {
    const decision = 'some decision';
    const message = 'some thrown error';
    axios.create.mockImplementation(() => ({
      post: () => Promise.reject(new Error(message))
    }));

    const req = {
      headers: {
        authorization:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImFzZXJ0byIsImlhdCI6MTUxNjIzOTAyMn0.pDfgz2ABlhqXbkmA9F68X64nr9S4qal40nDb1XcJTJk'
      }
    };

    const packageName = 'aserto.GET.user';
    const resourceMap = { id: 'value-of-id' };

    const options = {
      policyRoot: 'root',
      policyId: '123',
      authorizerServiceUrl: 'aserto.com',
      identityHeader: 'Authorization'
    };

    const allowed = await is(decision, req, options, packageName, resourceMap);

    expect(allowed).toBeNull();
  });
});
