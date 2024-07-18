/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { ApolloLink, FetchResult, NextLink, Operation } from '@apollo/client'
import { Observable, Observer } from 'zen-observable-ts'

interface OperationQueueEntry {
  operation: Operation
  forward: NextLink
  observer: Observer<FetchResult>
  subscription?: { unsubscribe: () => void }
}

const toRequestKey = (operation: Operation) => {
  return operation.operationName
}

function isMutation(operation: Operation) {
  return operation.query.definitions.some(
    (definition) =>
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'mutation'
  )
}

/**
 * An Apollo link that enqueues mutations so that they cannot fire in parallel.
 *
 * To skip the queue pass `{ context: { skipQueue: true } }` to your mutation.
 */
export default class MutationQueueLink extends ApolloLink {
  private opQueue: OperationQueueEntry[] = []
  private inProcess = false
  private debug = false

  /**
   * @param {Boolean} debug - set to true to enable logging
   */
  constructor({ debug = false } = {}) {
    super()
    this.debug = debug
  }

  private log(message: string, ...rest: string[]) {
    if (this.debug) console.log(message, ...rest)
  }

  private processOperation(entry: OperationQueueEntry) {
    const { operation, forward, observer } = entry
    this.inProcess = true
    this.log('[PROCESSING] -', toRequestKey(operation))
    forward(operation).subscribe({
      next: (result) => {
        this.inProcess = false
        observer.next?.(result)
        this.log('[NEXT] -', toRequestKey(operation))
        // If there are more operations, process them.
        if (this.opQueue.length) {
          const operation = this.opQueue.shift()
          if (operation != null) this.processOperation(operation)
        }
      },
      error: (error) => {
        this.inProcess = false
        observer.error?.(error)
        this.log('[ERROR] -', toRequestKey(operation), error)
        // If there are more operations, process them.
        if (this.opQueue.length) {
          const operation = this.opQueue.shift()
          if (operation != null) this.processOperation(operation)
        }
      },
      complete: observer.complete?.bind(observer)
    })
  }

  private cancelOperation(entry: OperationQueueEntry) {
    this.opQueue = this.opQueue.filter((e) => e !== entry)
  }

  private enqueue(entry: OperationQueueEntry) {
    this.log('[ENQUEUE] -', toRequestKey(entry.operation))
    this.opQueue.push(entry)
  }

  public request(
    operation: Operation,
    forward: NextLink
  ): Observable<FetchResult> | null {
    // Enqueue all mutations unless manually skipped.
    if (isMutation(operation) && !operation.getContext().skipQueue) {
      return new Observable((observer) => {
        const operationEntry = { operation, forward, observer }
        if (!this.inProcess) {
          this.processOperation(operationEntry)
        } else {
          this.enqueue(operationEntry)
        }
        return () => this.cancelOperation(operationEntry)
      })
    }
    return forward(operation)
  }
}
