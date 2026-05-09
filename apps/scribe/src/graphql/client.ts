import type { ActiveSession } from '../auth/login'

export interface GraphQLErrorEntry {
  message: string
  path?: ReadonlyArray<string | number>
  extensions?: Record<string, unknown>
}

export class GraphQLRequestError extends Error {
  readonly errors: GraphQLErrorEntry[]
  readonly status: number

  constructor(status: number, errors: GraphQLErrorEntry[]) {
    super(
      errors.length > 0
        ? errors.map((error) => error.message).join('; ')
        : `GraphQL request failed with status ${status}`
    )
    this.name = 'GraphQLRequestError'
    this.errors = errors
    this.status = status
  }
}

interface RequestInput<TVariables> {
  query: string
  variables?: TVariables
  operationName?: string
}

export async function graphqlRequest<TData, TVariables = Record<string, unknown>>(
  session: ActiveSession,
  input: RequestInput<TVariables>
): Promise<TData> {
  const response = await fetch(session.environment.gatewayUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-graphql-client-name': 'scribe',
      Authorization: `JWT ${session.token}`
    },
    body: JSON.stringify(input)
  })

  if (response.status === 401) {
    throw new GraphQLRequestError(401, [
      { message: 'Unauthenticated. Run `scribe login` to refresh.' }
    ])
  }

  let payload: { data?: TData; errors?: GraphQLErrorEntry[] }
  try {
    payload = (await response.json()) as typeof payload
  } catch {
    throw new GraphQLRequestError(response.status, [
      { message: `Non-JSON response (HTTP ${response.status}).` }
    ])
  }

  if (payload.errors != null && payload.errors.length > 0) {
    throw new GraphQLRequestError(response.status, payload.errors)
  }

  if (payload.data == null) {
    throw new GraphQLRequestError(response.status, [
      { message: 'GraphQL response missing data.' }
    ])
  }

  return payload.data
}
