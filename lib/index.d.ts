import * as express from 'express';

export = {
  jwtAuthz,
  accessMap,
  isAllowed
};

declare function jwtAuthz(
  options: jwtAuthz.AuthzOptions,
  policyName?: string,
  resourceKey?: string
): express.Handler;

declare namespace jwtAuthz {
  export interface AuthzOptions {
    authorizerServiceUrl: string;
    applicationName: string;
    useAuthorizationHeader?: boolean;
    identityHeader?: string;
    failWithError?: boolean;
    customUserKey?: string;
    customSubjectKey?: string;
  }
}

declare function accessMap(
  options: accessMap.AccessMapOptions
): express.Handler;

declare namespace accessMap {
  export interface AccessMapOptions {
    authorizerServiceUrl: string;
    applicationName: string;
    useAuthorizationHeader?: boolean;
    identityHeader?: string;
    failWithError?: boolean;
    customUserKey?: string;
    customSubjectKey?: string;
    endpointPath?: string;
  }
}

declare function isAllowed(
  options: isAllowed.AuthzOptions,
  policy: isAllowed.Policy,
  resource: isAllowed.Resource
): express.Handler;

declare namespace isAllowed {
  export type Policy = string;
  export type Resource = string;

  export interface AuthzOptions {
    authorizerServiceUrl: string;
    applicationName: string;
    useAuthorizationHeader?: boolean;
    identityHeader?: string;
    failWithError?: boolean;
    customUserKey?: string;
    customSubjectKey?: string;
  }
}
