import { print } from 'graphql'

import { type TadaDocumentNode } from '@core/shared/gql'

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
  const response = await fetch(session.environment.gatewayUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-graphql-client-name': 'scribe',
      Authorization: `JWT ${session.token}`
    },
    body: JSON.stringify({
      query: print(document),
      variables,
      operationName: getOperationName(document)
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
