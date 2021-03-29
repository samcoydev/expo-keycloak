import { IKeycloakConfiguration } from './KeycloakProvider'

export const getRealmURL = (config: IKeycloakConfiguration) => {
  const { url, realm } = config
  const slash = url.endsWith('/') ? '' : '/'
  return `${url + slash}realms/${encodeURIComponent(realm)}`
}
