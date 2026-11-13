import { type AddressInfo } from 'node:net'

import {
  CLIENT_CAPABILITIES_META_KEY,
  CLIENT_INFO_META_KEY,
  PROTOCOL_VERSION_META_KEY
} from '@modelcontextprotocol/server'

import { readConfig } from '../src/config'
import { type createRuntime } from '../src/runtime'

export const config = () => ({
  ...readConfig({
    MCP_AUTH_MODE: 'disabled',
    MCP_PUBLIC_URL: 'http://127.0.0.1:4010/mcp'
  }),
  port: 0
})

export function runtimeUrl(runtime: ReturnType<typeof createRuntime>): string {
  return `http://127.0.0.1:${(runtime.server.address() as AddressInfo).port}/mcp`
}

export function message(
  version: string,
  method: string,
  params: Record<string, unknown> = {},
  id = 1
) {
  return {
    jsonrpc: '2.0',
    id,
    method,
    params:
      version === '2026-07-28'
        ? {
            ...params,
            _meta: {
              [PROTOCOL_VERSION_META_KEY]: version,
              [CLIENT_INFO_META_KEY]: {
                name: 'local-qualification',
                version: '1.0.0'
              },
              [CLIENT_CAPABILITIES_META_KEY]: {}
            }
          }
        : params
  }
}

export async function post(
  url: string,
  version: string,
  method: string,
  params: Record<string, unknown> = {},
  id = 1
) {
  return await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      'mcp-protocol-version': version,
      'mcp-method': method,
      ...(typeof params.name === 'string' ? { 'mcp-name': params.name } : {})
    },
    body: JSON.stringify(message(version, method, params, id))
  })
}

interface ProtocolResponse {
  result: {
    capabilities: Record<string, unknown>
    protocolVersion?: string
    supportedVersions?: string[]
    tools: { name: string }[]
    structuredContent: { value: string; instance: string; replica: string }
    isError?: boolean
  }
  error: { code: number; message: string }
}

export async function payload(response: Response): Promise<ProtocolResponse> {
  const text = await response.text()
  if (response.headers.get('content-type')?.includes('text/event-stream')) {
    const line = text.split('\n').find((value) => value.startsWith('data:'))
    return JSON.parse(line?.slice(5) ?? 'null') as ProtocolResponse
  }
  return JSON.parse(text) as ProtocolResponse
}
