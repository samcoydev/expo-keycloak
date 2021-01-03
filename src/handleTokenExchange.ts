import * as AuthSession from 'expo-auth-session';
import {
  AuthRequestConfig,
  AuthSessionResult,
  DiscoveryDocument,
  TokenResponse,
} from 'expo-auth-session';

export interface IHandleTokenExchange {
  response: AuthSessionResult | null;
  discovery: DiscoveryDocument | null;
  config: AuthRequestConfig;
}

export const handleTokenExchange = async ({
  response,
  discovery,
  config,
}: IHandleTokenExchange): Promise<{ tokens: TokenResponse } | null> => {
  try {
    if (response?.type === 'success' && !!discovery?.tokenEndpoint) {
      const tokens = await AuthSession.exchangeCodeAsync(
        { code: response.params.code, ...config },
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
