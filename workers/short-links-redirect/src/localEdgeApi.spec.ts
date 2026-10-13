import { createExecutionContext, waitOnExecutionContext } from 'cloudflare:test'

import { domainRecord, routingRecord } from '../test/fixtures'
import { bindings, workerRequest } from '../test/workerRequest'

import type { Env } from './env'
import local from './local'
import { clearDomainCache } from './store'

const API = 'http://localhost:8788/client/v4/accounts/account'

/** One request through the `wrangler dev` entry, the way api-media's Cloudflare client sends it. */
async function localRequest(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const testEnv: Env = {
    ...bindings,
    SHORT_LINKS_EVENTS: {
      send: vi.fn().mockResolvedValue(undefined),
      sendBatch: vi.fn()
    }
  }
  const ctx = createExecutionContext()
  const response = await local.fetch(new Request(url, init), testEnv, ctx)
  await waitOnExecutionContext(ctx)
  return response
}

function bulkWrite(
  binding: string,
  records: Record<string, unknown>
): Promise<Response> {
  return localRequest(`${API}/storage/kv/namespaces/${binding}/bulk`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      Object.entries(records).map(([key, record]) => ({
        key,
        value: JSON.stringify(record)
      }))
    )
  })
}

const localhost = domainRecord({
  hostname: 'localhost',
  kvBinding: 'KV_JESUS_FILM'
})

describe('local edge API', () => {
  beforeEach(() => {
    clearDomainCache()
  })

  it('serves a link published through the KV bulk endpoint', async () => {
    const domainWrite = await bulkWrite('SHORT_LINKS_KV', {
      'domain:localhost': localhost
    })
    const linkWrite = await bulkWrite('KV_JESUS_FILM', {
      published: routingRecord({
        id: 'link-published',
        to: 'https://example.com/published',
        hostname: 'localhost'
      })
    })

    expect(domainWrite.status).toBe(200)
    expect(await linkWrite.json()).toEqual({
      success: true,
      errors: [],
      messages: [],
      result: { successful_key_count: 1, unsuccessful_keys: [] }
    })

    const redirect = await localRequest('http://localhost:8788/published')
    expect(redirect.status).toBe(307)
    expect(redirect.headers.get('Location')).toBe(
      'https://example.com/published'
    )
  })

  it('applies a republished domain record without waiting for the domain cache', async () => {
    await bulkWrite('SHORT_LINKS_KV', { 'domain:localhost': localhost })
    await bulkWrite('KV_JESUS_FILM', {
      cached: routingRecord({ id: 'link-cached', hostname: 'localhost' })
    })
    expect((await localRequest('http://localhost:8788/cached')).status).toBe(
      307
    )

    await bulkWrite('SHORT_LINKS_KV', {
      'domain:localhost': { ...localhost, redirectStatus: 301 }
    })

    expect((await localRequest('http://localhost:8788/cached')).status).toBe(
      301
    )
  })

  it('deletes a key, including one with a colon', async () => {
    await bulkWrite('SHORT_LINKS_KV', {
      'link:gone': routingRecord({ id: 'link-gone', global: true })
    })
    expect(await bindings.SHORT_LINKS_KV.get('link:gone')).not.toBeNull()

    const response = await localRequest(
      `${API}/storage/kv/namespaces/SHORT_LINKS_KV/values/link:gone`,
      { method: 'DELETE' }
    )

    expect(response.status).toBe(200)
    expect(await bindings.SHORT_LINKS_KV.get('link:gone')).toBeNull()
  })

  it('rejects a namespace id that is not a binding name', async () => {
    const response = await bulkWrite('0f2ac74b498b48028cb68387c421e279', {
      a: {}
    })

    expect(response.status).toBe(404)
    expect(await response.json()).toMatchObject({
      success: false,
      errors: [
        {
          message: expect.stringContaining(
            'no KV binding named "0f2ac74b498b48028cb68387c421e279"'
          )
        }
      ]
    })
  })

  it('rejects a malformed bulk body', async () => {
    const response = await localRequest(
      `${API}/storage/kv/namespaces/SHORT_LINKS_KV/bulk`,
      { method: 'PUT', body: JSON.stringify({ key: 'a', value: 'b' }) }
    )

    expect(response.status).toBe(400)
  })

  it('answers 404 for Cloudflare endpoints it does not implement', async () => {
    // the single-key write: api-media must not use it (it stores a wrapper)
    const response = await localRequest(
      `${API}/storage/kv/namespaces/SHORT_LINKS_KV/values/some-key`,
      { method: 'PUT', body: '{}' }
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toMatchObject({
      success: false,
      errors: [{ message: expect.stringContaining('is not implemented') }]
    })
  })

  it('is not part of the deployed Worker', async () => {
    const { response } = await workerRequest(
      `${API}/storage/kv/namespaces/SHORT_LINKS_KV/bulk`,
      { method: 'PUT', body: '[{"key":"deployed","value":"{}"}]' }
    )

    expect(response.status).toBe(405)
    expect(await bindings.SHORT_LINKS_KV.get('deployed')).toBeNull()
  })
})
