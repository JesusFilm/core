import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client'
import { parse } from 'graphql'
import { Observable } from 'rxjs'

import { DebounceLink } from './DebounceLink'

// Built with parse() rather than a graphql template tag — see the note in
// MutationQueueLink.spec.ts: a tagged document would be validated against the
// gateway schema by codegen, and this one is deliberately synthetic.
const MUTATION = parse(`
  mutation DebounceLinkSave($value: String!) {
    save(value: $value) {
      value
    }
  }
`)

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.empty()
})

/**
 * A terminating link that records the operations it is asked to forward and
 * resolves each one immediately, so a test can assert what survived debouncing.
 */
function createRecordingLink(): {
  link: ApolloLink
  forwarded: () => string[]
} {
  const forwarded: string[] = []

  const link = new ApolloLink((operation) => {
    forwarded.push(operation.variables.value as string)
    return new Observable<ApolloLink.Result>((observer) => {
      observer.next({ data: { save: { value: operation.variables.value } } })
      observer.complete()
    })
  })

  return { link, forwarded: () => forwarded }
}

function execute(
  link: ApolloLink,
  value: string,
  context: Record<string, unknown>
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    ApolloLink.execute(
      link,
      { query: MUTATION, variables: { value }, context },
      { client }
    ).subscribe({ next: resolve, error: reject })
  })
}

describe('DebounceLink', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('forwards only the last operation sharing a debounce key', async () => {
    const downstream = createRecordingLink()
    const link = ApolloLink.from([new DebounceLink(500), downstream.link])

    const first = execute(link, 'a', { debounceKey: 'field' })
    const second = execute(link, 'b', { debounceKey: 'field' })

    expect(downstream.forwarded()).toEqual([])

    await vi.advanceTimersByTimeAsync(500)

    expect(downstream.forwarded()).toEqual(['b'])
    // Both callers receive the surviving operation's result.
    await expect(first).resolves.toEqual({ data: { save: { value: 'b' } } })
    await expect(second).resolves.toEqual({ data: { save: { value: 'b' } } })
  })

  it('debounces each key independently', async () => {
    const downstream = createRecordingLink()
    const link = ApolloLink.from([new DebounceLink(500), downstream.link])

    void execute(link, 'a', { debounceKey: 'label' })
    void execute(link, 'b', { debounceKey: 'hint' })

    await vi.advanceTimersByTimeAsync(500)

    expect(downstream.forwarded().sort()).toEqual(['a', 'b'])
  })

  it('honours a per-operation debounceTimeout', async () => {
    const downstream = createRecordingLink()
    const link = ApolloLink.from([new DebounceLink(500), downstream.link])

    void execute(link, 'a', { debounceKey: 'field', debounceTimeout: 100 })

    await vi.advanceTimersByTimeAsync(100)

    expect(downstream.forwarded()).toEqual(['a'])
  })

  it('forwards operations without a debounce key immediately', async () => {
    const downstream = createRecordingLink()
    const link = ApolloLink.from([new DebounceLink(500), downstream.link])

    const result = execute(link, 'a', {})

    expect(downstream.forwarded()).toEqual(['a'])
    await expect(result).resolves.toEqual({ data: { save: { value: 'a' } } })
  })
})
