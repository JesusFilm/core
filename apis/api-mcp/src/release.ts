import { z } from 'zod'

const sha = z.string().regex(/^[a-f0-9]{40}$/)
const digest = z.string().regex(/^sha256:[a-f0-9]{64}$/)
const origin = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      url.pathname === '/' &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    )
  })
const names = ['mcp', 'auth', 'gateway', 'journeys', 'media', 'users'] as const
const databases = ['auth', 'journeys', 'media', 'users'] as const
const component = z.object({ revision: sha, digest }).strict()
const revisions = z
  .object({ auth: sha, journeys: sha, media: sha, users: sha })
  .strict()
const release = z
  .object({
    schemaVersion: z.literal(1),
    environment: z.literal('stage'),
    integrationBranch: z.literal('feature/11-12-SC-journeys-mcp'),
    sourceCommit: sha,
    accountId: z.string().regex(/^\d{12}$/),
    region: z.literal('us-east-2'),
    issuer: origin,
    mcpOrigin: origin,
    adminOrigin: origin,
    gatewayOrigin: origin,
    firebaseProject: z.string().min(1),
    production: z
      .object({
        origins: z.array(origin).min(1),
        firebaseProject: z.string().min(1)
      })
      .strict(),
    components: z
      .object({
        mcp: component,
        auth: component,
        gateway: component,
        journeys: component,
        media: component,
        users: component
      })
      .strict(),
    adminRevision: sha,
    viewerRevision: sha,
    databaseRevisions: revisions,
    readableDatabaseRevisions: z
      .object({
        auth: z.array(sha).min(1),
        journeys: z.array(sha).min(1),
        media: z.array(sha).min(1),
        users: z.array(sha).min(1)
      })
      .strict(),
    protections: z
      .object({
        privateReaders: z.literal(1),
        revisionWriters: z.literal(1),
        operationalGates: z.literal(1)
      })
      .strict(),
    bounds: z
      .object({
        replicas: z.number().int().min(2),
        requestMs: z.number().int().min(1).max(20000),
        drainMs: z.number().int().min(1).max(30000),
        deregistrationSeconds: z.number().int().min(1),
        stopSeconds: z.number().int().min(1).max(120)
      })
      .strict(),
    storage: z
      .object({
        bucket: z.string().regex(/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/),
        prefix: z.string().regex(/^stage\/[a-z0-9/-]+\/$/),
        blockPublicAccess: z.literal(true),
        encryption: z.literal('aws:kms'),
        cleanupOwner: z.literal('api-media'),
        automaticObjectExpiry: z.literal(false)
      })
      .strict(),
    retention: z
      .object({
        securityAuditDays: z.literal(90),
        telemetryDays: z.literal(90),
        resultDays: z.literal(30),
        auditOwner: z.literal('api-auth'),
        journeyResultOwner: z.literal('api-journeys'),
        mediaResultOwner: z.literal('api-media'),
        copies: z
          .array(
            z
              .object({
                name: z.string().regex(/^[a-z0-9/-]+$/),
                days: z.literal(90)
              })
              .strict()
          )
          .min(1)
      })
      .strict(),
    roles: z
      .object({
        deployment: z.string(),
        execution: z.string(),
        mcp: z.string(),
        auth: z.string(),
        media: z.string()
      })
      .strict(),
    secrets: z
      .array(
        z
          .object({
            participant: z.enum(names),
            variable: z.string(),
            parameterArn: z.string()
          })
          .strict()
      )
      .min(1)
  })
  .strict()

export type Release = z.infer<typeof release>

/** Validates a declaration. Live IAM, ingress, clocks and deployed participants
 * still need recorded observations before this can become release evidence.
 */
