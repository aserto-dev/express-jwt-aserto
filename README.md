# express-jwt-aserto ![](https://travis-ci.org/aserto/express-jwt-aserto.svg?branch=master)

Aserto authorization middleware for the node Express server, based on
Auth0's [express-jwt-authz](https://github.com/auth0/express-jwt-authz)
package.

This package provides two capabilities:

1. `jwtAuthz`: Validate a request carrying a JWT to authorize access to an endpoint.
2. `accessMap`: Adds an endpoint for returning the access map for a service, based on its authorization policy.

Both of these capabilities call out to an authorizer service, which must be configured as part of the `options` map passed in.

## Installation

    $ npm install express-jwt-aserto

> `express@^4.0.0` is a peer dependency. Make sure it is installed in your project.

## Usage

### jwtAuthz

Use the jwtAuthz function together with [express-jwt](https://github.com/auth0/express-jwt) to both validate a JWT and make sure it has the correct permissions to call an endpoint.

```javascript
const jwt = require('express-jwt');
const { jwtAuthz } = require('express-jwt-aserto');

const options = {
  authorizerServiceUrl: 'https://localhost:8383', // required - must pass a valid URL
  applicationName: 'mycars' // required - must be a string representing the application name
};

app.get('/users/:id',
  jwt({ secret: 'shared_secret' }),
  jwtAuthz(options),
  function(req, res) { ... });
```

By default, `jwtAuthz` derives the policy name and resource key from the Express route path. To override this behavior, two optional parameters are available.

`jwtAuthz(options[, policyName[, resourceKey]])`

- `options`: a javascript map containing `{ authorizerServiceUrl, applicationName }`
- `policyName`: a string representing the package name for the the policy
- `resourceKey`: a key into the req.params map to extract the resource from

#### policy name

By default, the policy name will be derived in the following way from the application name, route path, and HTTP method:

`GET /api/users` --> `applicationName.api.users.get`
`POST /api/users/:id` --> `applicationName.api.users.__id.post`

Passing in the `policyName` parameter into the `jwtAuthz()` function will override this behavior.

#### resource key

By default, the resource key will be derived from the first parameter marker in the route path:

if the route path is `/api/users/:id`, the resource will be extracted from `req.params['id']`.

Passing in the `resourceKey` parameter into the `jwtAuthz()` function will override this behavior. For example, passing in `paramName` will retrieve the resource from `req.params.paramName`.

### accessMap

Use the accessMap function to set up an endpoint that returns the access map to a caller.

```javascript
const { accessMap } = require('express-jwt-aserto');

const options = {
  authorizerServiceUrl: 'https://localhost:8383', // required - must pass a valid URL
  applicationName: 'application', // required - application name string
  endpointPath: '/__accessmap' // optional - defaults to '/__accessmap'
};
app.use(accessMap(options));
```

### using both jwtAuthz and accessMap is the common usage

```javascript
const { accessMap, jwtAuthz } = require('express-jwt-aserto');
```

## Options

### jwtAuthz

- `authorizerServiceUrl`: URL of authorizer service (required)
- `failWithError`: When set to `true`, will forward errors to `next` instead of ending the response directly. Defaults to `false`.
- `customUserKey`: The property name to check for the subject key. By default, permissions are checked against `req.user`, but you can change it to be `req.myCustomUserKey` with this option. Defaults to `user`.
- `customSubjectKey`: The property name to check for the subject. By default, permissions are checked against `user.sub`, but you can change it to be `user.myCustomSubjectKey` with this option. Defaults to `sub`.

### accessMap

- `authorizerServiceUrl`: URL of authorizer service (required)
- `applicationName`: application name (required)
- `failWithError`: When set to `true`, will forward errors to `next` instead of ending the response directly. Defaults to `false`.
- `customUserKey`: The property name to check for the subject key. By default, permissions are checked against `req.user`, but you can change it to be `req.myCustomUserKey` with this option. Defaults to `user`.
- `customSubjectKey`: The property name to check for the subject. By default, permissions are checked against `user.sub`, but you can change it to be `user.myCustomSubjectKey` with this option. Defaults to `sub`.
- `endpointPath`: access map endpoint path, defaults to `/__accessmap`.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Aserto](https://aserto.com) based on the original work by [Auth0](https://auth0.com).

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
