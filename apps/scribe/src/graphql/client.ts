import { print } from 'graphql'

import { type TadaDocumentNode } from '@core/shared/gql'

import type { ActiveSession } from '../auth/login'
import type { EnvironmentConfig } from '../config/environments'

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

function getOperationName(
  document: TadaDocumentNode<any, any>
): string | undefined {
  for (const definition of document.definitions) {
    if (definition.kind === 'OperationDefinition') {
      return definition.name?.value
    }
  }
  return undefined
}

export async function graphqlRequest<TResult>(
  session: ActiveSession,
  document: TadaDocumentNode<TResult, Record<string, never>>
): Promise<TResult>
export async function graphqlRequest<TResult, TVariables>(
  session: ActiveSession,
  document: TadaDocumentNode<TResult, TVariables>,
  variables: TVariables
): Promise<TResult>
export async function graphqlRequest<TResult, TVariables>(
  session: ActiveSession,
  document: TadaDocumentNode<TResult, TVariables>,
  variables?: TVariables
): Promise<TResult> {
  return await postGraphql({
    gatewayUrl: session.environment.gatewayUrl,
    token: session.token,
    document,
    variables
  })
}

export async function graphqlRequestUnauthenticated<TResult>(
  env: EnvironmentConfig,
  document: TadaDocumentNode<TResult, Record<string, never>>
): Promise<TResult>
export async function graphqlRequestUnauthenticated<TResult, TVariables>(
  env: EnvironmentConfig,
  document: TadaDocumentNode<TResult, TVariables>,
  variables: TVariables
): Promise<TResult>
export async function graphqlRequestUnauthenticated<TResult, TVariables>(
  env: EnvironmentConfig,
  document: TadaDocumentNode<TResult, TVariables>,
  variables?: TVariables
): Promise<TResult> {
  return await postGraphql({
    gatewayUrl: env.gatewayUrl,
    token: null,
    document,
    variables
  })
}

interface PostGraphqlOptions<TResult, TVariables> {
  gatewayUrl: string
  token: string | null
  document: TadaDocumentNode<TResult, TVariables>
  variables: TVariables | undefined
}

async function postGraphql<TResult, TVariables>(
  options: PostGraphqlOptions<TResult, TVariables>
): Promise<TResult> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-graphql-client-name': 'scribe'
  }
  if (options.token != null) {
    headers.Authorization = `JWT ${options.token}`
  }
  const response = await fetch(options.gatewayUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: print(options.document),
      variables: options.variables,
      operationName: getOperationName(options.document)
    })
  })

  if (response.status === 401) {
    throw new GraphQLRequestError(401, [
      { message: 'Unauthenticated. Run `scribe login` to refresh.' }
    ])
  }

  let payload: { data?: TResult; errors?: GraphQLErrorEntry[] }
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