export function validateRelease(value: unknown): Release {
  const result = release.parse(value)
  const origins = [
    result.issuer,
    result.mcpOrigin,
    result.adminOrigin,
    result.gatewayOrigin
  ]
  const hosts = origins.map((value) => new URL(value).hostname)
  if (
    new Set(hosts).size !== hosts.length ||
    result.production.origins.some((value) =>
      hosts.includes(new URL(value).hostname)
    ) ||
    result.firebaseProject === result.production.firebaseProject
  )
    throw new Error('Environment separation required')
  if (
    result.bounds.stopSeconds * 1000 <= result.bounds.drainMs ||
    result.bounds.deregistrationSeconds * 1000 <
      Math.max(result.bounds.requestMs, result.bounds.drainMs)
  )
    throw new Error('Insufficient drain budget')
  const rolePattern = new RegExp(
    `^arn:aws:iam::${result.accountId}:role/(?:[a-z0-9-]+/)*[a-z0-9-]*stage[a-z0-9-]*$`
  )
  const roles = Object.values(result.roles)
  if (
    new Set(roles).size !== roles.length ||
    roles.some((role) => !rolePattern.test(role))
  )
    throw new Error('Separate stage IAM roles required')
  const secretPattern = new RegExp(
    `^arn:aws:ssm:${result.region}:${result.accountId}:parameter/stage/[a-zA-Z0-9/_-]+$`
  )
  const parameterArns = new Set<string>()
  const variables = new Set<string>()
  for (const secret of result.secrets) {
    const variable = `${secret.participant}:${secret.variable}`
    if (
      !secretPattern.test(secret.parameterArn) ||
      parameterArns.has(secret.parameterArn) ||
      variables.has(variable) ||
      /MIGRATION|AWS_ACCESS_KEY|AWS_SECRET|INTEROP/.test(secret.variable) ||
      (secret.participant === 'mcp' &&
        secret.variable !== 'MCP_EXCHANGE_CLIENT_SECRET') ||
      (secret.participant !== 'media' &&
        /CLOUDFLARE|MUX|STAGING_BUCKET/.test(secret.variable)) ||
      (secret.participant !== 'auth' &&
        /OPERATIONS|JWKS|COOKIE|PG_DATABASE_URL_AUTH/.test(secret.variable))
    )
      throw new Error('Scoped stage secrets required')
    parameterArns.add(secret.parameterArn)
    variables.add(variable)
  }
  if (
    !variables.has('mcp:MCP_EXCHANGE_CLIENT_SECRET') ||
    !variables.has('auth:AUTH_OPERATIONS_SECRET')
  )
    throw new Error('Operational credentials required')
  for (const domain of databases)
    if (
      !result.readableDatabaseRevisions[domain].includes(
        result.databaseRevisions[domain]
      )
    )
      throw new Error('Declared database revision is unreadable')
  return result
}

export function rollbackPlan(currentValue: unknown, previousValue: unknown) {
  const current = validateRelease(currentValue)
  const previous = validateRelease(previousValue)
  for (const key of [
    'accountId',
    'region',
    'issuer',
    'mcpOrigin',
    'adminOrigin',
    'gatewayOrigin',
    'firebaseProject'
  ] as const)
    if (current[key] !== previous[key])
      throw new Error('Rollback environment mismatch')
  if (JSON.stringify(current.storage) !== JSON.stringify(previous.storage))
    throw new Error('Rollback storage mismatch')
  for (const domain of databases)
    if (
      !previous.readableDatabaseRevisions[domain].includes(
        current.databaseRevisions[domain]
      )
    )
      throw new Error('Previous version cannot read the installed database')
  return {
    kind: 'stage-rollback-plan',
    qualification: 'unexecuted',
    sourceCommit: previous.sourceCommit,
    keepAdmissionClosed: true,
    keepEffectsClosed: true,
    images: names.map((participant) => ({
      participant,
      ...previous.components[participant]
    })),
    adminRevision: previous.adminRevision,
    viewerRevision: previous.viewerRevision,
    databaseRevisions: current.databaseRevisions
  }
}
