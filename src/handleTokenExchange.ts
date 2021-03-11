import * as AuthSession from 'expo-auth-session';
import {
  AuthRequestConfig,
  AuthSessionResult,
  DiscoveryDocument,
  TokenResponse,
  AuthRequest,
  AccessTokenRequestConfig,
} from 'expo-auth-session';

export interface IHandleTokenExchange {
  response: AuthSessionResult | null;
  request: AuthRequest | null;
  discovery: DiscoveryDocument | null;
  config: AuthRequestConfig;
  usePKCE: boolean;
}

export const handleTokenExchange = async ({
  response,
  request,
  discovery,
  config,
  usePKCE,
}: IHandleTokenExchange): Promise<{ tokens: TokenResponse } | null> => {
  try {
    if (response?.type === 'success' && !!discovery?.tokenEndpoint) {
      const accessTokenConfig: AccessTokenRequestConfig = {
        code: response.params.code,
        ...config,
      };

      if (usePKCE && !!request?.codeVerifier)
        accessTokenConfig.extraParams = {
          code_verifier: request.codeVerifier,
        };

      const tokens = await AuthSession.exchangeCodeAsync(
        accessTokenConfig,
        discovery,
      );
      return { tokens };
    }

    if (response?.type === 'error') {
      return null;
    }

    return null;
  } catch {
    return null;
  }
};
