import { resolve } from 'node:path'

const fixture = vi.hoisted(() => ({
  sources: new Map<string, string>(),
  coverage: {},
  cobertura: ''
}))

vi.mock('node:fs', () => ({
  existsSync: (path: string) => fixture.sources.has(path),
  readFileSync: (path: string) => {
    if (path.endsWith('/tests.json'))
      return JSON.stringify({
        numTotalTests: 1,
        numPassedTests: 1,
        numPendingTests: 0,
        numTodoTests: 0
      })
    if (path.endsWith('/coverage-final.json'))
      return JSON.stringify(fixture.coverage)
    if (path.endsWith('/cobertura-coverage.xml')) return fixture.cobertura
    const source = fixture.sources.get(path)
    if (source === undefined) throw new Error(`Unexpected source read: ${path}`)
    return source
  }
}))

const originalArgv = process.argv
const file = 'apis/api-auth/src/permissions.ts'
const absolute = resolve(import.meta.dirname, '../../..', file)
const anchor = 'const collecting = page && allIds.length < page.gateCount'

describe('coverage verification', () => {
  beforeEach(() => {
    vi.resetModules()
    fixture.sources.clear()
    fixture.coverage = {}
    fixture.cobertura = ''
    process.argv = [...originalArgv, '--baseline']
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
  })

  afterEach(() => {
    process.argv = originalArgv
    vi.restoreAllMocks()
  })

  function instrumentSource(hits = 1, line = 1) {
    fixture.cobertura = `<class filename="${file}" />`
    fixture.coverage = {
      [absolute]: {
        statementMap: { '0': { start: { line }, end: { line } } },
        s: { '0': hits }
      }
    }
  }

  it('accepts a baseline that predates the participant file', async () => {
    await expect(vi.importActual('./verifyCoverage')).resolves.toBeDefined()
  })

  it('accepts an existing baseline file that predates all required source anchors', async () => {
    fixture.sources.set(absolute, 'export const legacyImplementation = true')
    await expect(vi.importActual('./verifyCoverage')).resolves.toBeDefined()
  })

  it('requires a coverage report when any required baseline anchor exists', async () => {
    fixture.sources.set(absolute, anchor)
    await expect(vi.importActual('./verifyCoverage')).rejects.toThrow(
      `Missing repository-relative Codecov path: ${file}`
    )
  })

  it('requires owning-service coverage for an implemented baseline participant', async () => {
    fixture.sources.set(absolute, anchor)
    fixture.cobertura = `<class filename="${file}" />`
    await expect(vi.importActual('./verifyCoverage')).rejects.toThrow(
      `Missing owning-service coverage: ${file}`
    )
  })

  it('rejects an implemented baseline participant with no execution hits', async () => {
    fixture.sources.set(absolute, anchor)
    instrumentSource(0)
    await expect(vi.importActual('./verifyCoverage')).rejects.toThrow(
      `No execution hits in ${file}`
    )
  })

  it('requires execution hits on each implemented baseline anchor', async () => {
    fixture.sources.set(absolute, anchor)
    instrumentSource(1, 2)
    await expect(vi.importActual('./verifyCoverage')).rejects.toThrow(
      `No execution hits at ${file}:1`
    )
  })

  it('accepts covered baseline anchors while skipping anchors added later', async () => {
    fixture.sources.set(absolute, anchor)
    instrumentSource()
    await expect(vi.importActual('./verifyCoverage')).resolves.toBeDefined()
  })

  it('requires every source anchor on the PR head', async () => {
    process.argv = originalArgv.filter((argument) => argument !== '--baseline')
    fixture.sources.set(absolute, anchor)
    instrumentSource()
    await expect(vi.importActual('./verifyCoverage')).rejects.toThrow(
      "Missing source anchor: if (manifest.status === 'collecting') return manifest"
    )
  })
})
