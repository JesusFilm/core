import { lookup } from 'node:dns'
import { isIP } from 'node:net'

import ipaddr from 'ipaddr.js'
import { Agent } from 'undici'

export function createMetadataFetcher() {
  const dispatcher = new Agent({
    connect: {
      lookup(hostname, options, callback) {
        lookup(hostname, { all: true, verbatim: true }, (error, addresses) => {
          if (error) {
            callback(error, '', 0)
            return
          }
          if (
            !addresses.length ||
            addresses.some(
              ({ address }) => ipaddr.process(address).range() !== 'unicast'
            )
          ) {
            callback(new Error('Metadata destination is not public'), '', 0)
            return
          }
          if (options.all) {
            callback(null, addresses)
            return
          }
          const selected = addresses.find(
            (address) => !options.family || address.family === options.family
          )
          if (!selected) {
            callback(new Error('No eligible metadata destination'), '', 0)
            return
          }
          callback(null, selected.address, selected.family)
        })
      }
    }
  })
  return {
    fetch: (
      input: string | URL | Request,
      options?: RequestInit
    ): Promise<Response> => {
      const url = new URL(input instanceof Request ? input.url : input)
      if (
        url.protocol !== 'https:' ||
        url.username ||
        url.password ||
        url.hash ||
        url.search ||
        isIP(url.hostname.replace(/^\[|\]$/g, '')) ||
        url.hostname === 'localhost'
      ) {
        throw new Error('Unsafe metadata destination')
      }
      // The validated lookup result is the address used by the TLS connection.
      // Never resolve once for validation and again for connection.
      const signal = AbortSignal.any([
        AbortSignal.timeout(2500),
        ...(options?.signal ? [options.signal] : [])
      ])
      return globalThis.fetch(url, {
        ...options,
        signal,
        dispatcher,
        redirect: 'error'
      } as RequestInit & { dispatcher: Agent })
    },
    close: () => dispatcher.destroy()
  }
}
