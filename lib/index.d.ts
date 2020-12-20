import * as express from 'express';

export = {
  jwtAuthz,
  authzMap
};

declare function jwtAuthz(
  expectedScopes: jwtAuthz.AuthzScopes,
  options?: jwtAuthz.AuthzOptions
): express.Handler;

declare namespace jwtAuthz {
  export type AuthzScopes = string[];

  export interface AuthzOptions {
    failWithError?: boolean;
    customScopeKey?: string;
    customUserKey?: string;
    checkAllScopes?: boolean;
  }
}

declare function authzMap(options?: authzMap.AuthzOptions): express.Handler;

declare namespace authzMap {
  export interface AuthzOptions {
    failWithError?: boolean;
    policyFile?: string;
    endpointName?: string;
  }
}
