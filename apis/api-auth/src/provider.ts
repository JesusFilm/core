import OidcProvider, {
  type AllClientMetadata,
  type Configuration,
  errors,
  interactionPolicy
} from 'oidc-provider'

import type { AuthConfig } from './config'
import type { Identity } from './identity'
import { createMetadataFetcher } from './metadataFetch'
import { type Database, adapterFactory, databaseTime } from './store'

export function validateClient(
  metadata: AllClientMetadata,
  config: AuthConfig
): void {
  if (
    metadata.client_id === config.AUTH_INTROSPECTION_CLIENT_ID &&
    metadata.client_secret === config.AUTH_INTROSPECTION_CLIENT_SECRET &&
    metadata.grant_types?.length === 0 &&
    metadata.redirect_uris?.length === 0
  )
    return
  if (
    metadata.token_endpoint_auth_method !== 'none' ||
    metadata.application_type === 'native' ||
    metadata.grant_types?.some(
      (type) => !['authorization_code', 'refresh_token'].includes(type)
    ) ||
    metadata.response_types?.some((type) => type !== 'code') ||
    metadata.jwks_uri ||
    metadata.sector_identifier_uri ||
    metadata.request_uris ||
    !metadata.redirect_uris?.length ||
    metadata.redirect_uris.length > 5 ||
    (metadata.client_name?.length ?? 0) > 120
  )
    throw new errors.InvalidClientMetadata('Unsupported client metadata')
  for (const redirect of metadata.redirect_uris) {
    const url = new URL(redirect)
    const local =
      config.AUTH_ENVIRONMENT === 'local' &&
      ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    if (
      (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) ||
      url.username ||
      url.password ||
      url.hash ||
      redirect.length > 2048
    ) {
      throw new errors.InvalidClientMetadata('Unsafe redirect')
    }
  }
}

export function createProvider(
  config: AuthConfig,
  db: Database,
  identity: Identity
): { provider: OidcProvider; close: () => Promise<void> } {
  const metadata = createMetadataFetcher()
  const policy = interactionPolicy.base()
  policy
    .get('consent')!
    .checks.add(
      new interactionPolicy.Check(
        'explicit_approval',
        'Explicit approval required',
        (ctx) => !ctx.oidc.result?.consent
      )
    )
  const settings: Configuration = {
    adapter: adapterFactory(db, config, (evidence) => identity.check(evidence)),
    jwks: config.AUTH_JWKS,
    cookies: {
      keys: config.AUTH_COOKIE_KEYS,
      short: {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.AUTH_ENVIRONMENT !== 'local'
      },
      long: {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.AUTH_ENVIRONMENT !== 'local'
      }
    },
    clients: [
      {
        client_id: config.AUTH_INTROSPECTION_CLIENT_ID,
        client_secret: config.AUTH_INTROSPECTION_CLIENT_SECRET,
        grant_types: [],
        response_types: [],
        redirect_uris: [],
        token_endpoint_auth_method: 'client_secret_basic'
      },
      ...config.AUTH_CLIENTS.map((client) => ({
        ...client,
        token_endpoint_auth_method: 'none' as const,
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'] as const
      }))
    ],
    clientDefaults: {
      token_endpoint_auth_method: 'none',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code']
    },
    extraClientMetadata: {
      properties: ['journeys_policy'],
      validator(_ctx, _key, _value, metadata) {
        validateClient(metadata, config)
      }
    },
    responseTypes: ['code'],
    scopes: ['offline_access'],
    pkce: { required: () => true },
    interactions: {
      policy,
      url: (_ctx, interaction) => `/interaction/${interaction.uid}`
    },
    features: {
      devInteractions: { enabled: false },
      userinfo: { enabled: false },
      registration: { enabled: true, issueRegistrationAccessToken: false },
      registrationManagement: { enabled: false },
      introspection: {
        enabled: true,
        allowedPolicy: (ctx) =>
          ctx.oidc.client?.clientId === config.AUTH_INTROSPECTION_CLIENT_ID
      },
      clientIdMetadataDocument: {
        enabled: true,
        ack: 'draft-03',
        allowFetch: (_ctx, clientId) =>
          config.AUTH_CIMD_ORIGINS.includes(new URL(clientId).origin),
        allowClient: (_ctx, client) =>
          config.AUTH_CIMD_ORIGINS.includes(new URL(client.clientId).origin)
      },
      resourceIndicators: {
        enabled: true,
        defaultResource: () => config.AUTH_AUDIENCE,
        useGrantedResource: () => true,
        getResourceServerInfo: (_ctx, resource) => {
          if (resource !== config.AUTH_AUDIENCE)
            throw new errors.InvalidTarget('Invalid resource')
          return {
            scope: 'journeys:read journeys:edit',
            audience: config.AUTH_AUDIENCE,
            accessTokenFormat: 'opaque',
            accessTokenTTL: 300
          }
        }
      }
    },
    extraParams: {
      redirect_uri(ctx, value, client) {
        if (!value || !client.redirectUris?.includes(value))
          throw new errors.InvalidRequest('Exact redirect required')
        if (ctx.oidc.params?.resource !== config.AUTH_AUDIENCE)
          throw new errors.InvalidTarget('Explicit resource required')
      }
    },
    ttl: {
      AccessToken: 300,
      AuthorizationCode: 60,
      Interaction: 600,
      Session: 600,
      Grant: 366 * 86400,
      RefreshToken: 366 * 86400
    },
    issueRefreshToken: (_ctx, client) =>
      client.grantTypeAllowed('refresh_token'),
    rotateRefreshToken: true,
    expiresWithSession: () => false,
    findAccount: (_ctx, accountId) => ({
      accountId,
      claims: () => ({ sub: accountId })
    }),
    loadExistingGrant: async (ctx) => {
      const grantId = ctx.oidc.result?.consent?.grantId
      return grantId ? ctx.oidc.provider.Grant.find(grantId) : undefined
    },
    async extraTokenClaims(_ctx, token) {
      const connection =
        'grantId' in token && token.grantId
          ? await db.agentConnection.findUnique({
              where: { grantId: token.grantId }
            })
          : null
      if (
        !connection ||
        connection.revokedAt ||
        connection.expiresAt <= (await databaseTime(db))
      )
        throw new errors.InvalidGrant('Consent unavailable')
      await identity.check({
        userId: connection.userId,
        authTime: connection.firebaseAuthTime,
        createdAt: connection.firebaseCreatedAt
      })
      return {
        iss: config.AUTH_ISSUER,
        environment: connection.environment,
        connection_id: connection.id,
        grant_version: connection.version,
        consent_expires_at: Math.floor(connection.expiresAt.getTime() / 1000),
        journey_ids: connection.journeyIds,
        mode: connection.mode
      }
    },
    fetch: metadata.fetch,
    fetchResponseBodyLimits: {
      'client_id metadata document': 16384,
      jwks_uri: 8192,
      sector_identifier_uri: 8192
    },
    renderError(ctx, output) {
      ctx.type = 'application/json'
      ctx.body = { error: output.error }
    }
  }
  const provider = new OidcProvider(config.AUTH_ISSUER, settings)
  provider.silent = true
  provider.on('authorization.error', (ctx) => {
    ctx.state.authorizationDenied = true
  })
  provider.on('server_error', () => undefined)
  return { provider, close: metadata.close }
}
