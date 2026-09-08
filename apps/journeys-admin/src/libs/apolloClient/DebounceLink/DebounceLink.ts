import { ApolloLink } from '@apollo/client'
import { Observable, Observer, Subscription } from 'rxjs'

/**
 * An Apollo link that debounces operations sharing a `debounceKey`, forwarding
 * only the last one and fanning its result out to everyone that queued behind
 * it.
 *
 * Ported from `apollo-link-debounce`, which ships an ES5 build that subclasses
 * `ApolloLink` through a `_super.call(this)` shim. Apollo Client 4's
 * `ApolloLink` is a real class, so that shim throws "Class constructor
 * ApolloLink cannot be invoked without 'new'" the moment the link is
 * constructed. Behaviour is otherwise unchanged from upstream.
 *
 * Pass `{ context: { debounceKey, debounceTimeout? } }` to debounce an
 * operation; operations without a `debounceKey` are forwarded untouched.
 */

type ResultObserver = Observer<ApolloLink.Result>

interface DebounceMetadata {
  timeout: ReturnType<typeof setTimeout> | undefined
  runningSubscriptions: Record<
    number,
    { observers: ResultObserver[]; subscription: Subscription }
  >
  queuedObservers: ResultObserver[]
  currentGroupId: number
  lastRequest?: {
    operation: ApolloLink.Operation
    forward: ApolloLink.ForwardFunction
  }
}

export class DebounceLink extends ApolloLink {
  private readonly debounceInfo: Record<string, DebounceMetadata> = {}
  private readonly defaultDelay: number

  constructor(defaultDelay: number) {
    super()
    this.defaultDelay = defaultDelay
  }

  public request(
    operation: ApolloLink.Operation,
    forward: ApolloLink.ForwardFunction
  ): Observable<ApolloLink.Result> {
    const { debounceKey, debounceTimeout } = operation.getContext()

    if (debounceKey == null) return forward(operation)

    return new Observable<ApolloLink.Result>((observer) => {
      const groupId = this.enqueueRequest(
        debounceKey as string,
        debounceTimeout as number | undefined,
        { operation, forward, observer }
      )
      return () => {
        this.unsubscribe(debounceKey as string, groupId, observer)
      }
    })
  }

  /**
   * Sets up the metadata for a `debounceKey`. It is torn down again once the
   * key has no queued observers and no running subscriptions.
   */
  private setupDebounceInfo(debounceKey: string): DebounceMetadata {
    this.debounceInfo[debounceKey] = {
      runningSubscriptions: {},
      queuedObservers: [],
      currentGroupId: 0,
      timeout: undefined,
      lastRequest: undefined
    }
    return this.debounceInfo[debounceKey]
  }

  private enqueueRequest(
    debounceKey: string,
    debounceTimeout: number | undefined,
    entry: {
      operation: ApolloLink.Operation
      forward: ApolloLink.ForwardFunction
      observer: ResultObserver
    }
  ): number {
    const info =
      this.debounceInfo[debounceKey] ?? this.setupDebounceInfo(debounceKey)

    info.queuedObservers.push(entry.observer)
    info.lastRequest = { operation: entry.operation, forward: entry.forward }
    if (info.timeout != null) clearTimeout(info.timeout)

    info.timeout = setTimeout(
      () => this.flush(debounceKey),
      debounceTimeout ?? this.defaultDelay
    )
    return info.currentGroupId
  }

  private readonly cleanup = (debounceKey: string, groupId: number): void => {
    const info = this.debounceInfo[debounceKey]
    // Can happen when cleanup already ran from somewhere else.
    if (info == null) return

    /* eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- keyed by
       a numeric group id, not a fixed shape */
    delete info.runningSubscriptions[groupId]

    if (groupId === info.currentGroupId && info.timeout != null)
      clearTimeout(info.timeout)

    if (
      Object.keys(info.runningSubscriptions).length === 0 &&
      info.queuedObservers.length === 0
    ) {
      /* eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- keyed
         by the caller's debounce key */
      delete this.debounceInfo[debounceKey]
    }
  }

  /** Forwards the last queued request and fans its result out to the queue. */
  private flush(debounceKey: string): void {
    const info = this.debounceInfo[debounceKey]
    if (info.queuedObservers.length === 0 || info.lastRequest == null) return

    const { operation, forward } = info.lastRequest
    const currentObservers = [...info.queuedObservers]
    const groupId = info.currentGroupId

    const subscription = forward(operation).subscribe({
      next: (value) => {
        currentObservers.forEach((observer) => observer.next?.(value))
      },
      error: (error) => {
        currentObservers.forEach((observer) => observer.error?.(error))
        this.cleanup(debounceKey, groupId)
      },
      complete: () => {
        currentObservers.forEach((observer) => observer.complete?.())
        this.cleanup(debounceKey, groupId)
      }
    })

    info.runningSubscriptions[groupId] = {
      subscription,
      observers: currentObservers
    }
    info.queuedObservers = []
    info.currentGroupId++
  }

  private readonly unsubscribe = (
    debounceKey: string,
    groupId: number,
    observer: ResultObserver
  ): void => {
    const isNotObserver = (candidate: ResultObserver): boolean =>
      candidate !== observer

    const info = this.debounceInfo[debounceKey]
    // Already cleaned up.
    if (info == null) return

    // Still waiting in the queue — drop it before it is forwarded.
    if (groupId === info.currentGroupId) {
      info.queuedObservers = info.queuedObservers.filter(isNotObserver)
      if (info.queuedObservers.length === 0) this.cleanup(debounceKey, groupId)
      return
    }

    // Already forwarded — cancel once the last listener has gone.
    const group = info.runningSubscriptions[groupId]
    if (group != null) {
      group.observers = group.observers.filter(isNotObserver)
      if (group.observers.length === 0) {
        group.subscription.unsubscribe()
        this.cleanup(debounceKey, groupId)
      }
    }
  }
}
