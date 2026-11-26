import { createHash } from 'node:crypto'
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile
} from 'node:fs/promises'
import { resolve } from 'node:path'

import {
  acceptanceCommand,
  createAcceptancePlan,
  verifyArtifacts
} from './mcp-acceptance.mjs'
import { localDatabaseSource } from './mcp-acceptance-local.mjs'

describe('acceptance artifact commands', () => {
  let directory
  beforeEach(async () => {
    await mkdir('/tmp/phoebe-issue-10565', { recursive: true })
    directory = await mkdtemp('/tmp/phoebe-issue-10565/acceptance-')
  })
  afterEach(async () => {
    await rm(directory, { recursive: true, force: true })
  })

  it('writes an explicitly unexecuted complete registry plan and empty evidence ledger', async () => {
    const manifest = JSON.parse(
      await readFile('tools/scripts/mcp-operations.stage.example.json', 'utf8')
    )
    await createAcceptancePlan(manifest, directory)
    const plan = JSON.parse(await readFile(`${directory}/plan.json`, 'utf8'))
    const ledger = JSON.parse(
      await readFile(`${directory}/ledger.json`, 'utf8')
    )
    expect(plan.qualification).toBe('unexecuted')
    expect(plan.checks.every((check) => check.status === 'unexecuted')).toBe(
      true
    )
    expect(plan.checks.length).toBeGreaterThan(150)
    expect(ledger.records).toEqual([])
    const output = []
    expect(
      await acceptanceCommand(
        [
          'verify-stage',
          `${directory}/ledger.json`,
          'tools/scripts/mcp-operations.stage.example.json'
        ],
        (line) => output.push(line)
      )
    ).toBe(1)
    expect(output.join()).not.toContain('evidence-ready-for-review')
  })

  it('verifies real artifact bytes and rejects missing, replaced and escaping files', async () => {
    await mkdir(`${directory}/evidence`)
    await writeFile(`${directory}/session.md`, 'synthetic redacted transcript')
    const sha256 = createHash('sha256')
      .update('synthetic redacted transcript')
      .digest('hex')
    const ledger = (path) => ({ records: [{ artifacts: [{ path, sha256 }] }] })
    await expect(
      verifyArtifacts(ledger('session.md'), directory)
    ).resolves.toBeUndefined()
    await expect(
      verifyArtifacts(ledger('missing.md'), directory)
    ).rejects.toThrow()
    await writeFile(`${directory}/evidence/session.md`, 'replaced')
    await expect(
      verifyArtifacts(ledger('evidence/session.md'), directory)
    ).rejects.toThrow('digest mismatch')
    await symlink(
      resolve(directory, 'session.md'),
      `${directory}/evidence/link.md`
    )
    await expect(
      verifyArtifacts(ledger('link.md'), `${directory}/evidence`)
    ).rejects.toThrow('outside')
    await expect(
      verifyArtifacts(ledger('../session.md'), `${directory}/evidence`)
    ).rejects.toThrow('outside')
  })

  it('executes plan from the public command and redacts all invalid input errors', async () => {
    const manifest = 'tools/scripts/mcp-operations.stage.example.json'
    expect(
      await acceptanceCommand(['plan', manifest, directory], () => undefined)
    ).toBe(0)
    await writeFile(`${directory}/invalid.json`, '{credential-sentinel')
    for (const args of [
      [],
      ['unknown'],
      ['plan'],
      ['plan', manifest, directory, 'extra'],
      ['plan', `${directory}/invalid.json`, directory],
      ['verify-stage', `${directory}/invalid.json`, manifest],
      ['local', directory, 'not-a-suite'],
      ['local', directory, 'edits', 'edits']
    ]) {
      const output = []
      expect(await acceptanceCommand(args, (line) => output.push(line))).toBe(1)
      expect(output).toEqual([
        'Acceptance failed. Check arguments, candidate versions, execution counts, participants and evidence files. No release was approved.'
      ])
    }
  })

  it('allows isolated local database sources and rejects remote hosts or another protocol', () => {
    expect(
      localDatabaseSource(
        'postgresql://postgres:postgres@localhost:5432/postgres'
      ).hostname
    ).toBe('localhost')
    expect(() =>
      localDatabaseSource('postgresql://db.example.com/postgres')
    ).toThrow()
    expect(() => localDatabaseSource('https://localhost/postgres')).toThrow()
  })

  it('executes the real saved-edit suite with isolated databases and records local proof only', async () => {
    expect(
      await acceptanceCommand(['local', directory, 'edits'], () => undefined)
    ).toBe(0)
    const result = JSON.parse(
      await readFile(`${directory}/local-results.json`, 'utf8')
    )
    expect(result).toMatchObject({
      qualification: 'local-only',
      complete: false,
      productionApproved: false
    })
    expect(result.results[0]).toMatchObject({
      participant: 'controlled-local',
      environment: 'local',
      counts: { failed: 0, skipped: 0, pending: 0 }
    })
    expect(result.results[0].counts.passed).toBeGreaterThan(10)
    await cp(`${directory}/edits`, 'coverage/integration/mcp-acceptance/saved-edits', { recursive: true })
    const previous = process.env.MCP_ACCEPTANCE_POSTGRES_URL
    try {
      process.env.MCP_ACCEPTANCE_POSTGRES_URL =
        'postgresql://localhost:1/postgres?connect_timeout=1'
      expect(
        await acceptanceCommand(['local', directory, 'edits'], () => undefined)
      ).toBe(1)
      const failure = JSON.parse(
        await readFile(`${directory}/local-results.json`, 'utf8')
      )
      expect(failure).toMatchObject({
        qualification: 'failed',
        complete: false,
        results: []
      })
      await expect(readFile(`${directory}/edits-tests.json`)).rejects.toThrow()
    } finally {
      if (previous === undefined) delete process.env.MCP_ACCEPTANCE_POSTGRES_URL
      else process.env.MCP_ACCEPTANCE_POSTGRES_URL = previous
    }
  }, 240000)
})
