const jwtAuthz = require('../lib/jwtAuthz');
const axios = require('axios');

jest.mock('axios');

jest.setTimeout(30000);

let options = {
  policyRoot: 'root',
  policyId: '123',
  authorizerServiceUrl: 'aserto.com',
  identityHeader: 'Authorization'
};

const req = {
  headers: {
    authorization:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImFzZXJ0byIsImlhdCI6MTUxNjIzOTAyMn0.pDfgz2ABlhqXbkmA9F68X64nr9S4qal40nDb1XcJTJk'
  }
};

const packageName = 'aserto.GET.user';

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

    const send = jest.fn();
    const res = {
      append: jest.fn(),
      status: jest.fn(() => ({ send }))
    };

    const response = jwtAuthz(options, packageName);
    await response(req, res, next);

    expect.assertions(1);
    await expect(next).toBeCalled();
  });
});

describe('should error', () => {
  it('should update response with correct error code and error message when response status is 500', async () => {
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

    const next = jest.fn();

    const send = jest.fn();
    const res = {
      append: jest.fn(),
      status: jest.fn(() => ({ send }))
    };

    const response = jwtAuthz(options, packageName);
    await response(req, res, next);

    expect.assertions(3);
    expect(res.append).toHaveBeenCalledWith(
      'WWW-Authenticate',
      'Bearer error="express-jwt-aserto%3A%20error%3A%20some%20error"'
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(send).toHaveBeenCalledWith(`express-jwt-aserto: error: ${message}`);
  });

  it('should update response with correct error code and error message when decisions array is empty', async () => {
    axios.create.mockImplementation(() => ({
      post: () =>
        Promise.resolve({
          data: {
            decisions: []
          }
        })
    }));

    const next = jest.fn();

    const send = jest.fn();
    const res = {
      append: jest.fn(),
      status: jest.fn(() => ({ send }))
    };

    const response = jwtAuthz(options, packageName);
    await response(req, res, next);

    expect.assertions(3);
    expect(res.append).toHaveBeenCalledWith(
      'WWW-Authenticate',
      'Bearer error="Forbidden%20by%20policy%20aserto.GET.user"'
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(send).toHaveBeenCalledWith(`Forbidden by policy ${packageName}`);
  });

  it('should update response with correct error code and error message with a rejected promise', async () => {
    const message = 'some thrown error';
    axios.create.mockImplementation(() => ({
      post: () => Promise.reject(new Error(message))
    }));

    const next = jest.fn();

    const send = jest.fn();
    const res = {
      append: jest.fn(),
      status: jest.fn(() => ({ send }))
    };

    const response = jwtAuthz(options, packageName);
    await response(req, res, next);

    expect.assertions(3);
    expect(res.append).toHaveBeenCalledWith(
      'WWW-Authenticate',
      'Bearer error="some%20thrown%20error"'
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(send).toHaveBeenCalledWith(message);
  });

  it('should call next with correct error code and error message when response status is 500 and "failWithError" is set to true', async () => {
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

    const next = jest.fn();

    const send = jest.fn();
    const res = {
      append: jest.fn(),
      status: jest.fn(() => ({ send }))
    };

    options = {
      failWithError: true,
      ...options
    };

    const response = jwtAuthz(options, packageName);
    await response(req, res, next);

    const err = {
      statusCode: 403,
      error: 'Forbidden',
      message: `express-jwt-aserto: error: ${message}`
    };

    expect.assertions(3);
    expect(res.append).not.toHaveBeenCalledWith(
      'WWW-Authenticate',
      'Bearer error="express-jwt-aserto%3A%20error%3A%20some%20error"'
    );
    expect(res.status).not.toHaveBeenCalledWith(403);
    expect(next).toHaveBeenCalledWith(err);
  });

  it('should call next with correct error code and error message when decisions array is empty and "failWithError" is set to true', async () => {
    const message = 'some error';
    axios.create.mockImplementation(() => ({
      post: () =>
        Promise.resolve({
          data: {
            decisions: [],
            message
          }
        })
    }));

    const next = jest.fn();

    const send = jest.fn();
    const res = {
      append: jest.fn(),
      status: jest.fn(() => ({ send }))
    };

    options = {
      failWithError: true,
      ...options
    };

    const response = jwtAuthz(options, packageName);

    await response(req, res, next);

    const err = {
      statusCode: 403,
      error: 'Forbidden',
      message: `Forbidden by policy ${packageName}`
    };

    expect.assertions(3);
    expect(res.append).not.toHaveBeenCalledWith(
      'WWW-Authenticate',
      'Bearer error="Forbidden%20by%20policy%20aserto.GET.user"'
    );
    expect(res.status).not.toHaveBeenCalledWith(403);
    expect(next).toHaveBeenCalledWith(err);
  });

  it('should call next with correct error code and error message with a rejected promise when "failWithError" is true', async () => {
    const message = 'some thrown error';
    axios.create.mockImplementation(() => ({
      post: () => Promise.reject(new Error(message))
    }));

    const next = jest.fn();

    const send = jest.fn();
    const res = {
      append: jest.fn(),
      status: jest.fn(() => ({ send }))
    };

    options = {
      failWithError: true,
      ...options
    };

    const response = jwtAuthz(options, packageName);

    await response(req, res, next);

    const err = {
      statusCode: 403,
      error: 'Forbidden',
      message
    };

    expect.assertions(3);
    expect(res.append).not.toHaveBeenCalledWith(
      'WWW-Authenticate',
      'Bearer error="some%20thrown%20error"'
    );
    expect(res.status).not.toHaveBeenCalledWith(403);
    expect(next).toHaveBeenCalledWith(err);
  });
});
