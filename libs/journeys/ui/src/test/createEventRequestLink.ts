import { ApolloLink } from '@apollo/client'
import { Kind } from 'graphql'
import { Observable } from 'rxjs'

/**
 * Records event requests and returns minimal successful event responses.
 * Tests can fail captures or leave interactions pending to verify independence.
 */
export function createEventRequestLink({
  failCaptures = false,
  pendingInteractions = false
} = {}) {
  const requests: { name: string; input: Record<string, unknown> }[] = []
  const link = new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        const name = operation.operationName ?? ''
        const definition = operation.query.definitions.find(
          (item) => item.kind === Kind.OPERATION_DEFINITION
        )
        const selection = definition?.selectionSet.selections[0]
        const field = selection?.kind === Kind.FIELD ? selection.name.value : ''
        requests.push({ name, input: operation.variables.input })
        const isCapture = name.includes('CaptureEventCreate')
        if (isCapture && failCaptures) {
          observer.error(new Error('capture unavailable'))
          return
        }
        if (!isCapture && pendingInteractions) return
        observer.next({
          data: {
            [field]: {
              id: operation.variables.input.id ?? 'server-event',
              __typename: (field[0].toUpperCase() + field.slice(1)).replace(
                /Create$/,
                ''
              )
            }
          }
        })
        observer.complete()
      })
  )
  return { link, requests }
}
