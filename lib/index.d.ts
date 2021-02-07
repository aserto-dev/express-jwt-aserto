import * as express from 'express';

export = {
  jwtAuthz,
  accessMap,
  is
};

declare function jwtAuthz(
  options: jwtAuthz.AuthzOptions,
  policyName?: string,
  resourceKey?: string
): express.Handler;

declare namespace jwtAuthz {
  export interface AuthzOptions {
    applicationName: string;
    authorizerServiceUrl: string;
    authorizerCertFile?: string;
    disableTlsValidation?: boolean;
    useAuthorizationHeader?: boolean;
    identityHeader?: string;
    failWithError?: boolean;
  }
}

declare function accessMap(
  options: accessMap.AccessMapOptions
): express.Handler;

declare namespace accessMap {
  export interface AccessMapOptions {
    applicationName: string;
    authorizerServiceUrl: string;
    authorizerCertFile?: string;
    disableTlsValidation?: boolean;
    useAuthorizationHeader?: boolean;
    identityHeader?: string;
    failWithError?: boolean;
    endpointPath?: string;
  }
}

declare function is(
  decision: string,
  req: express.Request,
  options: is.AuthzOptions,
  policy?: is.Policy,
  resource?: is.Resource
): boolean;

declare namespace is {
  export type Policy = string;
  export type Resource = string;

  export interface AuthzOptions {
    applicationName: string;
    authorizerServiceUrl: string;
    authorizerCertFile?: string;
    disableTlsValidation?: boolean;
    useAuthorizationHeader?: boolean;
    identityHeader?: string;
    failWithError?: boolean;
  }
}
