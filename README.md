# express-jwt-aserto ![](https://travis-ci.org/aserto/express-jwt-aserto.svg?branch=master)

Aserto authorization middleware for the node Express server, based on
Auth0's [express-jwt-authz](https://github.com/auth0/express-jwt-authz)
package.

This package provides two capabilities:

1. `jwtAuthz`: Validate a request carrying a JWT to authorize access to an endpoint.
2. `accessMap`: An endpoint for returning the access map for a service, based on its authorization policy.

## Install

    $ npm install express-jwt-aserto

> `express@^4.0.0` is a peer dependency. Make sure it is installed in your project.

## Usage

### jwtAuthz

Use the jwtAuthz function together with [express-jwt](https://github.com/auth0/express-jwt) to both validate a JWT and make sure it has the correct permissions to call an endpoint.

```javascript
const jwt = require('express-jwt');
const { jwtAuthz } = require('express-jwt-authz');

const options = {};
app.get('/users',
  jwt({ secret: 'shared_secret' }),
  jwtAuthz([ 'read:users' ], options),
  function(req, res) { ... });
```

If multiple scopes are provided, the user must have _at least one_ of the specified scopes.

```javascript
app.post('/users',
  jwt({ secret: 'shared_secret' }),
  jwtAuthz([ 'read:users', 'write:users' ], {}),
  function(req, res) { ... });

// This user will be granted access
var authorizedUser = {
  scope: 'read:users'
};
```

To check that the user has _all_ the scopes provided, use the `checkAllScopes: true` option:

```javascript
app.post('/users',
  jwt({ secret: 'shared_secret' }),
  jwtAuthz([ 'read:users', 'write:users' ], { checkAllScopes: true }),
  function(req, res) { ... });

// This user will have access
var authorizedUser = {
  scope: 'read:users write:users'
};

// This user will NOT have access
var unauthorizedUser = {
  scope: 'read:users'
};
```

The JWT must have a `scope` claim and it must either be a string of space-separated permissions or an array of strings. For example:

```
// String:
"write:users read:users"

// Array:
["write:users", "read:users"]
```

### accessMap

Use the accessMap function to set up an endpoint that returns the access map to a caller.

```javascript
const { accessMap } = require('express-jwt-aserto');

const options = {
  // policyFile: './path-to-policy-file', // defaults to './policy.yml'
  // endpointName: '/accessmap-endpoint'  // defaults to '/__accessmap'
};
app.use(accessMap(options));
```

### using both jwtAuthz and accessMap is the common usage

```javascript
const { accessMap, jwtAuthz } = require('express-jwt-aserto');
```

## Options

### jwtAuthz

- `failWithError`: When set to `true`, will forward errors to `next` instead of ending the response directly. Defaults to `false`.
- `checkAllScopes`: When set to `true`, all the expected scopes will be checked against the user's scopes. Defaults to `false`.
- `customUserKey`: The property name to check for the scope key. By default, permissions are checked against `req.user`, but you can change it to be `req.myCustomUserKey` with this option. Defaults to `user`.
- `customScopeKey`: The property name to check for the actual scope. By default, permissions are checked against `user.scope`, but you can change it to be `user.myCustomScopeKey` with this option. Defaults to `scope`.

### accessMap

- `failWithError`: When set to `true`, will forward errors to `next` instead of ending the response directly. Defaults to `false`.
- `policyFile`: policy file name, defaults to `./policy.yml`
- `endpointName`: access map endpoint name, defaults to `/__accessmap`

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Aserto](https://aserto.com) based on the original work by [Auth0](https://auth0.com).

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
