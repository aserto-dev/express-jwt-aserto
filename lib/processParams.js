// process parameters

module.exports = (req, packageName, resourceKey, policyRoot) => {
  // get the first parameter name from the route, if any (e.g. /hello/:world -> world)
  let paramKey;
  const routePath = req.route.path;
  let paramNameArray = routePath.split(':');
  if (paramNameArray.length > 1) {
    paramKey = paramNameArray[1].split('/')[0];
  }
  // override the parameter key if a resource key is provided by the caller
  if (resourceKey) {
    paramKey = resourceKey;
  }

  // if a package name was not provided, construct it from the route path
  if (!packageName) {
    let route = routePath;
    // replace the Express.js ':param' convention with the '__param' Rego convention
    if (paramKey) {
      route = routePath.replace(`:${paramKey}`, `__${paramKey}`);
    }
    // replace all '/' path components with '.' separators
    route = route.replace(/\//g, '.');
    // construct the policy name as appname.METHOD.route
    packageName = `${policyRoot}.${req.method}${route}`;
  }

  // replace all '/' path components with '.' separators
  const policy = packageName.replace(/\//g, '.');

  // initialize the resource value from the parameters map based on the param key
  const resource = paramKey ? req.params[paramKey] : '';

  return {
    policy,
    resource
  };
};
