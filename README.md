# express-jwt-aserto ![](https://travis-ci.org/aserto/express-jwt-aserto.svg?branch=master)

Aserto authorization middleware for the node Express server, based on
Auth0's [express-jwt-authz](https://github.com/auth0/express-jwt-authz)
package.

This package provides three capabilities:

1. `jwtAuthz`: middleware that sits on a route, and validates a request to authorize access to that route.
2. `accessMap`: middleware that adds an endpoint for returning the access map for a service, based on its authorization policy.
3. `is`: a function that can be called to make a decision about a user's access to a resource based on a policy.

All three of these capabilities call out to an authorizer service, which must be configured as part of the `options` map passed in.

## Installation

    $ npm install express-jwt-aserto

> `express@^4.0.0` is a peer dependency. Make sure it is installed in your project.

## Usage

### jwtAuthz middleware

`jwtAuthz` is an Express-compatible middleware that you can place in the dispatch pipeline of a route.

You can use the jwtAuthz function together with [express-jwt](https://github.com/auth0/express-jwt) to both validate a JWT and make sure it has the correct permissions to call an endpoint.

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

#### arguments

`jwtAuthz(options[, policyName[, resourceKey]])`:

- `options`: a javascript map containing at least `{ authorizerServiceUrl, applicationName }`
- `policyName`: a string representing the package name for the the policy
- `resourceKey`: a key into the req.params map to extract the resource from

#### options argument

- `applicationName`: application name (_required_)
- `authorizerServiceUrl`: URL of authorizer service (_required_)
- `authorizerCertFile`: location on the filesystem of the CA certificate that signed the Aserto authorizer self-signed certificate. This defaults to `$HOME/.config/aserto/aserto-one/certs/aserto-one-gateway-ca.crt`. See the "Certificates" section for more information.
- `disableTlsValidation`: ignore TLS certificate validation when creating a TLS connection to the authorizer. Defaults to false.
- `failWithError`: When set to `true`, will forward errors to `next` instead of ending the response directly.
- `useAuthorizationHeader`: When set to `true`, will forward the Authorization header to the authorizer. The authorizer will crack open the JWT and use that as the identity context. Defaults to `true`.
- `identityHeader`: the name of the header from which to extract the `identity` field to pass into the authorize call. This only happens if `useAuthorizationHeader` is false. Defaults to 'identity'.
- `customUserKey`: The property name to check for the subject key. By default, permissions are checked against `req.user`, but you can change it to be `req.myCustomUserKey` with this option. Defaults to `user`.
- `customSubjectKey`: The property name to check for the subject. By default, permissions are checked against `user.sub`, but you can change it to be `user.myCustomSubjectKey` with this option. Defaults to `sub`.

#### policyName argument

By convention, Aserto policy package names are of the form `application.METHOD.path`. By default, the policy name will be inferred from the application name, HTTP method, and route path:

- `GET /api/users` --> `applicationName.GET.api.users`
- `POST /api/users/:id` --> `applicationName.POST.api.users.__id`

Passing in the `policyName` parameter into the `jwtAuthz()` function will override this behavior.

#### resourceKey argument

By default, the resource key will be derived from the first parameter marker in the route path. For example, if the route path is `/api/users/:id`, the resource will be extracted from `req.params.id'`.

Passing in the `resourceKey` parameter into the `jwtAuthz()` function will override this behavior. For example, passing in `myParam` will retrieve the resource from `req.params.myParam`.

### accessMap middleware

Use the accessMap middleware to set up an endpoint that returns the access map to a caller. The endpoint is named `__accessmap` by default, but can be overridden in `options`.

```javascript
const { accessMap } = require('express-jwt-aserto');

const options = {
  authorizerServiceUrl: 'https://localhost:8383', // required - must pass a valid URL
  applicationName: 'application' // required - application name string
};
app.use(accessMap(options));
```

#### arguments

`accessMap(options)`

#### options argument

- `applicationName`: application name (_required_)
- `authorizerServiceUrl`: URL of authorizer service (_required_)
- `authorizerCertFile`: location on the filesystem of the CA certificate that signed the Aserto authorizer self-signed certificate. This defaults to `$HOME/.config/aserto/aserto-one/certs/aserto-one-gateway-ca.crt`. See the "Certificates" section for more information.
- `disableTlsValidation`: ignore TLS certificate validation when creating a TLS connection to the authorizer. Defaults to false.
- `endpointPath`: access map endpoint path, defaults to `/__accessmap`.
- `failWithError`: When set to `true`, will forward errors to `next` instead of ending the response directly. Defaults to `false`.
- `useAuthorizationHeader`: When set to `true`, will forward the Authorization header to the authorizer. The authorizer will crack open the JWT and use that as the identity context. Defaults to `true`.
- `identityHeader`: the name of the header from which to extract the `identity` field to pass into the accessMap call. This only happens if `useAuthorizationHeader` is false. Defaults to 'identity'.
- `customUserKey`: The property name to check for the subject key. By default, permissions are checked against `req.user`, but you can change it to be `req.myCustomUserKey` with this option. Defaults to `user`.
- `customSubjectKey`: The property name to check for the subject. By default, permissions are checked against `user.sub`, but you can change it to be `user.myCustomSubjectKey` with this option. Defaults to `sub`.

### 'is' function

While `jwtAuthz` is meant to be used as dispatch middleware for a route, `is` provides an explicit mechanism for calling the Aserto authorizer.

Use the `is` function to call the authorizer with a `decision`, policy, and resource, and get a boolean `true` or `false` response. The `decision` is a named value in the policy: the string `allowed` is used by convention. Examples: `is('allowed')`, `is('enabled')`, `is('visible')`, etc.

```javascript
const { is } = require('express-jwt-aserto');

const options = {
  authorizerServiceUrl: 'https://localhost:8383', // required - must pass a valid URL
  applicationName: 'application' // required - application name string
};

app.get('/users/:id', async function(req, res) {
  try {
    const allowed = await is('allowed', req, options);
    if (allowed) {
      ...
    } else {
      res.status(403).send("Unauthorized");
    }
  } catch (e) {
    res.status(500).send(e.message);
  }
});
```

#### arguments

`isAllowed(decision, req, options[, policy[, resource]])`:

- `decision`: a string representing the name of the decision - typically `allowed` (_required_)
- `req`: Express request object (_required_)
- `options`: a javascript map containing at least`{ authorizerServiceUrl }` (_required_)
- `policy`: a string representing the package name for the the policy (optional)
- `resource`: the resource to evaluate the policy over (optional)

#### decision argument

This is simply a string that is correlates to a decision referenced in the policy: for example, `allowed`, `enabled`, etc.

#### req argument

The Express request object.

#### options argument

- `applicationName`: application name (_required_)
- `authorizerServiceUrl`: URL of authorizer service (_required_)
- `authorizerCertFile`: location on the filesystem of the CA certificate that signed the Aserto authorizer self-signed certificate. This defaults to `$HOME/.config/aserto/aserto-one/certs/aserto-one-gateway-ca.crt`. See the "Certificates" section for more information.
- `disableTlsValidation`: ignore TLS certificate validation when creating a TLS connection to the authorizer. Defaults to false.
- `useAuthorizationHeader`: When set to `true`, will forward the Authorization header to the authorizer. The authorizer will crack open the JWT and use that as the identity context. Defaults to `true`.
- `identityHeader`: the name of the header from which to extract the `identity` field to pass into the `authorize` call. This only happens if `useAuthorizationHeader` is false. Defaults to 'identity'.
- `customUserKey`: The property name to check for the subject key. By default, permissions are checked against `req.user`, but you can change it to be `req.myCustomUserKey` with this option. Defaults to `user`.
- `customSubjectKey`: The property name to check for the subject. By default, permissions are checked against `user.sub`, but you can change it to be `user.myCustomSubjectKey` with this option. Defaults to `sub`.

#### policy argument

By default, `is` will follow the same heuristic behavior as `jwtAuthz` - it will infer the policy name from the application name, HTTP method, and route path. If provided, the `policy` argument will override this and specify a policy package to use.

By convention, Aserto Rego policies are named in the form `application.METHOD.path`. Following the node.js idiom, you can also pass it in as `application/METHOD/path`, and the path can contain the Express parameter syntax.

For example, passing in `applicationName/GET/api/users/:id` will resolve to a policy called `applicationName.GET.api.users.__id`.

#### resource argument

By default, `is` follows the same behavior as `jwtAuthz` and pick up the resource from the first parameter specified in the route. For example, if the route path is `/api/users/:id`, the resource will be extracted from `req.params.id`. If the `resource` argument is provided, it will be used instead.

## Certificates

The Aserto [authorizer](github.com/aserto-dev/aserto-one) exposes HTTPS-only endpoints. In order for a node.js application to properly communicate with the authorizer, TLS certificates must be verified.

In a development environment, the Aserto [one-box](github.com/aserto-dev/aserto-one) automatically creates a set of self-signed certificates and certificates of the CA (certificate authority) that signed them. It places them in a well-known location on the filesystem, defaulting to `$HOME/.config/aserto/aserto-one/certs/`.

In order for the `express-jwt-aserto` package to perform the TLS handshake, it needs to verify the TLS certificate of the one-box using the certificate of the CA that signed it - which was placed in `$HOME/.config/aserto/aserto-one/certs/aserto-one-gateway-ca.crt`.

When packaging an application for deployment (e.g. in a Docker container), you must copy this CA certificate into the container as part of the Docker build (typically performed in the Dockerfile). When you do that, you'll need to override the `authorizerCertFile` option that is passed into any of the API calls defined above with the location of this cert file.

Alternately, to ignore TLS certificate validation when creating a TLS connection to the authorizer, you can set the `disableTlsValidation` option to `true` and avoid TLS certificate validation. This option is **not recommended for production**.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker.

## Author

[Aserto](https://aserto.com) based on the original work by [Auth0](https://auth0.com).

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
