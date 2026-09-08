import { ApolloLink } from '@apollo/client'
import { Observable, Observer } from 'rxjs'

/**
 * An Apollo link that enqueues mutations so that they cannot fire in parallel.
 *
 * Ported from `@adobe/apollo-link-mutation-queue`, which is built against
 * Apollo Client 3 and returns `zen-observable` instances. Apollo Client 4
 * pipes link results through rxjs operators, so a `zen-observable` throws
 * (`.pipe` is not a function) as soon as a mutation is dispatched. Behaviour
 * is otherwise unchanged from the upstream link.
 *
 * To skip the queue pass `{ context: { skipQueue: true } }` to your mutation.
 */

interface OperationQueueEntry {
  operation: ApolloLink.Operation
  forward: ApolloLink.ForwardFunction
  observer: Observer<ApolloLink.Result>
}

function isMutation(operation: ApolloLink.Operation): boolean {
  return operation.query.definitions.some(
    (definition) =>
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'mutation'
  )
}

export class MutationQueueLink extends ApolloLink {
  private opQueue: OperationQueueEntry[] = []
  private inProcess = false

  private processOperation(entry: OperationQueueEntry): void {
    const { operation, forward, observer } = entry
    this.inProcess = true

    forward(operation).subscribe({
      next: (result) => {
        this.inProcess = false
        observer.next(result)
        this.processNext()
      },
      error: (error) => {
        this.inProcess = false
        observer.error(error)
        this.processNext()
      },
      complete: () => observer.complete()
    })
  }

  private processNext(): void {
    const next = this.opQueue.shift()
    if (next != null) this.processOperation(next)
  }

  private cancelOperation(entry: OperationQueueEntry): void {
    this.opQueue = this.opQueue.filter((e) => e !== entry)
  }

  public request(
    operation: ApolloLink.Operation,
    forward: ApolloLink.ForwardFunction
  ): Observable<ApolloLink.Result> {
    // Enqueue all mutations unless manually skipped.
    if (!isMutation(operation) || operation.getContext().skipQueue === true)
      return forward(operation)

    return new Observable<ApolloLink.Result>((observer) => {
      const entry: OperationQueueEntry = { operation, forward, observer }

      if (this.inProcess) {
        this.opQueue.push(entry)
      } else {
        this.processOperation(entry)
      }

      return () => this.cancelOperation(entry)
    })
  }
}
