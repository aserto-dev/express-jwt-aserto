import * as express from 'express';

export = {
  jwtAuthz,
  accessMap
};

declare function jwtAuthz(
  expectedScopes: jwtAuthz.AuthzScopes,
  options?: jwtAuthz.AuthzOptions
): express.Handler;

declare namespace jwtAuthz {
  export type AuthzScopes = string[];

  export interface AuthzOptions {
    authorizerServiceUrl: string;
    applicationName: string;
    failWithError?: boolean;
    customScopeKey?: string;
    customUserKey?: string;
    checkAllScopes?: boolean;
  }
}

declare function accessMap(
  options?: accessMap.AccessMapOptions
): express.Handler;

declare namespace accessMap {
  export interface AccessMapOptions {
    authorizerServiceUrl: string;
    applicationName: string;
    failWithError?: boolean;
    customUserKey?: string;
    endpointPath?: string;
  }
}
