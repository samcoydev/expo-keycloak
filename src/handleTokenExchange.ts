import {
  AccessTokenRequestConfig,
  AuthRequest,
  AuthRequestConfig,
  AuthSessionResult,
  DiscoveryDocument,
  // TokenResponse,
  exchangeCodeAsync,
} from 'expo-auth-session'
import { TokenType } from './storage/tokenStorage'

export interface IHandleTokenExchange {
  response: AuthSessionResult | null
  request: AuthRequest | null
  discovery: DiscoveryDocument | null
  config: AuthRequestConfig
  usePKCE: boolean
}

export const handleTokenExchange = async ({
  response,
  request,
  discovery,
  config,
  usePKCE,
}: IHandleTokenExchange): Promise<TokenType | null> => {
  try {
    if (response?.type === 'success' && !!discovery?.tokenEndpoint) {
      const accessTokenConfig: AccessTokenRequestConfig = {
        code: response.params.code,
        ...config,
      }

      if (usePKCE && !!request?.codeVerifier)
        accessTokenConfig.extraParams = {
          code_verifier: request.codeVerifier,
        }

      const tokens = await exchangeCodeAsync(accessTokenConfig, discovery)
      return tokens as TokenType
    }

    if (response?.type === 'error') {
      return null
    }

    return null
  } catch {
    return null
  }
}
