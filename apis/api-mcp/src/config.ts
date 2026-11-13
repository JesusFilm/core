export interface McpConfig {
  host: string
  port: number
  publicUrl: URL
  issuerUrl?: URL
  gatewayUrl?: URL
  requestDeadlineMs: number
  drainDeadlineMs: number
  maxRequestBytes: number
  maxResponseBytes: number
  maxConcurrentRequests: number
  admissionEnabled: boolean
}

function integer(
  env: NodeJS.ProcessEnv,
  name: string,
  fallback: number,
  maximum: number
): number {
  const value = env[name] ?? String(fallback)
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > maximum) {
    throw new Error(`Invalid ${name}`)
  }
  return Number(value)
}

function endpoint(value: string | undefined, name: string): URL {
  try {
    const url = new URL(value ?? '')
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    if (
      (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      throw new Error('Invalid endpoint')
    }
    return url
  } catch {
    throw new Error(`Invalid ${name}`)
  }
}

export function readConfig(env: NodeJS.ProcessEnv): McpConfig {
  if (env.MCP_AUTH_MODE !== 'disabled') {
    throw new Error(
      'MCP_AUTH_MODE must be disabled until identity is integrated'
    )
  }
  const publicUrl = endpoint(env.MCP_PUBLIC_URL, 'MCP_PUBLIC_URL')
  if (['/', '/health', '/ready'].includes(publicUrl.pathname)) {
    throw new Error('MCP_PUBLIC_URL requires a distinct MCP path')
  }
  if (
    env.MCP_ADMISSION_ENABLED !== undefined &&
    !['true', 'false'].includes(env.MCP_ADMISSION_ENABLED)
  ) {
    throw new Error('Invalid MCP_ADMISSION_ENABLED')
  }
  const host = env.MCP_HOST ?? '127.0.0.1'
  if (!host || host.trim() !== host) throw new Error('Invalid MCP_HOST')
  return {
    host,
    port: integer(env, 'MCP_PORT', 4010, 65535),
    publicUrl,
    issuerUrl: env.MCP_ISSUER_URL
      ? endpoint(env.MCP_ISSUER_URL, 'MCP_ISSUER_URL')
      : undefined,
    gatewayUrl: env.MCP_GATEWAY_URL
      ? endpoint(env.MCP_GATEWAY_URL, 'MCP_GATEWAY_URL')
      : undefined,
    requestDeadlineMs: integer(env, 'MCP_REQUEST_DEADLINE_MS', 20000, 20000),
    drainDeadlineMs: integer(env, 'MCP_DRAIN_DEADLINE_MS', 10000, 30000),
    maxRequestBytes: integer(env, 'MCP_MAX_REQUEST_BYTES', 262144, 1048576),
    maxResponseBytes: integer(env, 'MCP_MAX_RESPONSE_BYTES', 1048576, 4194304),
    maxConcurrentRequests: integer(env, 'MCP_MAX_CONCURRENT_REQUESTS', 64, 256),
    admissionEnabled: env.MCP_ADMISSION_ENABLED !== 'false'
  }
}
