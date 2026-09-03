import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client'
import { parse } from 'graphql'
import { Observable } from 'rxjs'

import { MutationQueueLink } from './MutationQueueLink'

// Built with parse() rather than a graphql template tag, on purpose. The link
// only cares whether an operation is a mutation or a query, so these documents
// are deliberately synthetic. A tagged template would be picked up by
// journeys-admin:codegen, which validates every tagged document against the
// gateway schema and would reject fields that do not exist there.
const MUTATION = parse(`
  mutation MutationQueueLinkSave($id: ID!) {
    save(id: $id) {
      id
    }
  }
`)

const QUERY = parse(`
  query MutationQueueLinkRead {
    read {
      id
    }
  }
`)

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.empty()
})

/**
 * A terminating link that hands back a controller per operation so a test can
 * decide exactly when each request resolves, and observe how many are in flight.
 */
function createControllableLink(): {
  link: ApolloLink
  inFlight: () => number
  resolve: (index: number, data: Record<string, unknown>) => void
  fail: (index: number, error: Error) => void
} {
  const controllers: Array<{
    next: (value: ApolloLink.Result) => void
    error: (error: Error) => void
    complete: () => void
    settled: boolean
  }> = []

  const link = new ApolloLink(
    () =>
      new Observable<ApolloLink.Result>((observer) => {
        controllers.push({
          next: (value) => observer.next(value),
          error: (error) => observer.error(error),
          complete: () => observer.complete(),
          settled: false
        })
      })
  )

  return {
    link,
    inFlight: () => controllers.filter(({ settled }) => !settled).length,
    resolve: (index, data) => {
      const controller = controllers[index]
      controller.settled = true
      controller.next({ data })
      controller.complete()
    },
    fail: (index, error) => {
      const controller = controllers[index]
      controller.settled = true
      controller.error(error)
    }
  }
}

function execute(
  link: ApolloLink,
  query: typeof MUTATION,
  variables: Record<string, unknown>
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    ApolloLink.execute(link, { query, variables }, { client }).subscribe({
      next: resolve,
      error: reject
    })
  })
}

describe('MutationQueueLink', () => {
  it('runs queued mutations one at a time', async () => {
    const downstream = createControllableLink()
    const link = ApolloLink.from([new MutationQueueLink(), downstream.link])

    const first = execute(link, MUTATION, { id: '1' })
    const second = execute(link, MUTATION, { id: '2' })

    // Only the first reached the terminating link; the second is queued.
    expect(downstream.inFlight()).toBe(1)

    downstream.resolve(0, { save: { id: '1' } })
    await expect(first).resolves.toEqual({ data: { save: { id: '1' } } })

    expect(downstream.inFlight()).toBe(1)
    downstream.resolve(1, { save: { id: '2' } })
    await expect(second).resolves.toEqual({ data: { save: { id: '2' } } })
  })

  it('releases the queue when a mutation fails', async () => {
    const downstream = createControllableLink()
    const link = ApolloLink.from([new MutationQueueLink(), downstream.link])

    const first = execute(link, MUTATION, { id: '1' })
    const second = execute(link, MUTATION, { id: '2' })

    downstream.fail(0, new Error('save failed'))
    await expect(first).rejects.toThrow('save failed')

    downstream.resolve(1, { save: { id: '2' } })
    await expect(second).resolves.toEqual({ data: { save: { id: '2' } } })
  })

  it('forwards queries without queueing them', async () => {
    const downstream = createControllableLink()
    const link = ApolloLink.from([new MutationQueueLink(), downstream.link])

    const first = execute(link, QUERY, {})
    const second = execute(link, QUERY, {})

    // Neither waits on the other.
    expect(downstream.inFlight()).toBe(2)

    downstream.resolve(1, { read: { id: '2' } })
    downstream.resolve(0, { read: { id: '1' } })
    await expect(first).resolves.toEqual({ data: { read: { id: '1' } } })
    await expect(second).resolves.toEqual({ data: { read: { id: '2' } } })
  })

  it('skips the queue when the context opts out', async () => {
    const downstream = createControllableLink()
    const link = ApolloLink.from([new MutationQueueLink(), downstream.link])

    const queued = execute(link, MUTATION, { id: '1' })
    expect(downstream.inFlight()).toBe(1)

    const skipped = new Promise((resolve, reject) => {
      ApolloLink.execute(
        link,
        {
          query: MUTATION,
          variables: { id: '2' },
          context: { skipQueue: true }
        },
        { client }
      ).subscribe({ next: resolve, error: reject })
    })

    // The opted-out mutation went straight through rather than queueing.
    expect(downstream.inFlight()).toBe(2)

    downstream.resolve(1, { save: { id: '2' } })
    await expect(skipped).resolves.toEqual({ data: { save: { id: '2' } } })

    downstream.resolve(0, { save: { id: '1' } })
    await expect(queued).resolves.toEqual({ data: { save: { id: '1' } } })
  })
})
