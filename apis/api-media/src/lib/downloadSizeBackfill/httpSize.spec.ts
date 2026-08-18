import fetch from 'node-fetch'
import { type MockedFunction, vi } from 'vitest'

import { createFetchHttpSizeClient, resolveHttpSize } from './httpSize'
import type { HttpHeadersResult, HttpSizeClient } from './types'

vi.mock('node-fetch')

function makeHeaders(overrides: Partial<HttpHeadersResult>): HttpHeadersResult {
  return {
    ok: true,
    status: 200,
    contentLength: null,
    contentRangeTotal: null,
    ...overrides
  }
}

describe('resolveHttpSize', () => {
  it('uses a positive HEAD Content-Length without falling back to Range', async () => {
    const client: HttpSizeClient = {
      head: vi.fn().mockResolvedValue(makeHeaders({ contentLength: '1000' })),
      rangeGet: vi.fn()
    }

    const result = await resolveHttpSize('https://example.com/file.mp4', client)

    expect(result).toEqual({ size: 1000, errorCode: null })
    expect(client.rangeGet).not.toHaveBeenCalled()
  })

  it('falls back to a Range request when HEAD has no usable length', async () => {
    const client: HttpSizeClient = {
      head: vi.fn().mockResolvedValue(makeHeaders({ contentLength: null })),
      rangeGet: vi.fn().mockResolvedValue(
        makeHeaders({
          status: 206,
          contentLength: '1',
          contentRangeTotal: 243808898
        })
      )
    }

    const result = await resolveHttpSize('https://example.com/file.mp4', client)

    expect(result).toEqual({ size: 243808898, errorCode: null })
  })

  it('falls back to Range when HEAD reports a zero length', async () => {
    const client: HttpSizeClient = {
      head: vi.fn().mockResolvedValue(makeHeaders({ contentLength: '0' })),
      rangeGet: vi
        .fn()
        .mockResolvedValue(makeHeaders({ status: 206, contentRangeTotal: 555 }))
    }

    const result = await resolveHttpSize('https://example.com/file.mp4', client)

    expect(result).toEqual({ size: 555, errorCode: null })
  })

  it('uses Content-Length when the server ignores the Range header (200)', async () => {
    const client: HttpSizeClient = {
      head: vi.fn().mockResolvedValue(makeHeaders({ ok: false, status: 405 })),
      rangeGet: vi
        .fn()
        .mockResolvedValue(
          makeHeaders({
            status: 200,
            contentLength: '999',
            contentRangeTotal: null
          })
        )
    }

    const result = await resolveHttpSize('https://example.com/file.mp4', client)

    expect(result).toEqual({ size: 999, errorCode: null })
  })

  it('reports an invalid length when a 206 response has no parseable Content-Range', async () => {
    const client: HttpSizeClient = {
      head: vi.fn().mockResolvedValue(makeHeaders({ ok: false, status: 500 })),
      rangeGet: vi
        .fn()
        .mockResolvedValue(
          makeHeaders({ status: 206, contentRangeTotal: null })
        )
    }

    const result = await resolveHttpSize('https://example.com/file.mp4', client)

    expect(result).toEqual({ size: null, errorCode: 'invalidLength' })
  })

  it('reports unreachable when both HEAD and Range fail', async () => {
    const client: HttpSizeClient = {
      head: vi.fn().mockRejectedValue(new Error('network error')),
      rangeGet: vi.fn().mockRejectedValue(new Error('network error'))
    }

    const result = await resolveHttpSize('https://example.com/file.mp4', client)

    expect(result).toEqual({ size: null, errorCode: 'httpUnreachable' })
  })

  it('reports unreachable when the Range response is neither ok nor partial', async () => {
    const client: HttpSizeClient = {
      head: vi.fn().mockResolvedValue(makeHeaders({ ok: false, status: 404 })),
      rangeGet: vi
        .fn()
        .mockResolvedValue(makeHeaders({ ok: false, status: 404 }))
    }

    const result = await resolveHttpSize('https://example.com/file.mp4', client)

    expect(result).toEqual({ size: null, errorCode: 'httpUnreachable' })
  })
})

describe('createFetchHttpSizeClient', () => {
  const mockFetch = fetch as MockedFunction<typeof fetch>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('aborts a HEAD request that never receives headers', async () => {
    mockFetch.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          const signal = (init as { signal?: AbortSignal } | undefined)?.signal
          signal?.addEventListener('abort', () => {
            reject(new Error('The operation was aborted'))
          })
        })
    )

    const client = createFetchHttpSizeClient()
    const assertion = expect(
      client.head('https://example.com/file.mp4')
    ).rejects.toThrow('The operation was aborted')

    await vi.advanceTimersByTimeAsync(10_000)
    await assertion
  })

  it('aborts a Range request that never receives headers', async () => {
    mockFetch.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          const signal = (init as { signal?: AbortSignal } | undefined)?.signal
          signal?.addEventListener('abort', () => {
            reject(new Error('The operation was aborted'))
          })
        })
    )

    const client = createFetchHttpSizeClient()
    const assertion = expect(
      client.rangeGet('https://example.com/file.mp4')
    ).rejects.toThrow('The operation was aborted')

    await vi.advanceTimersByTimeAsync(10_000)
    await assertion
  })
})
