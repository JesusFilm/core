import noop from 'lodash/noop'
import { HttpRequest, HttpResponse, HttpStack } from 'tus-js-client'

// extracted from:
// https://github.com/tus/tus-js-client/blob/main/test/spec/helpers/utils.js
// used exclusively for testing in jest

function flatPromise(): [
  Promise<HttpResponse>,
  (value: HttpResponse) => void,
  (reason?: Error) => void
] {
  let resolveFn
  let rejectFn
  const p = new Promise<HttpResponse>((resolve, reject) => {
    resolveFn = resolve
    rejectFn = reject
  })

  return [p, resolveFn, rejectFn]
}

export class TestHttpStack implements HttpStack {
  _pendingRequests: TestRequest[]
  _pendingWaits: Array<(req: TestRequest) => void>

  constructor() {
    this._pendingRequests = []
    this._pendingWaits = []
  }

  createRequest(method: string, url: string): HttpRequest {
    return new TestRequest(method, url, (req) => {
      if (this._pendingWaits.length >= 1) {
        const handler = this._pendingWaits.shift()
        handler?.(req)
        return
      }

      this._pendingRequests.push(req)
    })
  }

  async nextRequest(): Promise<TestRequest> {
    if (this._pendingRequests.length >= 1) {
      return await Promise.resolve(this._pendingRequests.shift() as TestRequest)
    }

    return await new Promise((resolve) => {
      this._pendingWaits.push(resolve)
    })
  }

  getName(): string {
    return 'TestHttpStack'
  }
}

interface Body {
  length?: number
  size?: number
  on: (event: 'readable', handler: () => void) => void
  read: () => string | null
}

class TestRequest implements HttpRequest {
  method: string
  url: string
  requestHeaders: { [key: string]: string }
  body: Body | null
  _onRequestSend: (req) => void
  _onProgress: (bytesSent: number) => void
  _requestPromise: Promise<HttpResponse>
  _resolveRequest: (value: unknown) => void
  _rejectRequest: (reason?: Error) => void

  constructor(method: string, url: string, onRequestSend: (req) => void) {
    this.method = method
    this.url = url
    this.requestHeaders = {}
    this.body = null

    this._onRequestSend = onRequestSend
    this._onProgress = noop
    const [promise, resolve, reject] = flatPromise()
    this._requestPromise = promise
    this._resolveRequest = resolve
    this._rejectRequest = reject
  }

  getMethod(): string {
    return this.method
  }

  getURL(): string {
    return this.url
  }

  setHeader(header: string, value: string): void {
    this.requestHeaders[header] = value
  }

  getHeader(header: string): string {
    return this.requestHeaders[header] ?? ''
  }

  async getBodySize(): Promise<number> {
    if (this.body == null) {
      return 0
    }

    if (this.body.size != null) {
      return this.body.size
    }

    return await new Promise((resolve) => {
      this.body?.on('readable', () => {
        let chunk
        while ((chunk = this.body?.read()) !== null) {
          resolve(chunk.length)
        }
      })
    })
  }

  setProgressHandler(progressHandler: (bytesSent: number) => void): void {
    this._onProgress = progressHandler
  }

  async send(body: Body | null = null): Promise<HttpResponse> {
    this.body = body

    if (body != null) {
      this._onProgress(0)
      this._onProgress(body.length ?? body.size ?? 0)
    }

    this._onRequestSend(this)
    return await this._requestPromise
  }

  async abort(): Promise<void> {
    this._rejectRequest(new Error('request aborted'))
  }

  getUnderlyingObject(): unknown {
    throw new Error('not implemented')
  }

  respondWith(mockResponse: MockResponse): void {
    const res = new TestResponse(mockResponse)
    this._resolveRequest(res)
  }

  responseError(err: Error): void {
    this._rejectRequest(err)
  }
}

interface MockResponse {
  status: number
  responseHeaders?: { [key: string]: string }
  responseText?: string
}

class TestResponse implements HttpResponse {
  _response: MockResponse

  constructor(res: MockResponse) {
    this._response = res
  }

  getStatus(): number {
    return this._response.status
  }

  getHeader(header: string): string {
    return this._response.responseHeaders?.[header] ?? ''
  }

  getBody(): string {
    return this._response.responseText ?? ''
  }

  getUnderlyingObject(): void {
    throw new Error('not implemented')
  }
}
