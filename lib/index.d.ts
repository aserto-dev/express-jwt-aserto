import * as express from 'express';

export = {
  jwtAuthz,
  displayStateMap,
  is
};

declare function jwtAuthz(
  options: jwtAuthz.AuthzOptions,
  policyRoot?: string,
  resourceKey?: string
): express.Handler;

declare namespace jwtAuthz {
  export interface AuthzOptions {
    policyRoot: string;
    policyId: string;
    authorizerServiceUrl: string;
    authorizerApiKey?: string;
    tenantId?: string;
    authorizerCertFile?: string;
    disableTlsValidation?: boolean;
    useAuthorizationHeader?: boolean;
    identityHeader?: string;
    failWithError?: boolean;
    customUserKey?: string;
    customSubjectKey?: string;
  }
}

declare function displayStateMap(
  options: displayStateMap.DisplayStateMapOptions
): express.Handler;

declare namespace displayStateMap {
  export interface DisplayStateMapOptions {
    policyRoot: string;
    policyId: string;
    authorizerServiceUrl: string;
    authorizerApiKey?: string;
    tenantId?: string;
    authorizerCertFile?: string;
    disableTlsValidation?: boolean;
    useAuthorizationHeader?: boolean;
    identityHeader?: string;
    failWithError?: boolean;
    customUserKey?: string;
    customSubjectKey?: string;
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
    policyRoot: string;
    policyId: string;
    authorizerServiceUrl: string;
    authorizerApiKey?: string;
    tenantId?: string;
    authorizerCertFile?: string;
    disableTlsValidation?: boolean;
    useAuthorizationHeader?: boolean;
    identityHeader?: string;
    failWithError?: boolean;
    customUserKey?: string;
    customSubjectKey?: string;
  }
}
