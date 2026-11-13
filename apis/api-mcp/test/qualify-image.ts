import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { payload, post } from './helpers'

async function main(): Promise<void> {
  const endpoint = process.argv[2]
  const evidenceDirectory = process.env.MCP_EVIDENCE_DIRECTORY
  assert(
    endpoint && evidenceDirectory,
    'Endpoint and evidence directory are required'
  )
  const origin = new URL(endpoint).origin
  for (const path of ['/health', '/ready']) {
    const response = await fetch(`${origin}${path}`)
    assert.equal(response.status, 200)
    assert.equal(
      ((await response.json()) as { dataTools: boolean }).dataTools,
      false
    )
  }
  const evidence = []
  for (const version of ['2026-07-28', '2025-11-25']) {
    const discovery =
      version === '2026-07-28'
        ? await post(endpoint, version, 'server/discover')
        : await post(endpoint, version, 'initialize', {
            protocolVersion: version,
            capabilities: {},
            clientInfo: { name: 'image-qualification', version: '1.0.0' }
          })
    assert.equal(discovery.status, 200)
    assert.equal(discovery.headers.has('mcp-session-id'), false)
    const discovered = await payload(discovery)
    if (version === '2026-07-28')
      assert.deepEqual(discovered.result.supportedVersions, [version])
    else assert.equal(discovered.result.protocolVersion, version)
    const listed = await post(endpoint, version, 'tools/list')
    assert.equal(listed.status, 200)
    assert.deepEqual((await payload(listed)).result.tools, [])
    const denied = await payload(
      await post(endpoint, version, 'tools/call', {
        name: 'fixture_echo',
        arguments: { value: 'fixture-must-be-absent' }
      })
    )
    assert(denied.error || denied.result?.isError)
    assert(!JSON.stringify(denied).includes('fixture-must-be-absent'))
    evidence.push({
      protocolVersion: version,
      discoveryStatus: discovery.status,
      contentType: discovery.headers.get('content-type'),
      sessionIdIssued: false,
      tools: [],
      fixtureDenied: true
    })
  }
  for (const method of ['GET', 'DELETE']) {
    const response = await fetch(endpoint, { method })
    assert.equal(response.status, 405)
    assert.equal(response.headers.get('allow'), 'POST')
  }
  await mkdir(evidenceDirectory, { recursive: true })
  await writeFile(
    join(evidenceDirectory, 'release-http.json'),
    JSON.stringify(evidence, null, 2)
  )
  process.stdout.write(
    'Container release HTTP qualification passed for both protocol profiles\n'
  )
}

void main().catch((error: unknown) => {
  process.stderr.write(`${String(error)}\n`)
  process.exitCode = 1
})
