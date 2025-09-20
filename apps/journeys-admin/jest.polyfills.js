/* eslint-disable import/order */
// jest.polyfills.js
/**
 * @note The block below contains polyfills for Node.js globals
 * required for Jest to function when running JSDOM tests.
 * These HAVE to be require's and HAVE to be in this exact
 * order, since "undici" depends on the "TextEncoder" global API.
 *
 * Consider migrating to a more modern test runner if
 * you don't want to deal with this.
 */

const { TextDecoder, TextEncoder } = require('node:util')

Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder }
})

const { Blob, File } = require('node:buffer')

const { fetch, Headers, FormData, Request, Response } = require('undici')

Object.defineProperties(globalThis, {
  fetch: { value: fetch, writable: true },
  Blob: { value: Blob },
  File: { value: File },
  Headers: { value: Headers },
  FormData: { value: FormData },
  Request: { value: Request },
  Response: { value: Response }
})

// Provide a minimal Page Visibility API polyfill for environments
// where JSDOM may not expose these properties consistently.
try {
  const doc =
    globalThis && typeof globalThis.document !== 'undefined'
      ? globalThis.document
      : undefined
  if (doc != null) {
    /**
     * @param {Record<string, unknown>} target
     * @param {string} property
     * @param {unknown} value
     */
    const defineIfMissing = (target, property, value) => {
      if (typeof target[property] !== 'undefined') return
      Object.defineProperty(target, property, {
        configurable: true,
        enumerable: false,
        writable: true,
        value
      })
    }

    defineIfMissing(doc, 'visibilityState', 'visible')
    defineIfMissing(doc, 'hidden', false)
    defineIfMissing(doc, 'onvisibilitychange', null)
  }
} catch {
  // no-op: best-effort polyfill only for test environment
}
