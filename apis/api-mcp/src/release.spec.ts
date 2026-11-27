import { readFileSync } from 'node:fs'

import { type Release, rollbackPlan, validateRelease } from './release'

const example = (): Release =>
  JSON.parse(
    readFileSync(
      new URL(
        '../../../tools/scripts/mcp-operations.stage.example.json',
        import.meta.url
      ),
      'utf8'
    )
  ) as Release

describe('stage release declarations and previous-digest rollback', () => {
  it('accepts a pinned stage declaration and returns only an unexecuted rollback plan with gates closed', () => {
    const previous = example()
    const current = example()
    current.sourceCommit = '3'.repeat(40)
    current.components.mcp.digest = `sha256:${'4'.repeat(64)}`
    expect(validateRelease(current)).toEqual(current)
    const plan = rollbackPlan(current, previous)
    expect(plan).toMatchObject({
      qualification: 'unexecuted',
      keepAdmissionClosed: true,
      keepEffectsClosed: true,
      sourceCommit: previous.sourceCommit
    })
    expect(
      plan.images.find((image) => image.participant === 'mcp')?.digest
    ).toBe(`sha256:${'2'.repeat(64)}`)
    expect(JSON.stringify(plan)).not.toContain('parameterArn')
  })

  it.each([
    (r: Release) => {
      r.components.media.digest = 'latest'
    },
    (r: Release) => {
      r.components.auth.revision = 'main'
    },
    (r: Release) => {
      r.bounds.replicas = 1
    },
    (r: Release) => {
      r.bounds.requestMs = 20001
    },
    (r: Release) => {
      r.bounds.drainMs = 30001
    },
    (r: Release) => {
      r.bounds.stopSeconds = 10
    },
    (r: Release) => {
      r.bounds.deregistrationSeconds = 19
    },
    (r: Release) => {
      r.issuer = 'http://auth.stage.example.invalid'
    },
    (r: Release) => {
      r.issuer = 'https://user:secret@auth.stage.example.invalid'
    },
    (r: Release) => {
      r.issuer = r.mcpOrigin
    },
    (r: Release) => {
      r.production.origins = [r.adminOrigin]
    },
    (r: Release) => {
      r.firebaseProject = r.production.firebaseProject
    },
    (r: Release) => {
      r.roles.auth = r.roles.mcp
    },
    (r: Release) => {
      r.roles.auth = 'arn:aws:iam::123456789012:role/production'
    },
    (r: Release) => {
      r.secrets[0].parameterArn =
        'arn:aws:ssm:us-east-2:000000000000:parameter/prod/mcp/exchange'
    },
    (r: Release) => {
      r.secrets.push({ ...r.secrets[0] })
    },
    (r: Release) => {
      r.secrets[0].variable = 'PG_DATABASE_URL_AUTH_MIGRATION'
    },
    (r: Release) => {
      r.secrets[0].variable = 'MUX_TOKEN_SECRET'
    },
    (r: Release) => {
      r.secrets[0].variable = 'AUTH_JWKS'
    },
    (r: Release) => {
      r.secrets[1].participant = 'gateway'
    },
    (r: Release) => {
      r.secrets = []
    },
    (r: Release) => {
      r.secrets = r.secrets.slice(0, 1)
    },
    (r: Release) => {
      r.readableDatabaseRevisions.auth = ['3'.repeat(40)]
    }
  ])('rejects unsafe configuration case %#', (change) => {
    const manifest = example()
    change(manifest)
    expect(() => validateRelease(manifest)).toThrow()
  })

  it('rejects unknown settings, public temporary storage, extended retention and disabled rollout protections', () => {
    const manifest = example()
    for (const invalid of [
      { ...manifest, token: 'credential-sentinel' },
      { ...manifest, environment: 'production' },
      {
        ...manifest,
        storage: { ...manifest.storage, blockPublicAccess: false }
      },
      {
        ...manifest,
        storage: { ...manifest.storage, automaticObjectExpiry: true }
      },
      {
        ...manifest,
        retention: { ...manifest.retention, securityAuditDays: 91 }
      },
      {
        ...manifest,
        retention: {
          ...manifest.retention,
          copies: [{ name: 'backup', days: 365 }]
        }
      },
      {
        ...manifest,
        protections: { ...manifest.protections, privateReaders: 0 }
      }
    ])
      expect(() => validateRelease(invalid)).toThrow()
  })

  it('rejects cross-environment, storage-changing and database-incompatible rollback without changing migrations', () => {
    const current = example()
    const previous = example()
    previous.issuer = 'https://old.stage.example.invalid'
    expect(() => rollbackPlan(current, previous)).toThrow(
      'Rollback environment mismatch'
    )
    previous.issuer = current.issuer
    previous.storage.bucket = 'other-stage-bucket'
    expect(() => rollbackPlan(current, previous)).toThrow(
      'Rollback storage mismatch'
    )
    previous.storage = current.storage
    current.databaseRevisions.journeys = '5'.repeat(40)
    current.readableDatabaseRevisions.journeys.push(
      current.databaseRevisions.journeys
    )
    expect(() => rollbackPlan(current, previous)).toThrow(
      'Previous version cannot read'
    )
    previous.readableDatabaseRevisions.journeys.push(
      current.databaseRevisions.journeys
    )
    expect(rollbackPlan(current, previous).databaseRevisions).toEqual(
      current.databaseRevisions
    )
  })
})
