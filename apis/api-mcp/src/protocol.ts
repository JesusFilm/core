import { McpServer } from '@modelcontextprotocol/server'

export const protocolVersions = ['2026-07-28', '2025-11-25']

export function createProtocolServer(): McpServer {
  return new McpServer(
    { name: 'journeys-mcp', version: '0.0.1' },
    {
      supportedProtocolVersions: protocolVersions,
      capabilities: { tools: { listChanged: false } },
      maxToolInputElements: 1000,
      instructions:
        'Journey data tools are unavailable until identity and owning-service authorization are integrated.'
    }
  )
}
