import { useContext, useMemo } from 'react';
import { KeycloakContext } from './KeycloakContext';

export const useKeycloak = () => {
  const {
    isLoggedIn = false,
    login,
    logout,
    ready = false,
    tokens = {},
  } = useContext(KeycloakContext);

  return useMemo(
    () => ({
      isLoggedIn,
      login,
      logout,
      ready,
      token: tokens?.accessToken ?? null,
    }),
    [ready, tokens],
  );
};
