import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client'
import { parse } from 'graphql'
import { Observable, Observer } from 'rxjs'

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

  it('clears pending requests when forwarding completes synchronously', async () => {
    const downstream = createRecordingLink()
    const debounceLink = new DebounceLink(500)
    const link = ApolloLink.from([debounceLink, downstream.link])
    expect(debounceLink.hasPending()).toBe(false)

    const saved = execute(link, 'a', { debounceKey: 'field' })

    expect(debounceLink.hasPending()).toBe(true)
    await vi.advanceTimersByTimeAsync(500)
    expect(downstream.forwarded()).toEqual(['a'])
    expect(debounceLink.hasPending()).toBe(false)
    await saved
  })

  it.each(['complete', 'error', 'unsubscribe'] as const)(
    'keeps a forwarded write pending until %s',
    async (settlement) => {
      let sink: Observer<ApolloLink.Result> | undefined
      const teardown = vi.fn()
      const downstream = new ApolloLink(
        () =>
          new Observable<ApolloLink.Result>((observer) => {
            sink = observer
            return teardown
          })
      )
      const debounceLink = new DebounceLink(500)
      const link = ApolloLink.from([debounceLink, downstream])
      const onError = vi.fn()
      const subscription = ApolloLink.execute(
        link,
        {
          query: MUTATION,
          variables: { value: 'a' },
          context: { debounceKey: 'field' }
        },
        { client }
      ).subscribe({ error: onError })

      expect(debounceLink.hasPending()).toBe(true)
      await vi.advanceTimersByTimeAsync(500)
      expect(sink).toBeDefined()
      expect(debounceLink.hasPending()).toBe(true)

      sink?.next({ data: { save: { value: 'a' } } })
      expect(debounceLink.hasPending()).toBe(true)

      if (settlement === 'unsubscribe') subscription.unsubscribe()
      else if (settlement === 'error') sink?.error(new Error('Write failed'))
      else sink?.complete()

      expect(debounceLink.hasPending()).toBe(false)
      expect(teardown).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledTimes(settlement === 'error' ? 1 : 0)
    }
  )

  it('clears pending requests when forwarding errors synchronously', async () => {
    const debounceLink = new DebounceLink(500)
    const link = ApolloLink.from([
      debounceLink,
      new ApolloLink(
        () =>
          new Observable((observer) =>
            observer.error(new Error('Write failed'))
          )
      )
    ])
    const saved = execute(link, 'a', { debounceKey: 'field' }).catch(
      (error: unknown) => error
    )

    await vi.advanceTimersByTimeAsync(500)

    expect(await saved).toEqual(new Error('Write failed'))
    expect(debounceLink.hasPending()).toBe(false)
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

  it('forwards pending operations under a prefix before the flushing operation', async () => {
    const downstream = createRecordingLink()
    const link = ApolloLink.from([new DebounceLink(500), downstream.link])

    void execute(link, 'label', { debounceKey: 'Block:1:label' })
    void execute(link, 'other', { debounceKey: 'Block:2:label' })
    void execute(link, 'delete', { debounceFlushPrefix: 'Block:1:' })

    expect(downstream.forwarded()).toEqual(['label', 'delete'])

    // The flushed key is not forwarded again when its timer would have fired.
    await vi.advanceTimersByTimeAsync(500)

    expect(downstream.forwarded()).toEqual(['label', 'delete', 'other'])
  })

  it('forwards pending operations under any prefix of a list before the flushing operation', async () => {
    const downstream = createRecordingLink()
    const link = ApolloLink.from([new DebounceLink(500), downstream.link])

    void execute(link, 'heroTitle', { debounceKey: 'Hero:1:title' })
    void execute(link, 'extraContent', { debounceKey: 'Typography:2:content' })
    void execute(link, 'other', { debounceKey: 'Typography:3:content' })
    void execute(link, 'duplicate', {
      debounceFlushPrefix: ['Hero:1:', 'Typography:2:']
    })

    expect(downstream.forwarded()).toEqual([
      'heroTitle',
      'extraContent',
      'duplicate'
    ])

    await vi.advanceTimersByTimeAsync(500)

    expect(downstream.forwarded()).toEqual([
      'heroTitle',
      'extraContent',
      'duplicate',
      'other'
    ])
  })

  it('forwards operations without a debounce key immediately', async () => {
    const downstream = createRecordingLink()
    const link = ApolloLink.from([new DebounceLink(500), downstream.link])

    const result = execute(link, 'a', {})

    expect(downstream.forwarded()).toEqual(['a'])
    await expect(result).resolves.toEqual({ data: { save: { value: 'a' } } })
  })
})
