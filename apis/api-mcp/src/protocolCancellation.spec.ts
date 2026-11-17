import { InMemoryTransport } from '@modelcontextprotocol/server'

import { createProtocolServer } from './protocol'

describe('SDK cancellation of a data-bearing request', () => {
  it('closes the sender through the actual request-context abort signal', async () => {
    let markReadStarted!: () => void
    const readStarted = new Promise<void>((resolve) => {
      markReadStarted = resolve
    })
    let finishRead!: () => void
    const waitingRead = new Promise<void>((resolve) => {
      finishRead = resolve
    })
    let markCancelled!: () => void
    const cancelled = new Promise<void>((resolve) => {
      markCancelled = resolve
    })
    const settleOutput = vi.fn(async () => markCancelled())
    const server = createProtocolServer({
      async read() {
        markReadStarted()
        await waitingRead
        return { contractVersion: '1', journeys: [] }
      },
      authorizeOutput: vi.fn(),
      settleOutput
    })
    const [client, owner] = InMemoryTransport.createLinkedPair()
    let initialized!: () => void
    const initialization = new Promise<void>((resolve) => {
      initialized = resolve
    })
    client.onmessage = (message) => {
      if ('id' in message && message.id === 1) initialized()
    }
    await server.connect(owner)
    await client.start()
    try {
      await client.send({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-11-25',
          capabilities: {},
          clientInfo: { name: 'controlled-cancellation', version: '1' }
        }
      })
      await initialization
      await client.send({ jsonrpc: '2.0', method: 'notifications/initialized' })
      await client.send({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name: 'journeys_list', arguments: {} }
      })
      await readStarted
      await client.send({
        jsonrpc: '2.0',
        method: 'notifications/cancelled',
        params: { requestId: 2, reason: 'cancel unaccepted work' }
      })
      await cancelled
      expect(settleOutput).toHaveBeenCalledExactlyOnceWith()
    } finally {
      finishRead()
      await client.close()
      await server.close()
    }
  })
})
