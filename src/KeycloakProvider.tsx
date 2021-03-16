import React, { FC, useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import {
  TokenResponse,
  useAuthRequest,
  useAutoDiscovery,
} from 'expo-auth-session';
import { AuthRequestConfig } from 'expo-auth-session/src/AuthRequest.types';

import { getRealmURL } from './getRealmURL';
import { KeycloakContext } from './KeycloakContext';
import useAsyncStorage from './useAsyncStorage';
import { handleTokenExchange } from './handleTokenExchange';
import {
  NATIVE_REDIRECT_PATH,
  REFRESH_TIME_BUFFER,
  TOKEN_STORAGE_KEY,
} from './const';

export interface IKeycloakConfiguration extends Partial<AuthRequestConfig> {
  usePKCE?: boolean;
  clientId: string;
  disableAutoRefresh?: boolean;
  nativeRedirectPath?: string;
  realm: string;
  refreshTimeBuffer?: number;
  scheme?: string;
  tokenStorageKey?: string;
  url: string;
}

export const KeycloakProvider: FC<IKeycloakConfiguration> = ({
  usePKCE = false,
  ...props
}) => {
  const useProxy = Platform.select({ web: false, native: !props.scheme });

  const [refreshHandle, setRefreshHandle] = useState<any>(null);

  const discovery = useAutoDiscovery(getRealmURL(props));
  const redirectUri = AuthSession.makeRedirectUri({
    native: `${props.scheme ?? 'exp'}://${
      props.nativeRedirectPath ?? NATIVE_REDIRECT_PATH
    }`,
    useProxy,
  });

  const [
    savedTokens,
    saveTokens,
    hydrated,
  ] = useAsyncStorage<TokenResponse | null>(
    props.tokenStorageKey ?? TOKEN_STORAGE_KEY,
    null,
  );

  const config: AuthRequestConfig = { redirectUri, ...props };

  const [request, response, promptAsync] = useAuthRequest(
    { usePKCE, ...config },
    discovery,
  );

  const updateState = useCallback(
    (callbackValue: any) => {
      const tokens = callbackValue?.tokens ?? null;
      if (!!tokens) {
        saveTokens(tokens);
        if (
          !props.disableAutoRefresh &&
          !!(tokens as TokenResponse).expiresIn
        ) {
          clearTimeout(refreshHandle);
          setRefreshHandle(
            setTimeout(
              handleTokenRefresh,
              ((tokens as TokenResponse).expiresIn! -
                (props.refreshTimeBuffer ?? REFRESH_TIME_BUFFER)) *
                1000,
            ),
          );
        }
      } else {
        saveTokens(null);
        clearTimeout(refreshHandle);
        setRefreshHandle(null);
      }
    },
    [saveTokens, refreshHandle, setRefreshHandle],
  );

  const handleTokenRefresh = useCallback(() => {
    if (!hydrated) return;
    if (!savedTokens && hydrated) {
      updateState(null);
      return;
    }
    if (TokenResponse.isTokenFresh(savedTokens!)) {
      updateState({ tokens: savedTokens });
    }
    // if (!discovery)
    //   throw new Error('KC Not Initialized. - Discovery not ready.');
    AuthSession.refreshAsync(
      { refreshToken: savedTokens!.refreshToken, ...config },
      discovery!,
    )
      .catch(updateState)
      .then(updateState);
  }, [discovery, hydrated, savedTokens, updateState]);

  const handleLogin = useCallback(async () => {
    clearTimeout(refreshHandle);
    return promptAsync({ useProxy });
  }, [promptAsync, refreshHandle]);

  const handleLogout = useCallback(
    async (everywhere?: boolean) => {
      if (!savedTokens) throw new Error('Not logged in.');
      if (everywhere) {
        AuthSession.revokeAsync(
          { token: savedTokens?.accessToken!, ...config },
          discovery!,
        ).catch((e) => console.error(e));
        saveTokens(null);
      } else {
        if (Platform.OS !== 'android') {
          AuthSession.dismiss();
        }

        saveTokens(null);
      }
    },
    [discovery, savedTokens],
  );

  useEffect(() => {
    if (hydrated) handleTokenRefresh();
  }, [hydrated]);

  useEffect(() => {
    handleTokenExchange({ response, discovery, config, request, usePKCE }).then(
      updateState,
    );
  }, [response]);

  return (
    <KeycloakContext.Provider
      value={{
        isLoggedIn: !props.disableAutoRefresh && !!savedTokens,
        login: handleLogin,
        logout: handleLogout,
        ready: request !== null,
        tokens: savedTokens,
      }}
    >
      {props.children}
    </KeycloakContext.Provider>
  );
};
