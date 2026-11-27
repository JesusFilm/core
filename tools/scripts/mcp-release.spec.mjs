import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'

import { checkReleaseFiles } from './mcp-release.mjs'

describe('offline stage manifest command', () => {
  it('checks manifests and prints a previous-digest plan without deploying or printing credentials', async () => {
    const manifest = 'tools/scripts/mcp-operations.stage.example.json'
    const output = []
    expect(
      await checkReleaseFiles([manifest], (line) => output.push(line))
    ).toBe(0)
    expect(JSON.parse(output.pop()).qualification).toBe('unexecuted')
    expect(
      await checkReleaseFiles([manifest, manifest], (line) => output.push(line))
    ).toBe(0)
    expect(JSON.parse(output.pop()).kind).toBe('stage-rollback-plan')
  })

  it('fails invalid arguments, missing files and malformed manifests with a fixed redacted message', async () => {
    await mkdir('/tmp/phoebe-issue-10564', { recursive: true })
    const directory = await mkdtemp('/tmp/phoebe-issue-10564/release-')
    try {
      const path = `${directory}/invalid.json`
      await writeFile(path, '{"secret":"credential-sentinel"}')
      for (const paths of [
        [],
        ['a', 'b', 'c'],
        [path],
        [`${directory}/token-sentinel`]
      ]) {
        const output = []
        expect(
          await checkReleaseFiles(paths, (line) => output.push(line))
        ).toBe(1)
        expect(output).toEqual([
          'Release check failed. Validate the manifest against api-mcp/src/release.ts; no deployment was attempted.'
        ])
      }
      await writeFile(path, '{broken credential-sentinel')
      expect(await checkReleaseFiles([path], () => undefined)).toBe(1)
    } finally {
      await rm(directory, { recursive: true })
    }
  })
})
