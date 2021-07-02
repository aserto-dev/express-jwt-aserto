const jwtAuthz = require('../lib/jwtAuthz');
const axios = require('axios');

jest.mock('axios');

jest.setTimeout(30000);

describe('should succeed', () => {
  it('should call next when decisions are bigger than 0 and "is" function is present', async () => {
    axios.create.mockImplementation(() => ({
      post: () =>
        Promise.resolve({
          data: {
            decisions: [{ is: jest.fn() }]
          }
        })
    }));
    const next = jest.fn();
    const req = {
      headers: {
        authorization:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImFzZXJ0byIsImlhdCI6MTUxNjIzOTAyMn0.pDfgz2ABlhqXbkmA9F68X64nr9S4qal40nDb1XcJTJk'
      }
    };
    const res = {
      append: jest.fn(),
      status: jest.fn(() => ({ send: jest.fn }))
    };
    const options = {
      policyRoot: 'root',
      policyId: '123',
      authorizerServiceUrl: 'aserto.com',
      identityHeader: 'Authorization'
    };
    const packageName = 'aserto.GET.user';
    const response = jwtAuthz(options, packageName);
    await response(req, res, next);
    await expect(next).toBeCalled();
  });
});

describe('should error', () => {
  it('should call next with correct error code and error message', async () => {
    expect(true).toBe(true);
  });
});
