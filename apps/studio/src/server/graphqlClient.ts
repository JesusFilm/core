interface GraphQLRequestOptions {
  variables?: Record<string, any>
  token?: string
}

interface GraphQLError {
  message?: string
}

interface GraphQLResponse<TData> {
  data?: TData
  errors?: GraphQLError[]
}

const DEFAULT_CLIENT_NAME = 'studio'

const resolveAuthHeader = (token?: string): string | undefined => {
  const rawToken =
    token ??
    process.env.STUDIO_GRAPHQL_JWT ??
    process.env.JWT_TOKEN ??
    process.env.STUDIO_MUX_GRAPHQL_JWT

  if (!rawToken) return undefined

  if (rawToken.startsWith('Bearer ') || rawToken.startsWith('JWT ')) {
    return rawToken
  }

  return `JWT ${rawToken}`
}

export async function callStudioGraphQL<TData>(
  query: string,
  { variables, token }: GraphQLRequestOptions = {}
): Promise<TData> {
  const endpoint = process.env.NEXT_PUBLIC_GATEWAY_URL

  if (!endpoint) {
    throw new Error('NEXT_PUBLIC_GATEWAY_URL is not configured. Unable to contact GraphQL API.')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-graphql-client-name': DEFAULT_CLIENT_NAME,
    'x-graphql-client-version':
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? 'local-dev'
  }

  const authHeader = resolveAuthHeader(token)
  if (authHeader) {
    headers.Authorization = authHeader
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables })
  })

  const payload = (await response.json()) as GraphQLResponse<TData>

  if (!response.ok || payload.errors?.length) {
    const firstError = payload.errors?.[0]?.message ?? response.statusText
    throw new Error(firstError || 'GraphQL request failed')
  }

  if (!payload.data) {
    throw new Error('GraphQL response did not include data')
  }

  return payload.data
}

