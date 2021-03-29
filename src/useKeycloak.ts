import { useCallback, useContext, useMemo } from 'react';
import { KeycloakContext } from './KeycloakContext';

import jwt_decode from './utils/jwt-decode';

export const useKeycloak = () => {
  const {
    isLoggedIn = false,
    login,
    logout,
    ready = false,
    tokens = {},
    loadUserInfo,
  } = useContext(KeycloakContext);

  const hasRealmRole = useCallback(
    (role: string) => {
      if (tokens.accessToken) {
        const { realm_access: { roles = [] } = {} } = jwt_decode(
          tokens.accessToken,
        );
        roles.includes(role);
      }
    },
    [tokens.accessToken],
  );

  const accessTokenParsed = useMemo(
    () => (tokens.accessToken ? jwt_decode(tokens.accessToken) : {}),
    [tokens.accessToken],
  );

  return {
    isLoggedIn,
    login,
    logout,
    ready,
    accessToken: tokens?.accessToken ?? null,
    accessTokenParsed,
    hasRealmRole,
    loadUserInfo,
  };
};
