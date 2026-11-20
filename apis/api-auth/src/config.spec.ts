import { readConfig } from './config'

const base = {
  AUTH_ENVIRONMENT: 'local',
  AUTH_ISSUER: 'http://127.0.0.1:4011',
  AUTH_ADMIN_ORIGIN: 'http://127.0.0.1:4201',
  AUTH_AUDIENCE: 'http://127.0.0.1:4012/mcp',
  AUTH_GATEWAY_URL: 'http://127.0.0.1:4000/graphql',
  AUTH_FIREBASE_PROJECT_ID: 'controlled-permissions',
  AUTH_COOKIE_KEYS: 'controlled-cookie-key-with-at-least-32-characters',
  AUTH_JWKS: JSON.stringify({
    keys: [{ kty: 'RSA', d: 'fixture', kid: 'test' }]
  }),
  AUTH_INTROSPECTION_CLIENT_ID: 'permissions-client',
  AUTH_INTROSPECTION_CLIENT_SECRET:
    'controlled-introspection-secret-at-least-32',
  PG_DATABASE_URL_AUTH:
    'postgresql://controlled:controlled@127.0.0.1:5432/permissions'
}
const reads = {
  AUTH_EXCHANGE_CLIENT_SECRET: 'controlled-exchange-secret-at-least-32',
  AUTH_READ_OWNER_SECRET: 'controlled-read-owner-secret-at-least-32',
  AUTH_READ_GATEWAY_AUDIENCE: 'http://127.0.0.1:4000/mcp'
}
const permissions = {
  AUTH_PERMISSION_JOURNEYS_SECRET: 'controlled-journeys-secret-at-least-32',
  AUTH_PERMISSION_USERS_SECRET: 'controlled-users-secret-at-least-32'
}

describe('permission coordination configuration', () => {
  it('cannot enable granted reads without both permission owners', () => {
    expect(() => readConfig({ ...base, ...reads })).toThrow(
      'Permission participants required'
    )
    expect(() =>
      readConfig({
        ...base,
        ...reads,
        AUTH_PERMISSION_JOURNEYS_SECRET:
          permissions.AUTH_PERMISSION_JOURNEYS_SECRET
      })
    ).toThrow('Permission participants required')
    expect(readConfig({ ...base, ...reads, ...permissions })).toMatchObject(
      permissions
    )
  })

  it.each([
    ['AUTH_PERMISSION_JOURNEYS_SECRET', 'AUTH_PERMISSION_USERS_SECRET'],
    ['AUTH_PERMISSION_JOURNEYS_SECRET', 'AUTH_READ_OWNER_SECRET'],
    ['AUTH_PERMISSION_USERS_SECRET', 'AUTH_EXCHANGE_CLIENT_SECRET'],
    ['AUTH_PERMISSION_USERS_SECRET', 'AUTH_INTROSPECTION_CLIENT_SECRET']
  ] as const)('separates %s from %s', (first, second) => {
    const configured = { ...base, ...reads, ...permissions }
    expect(() =>
      readConfig({ ...configured, [first]: configured[second] })
    ).toThrow('Separate service credentials required')
  })

  it('preserves disabled legacy operation but rejects a half-configured participant', () => {
    expect(readConfig(base).AUTH_PERMISSION_JOURNEYS_SECRET).toBeUndefined()
    expect(() =>
      readConfig({
        ...base,
        AUTH_PERMISSION_USERS_SECRET: permissions.AUTH_PERMISSION_USERS_SECRET
      })
    ).toThrow('Permission participants required')
  })
})
