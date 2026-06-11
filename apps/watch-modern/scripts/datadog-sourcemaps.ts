import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

export const DATADOG_SOURCEMAP_SERVICE = 'watch'
export const DATADOG_CI_PACKAGE = '@datadog/datadog-ci@5.8.0'
export const WATCH_MODERN_STATIC_DIR = 'dist/apps/watch-modern/.next/static'
export const VERCEL_OUTPUT_DIR = '.vercel/output'

const PRODUCTION_STATIC_PREFIX = '/watch/modern/_next/static/'
const PREVIEW_STATIC_PREFIX = '/watch/_next/static/'
const PRODUCTION_ENVIRONMENTS = new Set(['production', 'prod', 'stage'])

export interface SourcemapEnvironment {
  [key: string]: string | undefined
  GIT_COMMIT_SHA?: string | undefined
  NEXT_PUBLIC_VERCEL_ENV?: string | undefined
  VERCEL_ENV?: string | undefined
}

export function resolveWatchModernDeployEnvironment(
  env: SourcemapEnvironment = process.env
): string {
  return env.NEXT_PUBLIC_VERCEL_ENV ?? env.VERCEL_ENV ?? 'preview'
}

export function getWatchModernMinifiedPathPrefix(
  env: SourcemapEnvironment = process.env
): string {
  return PRODUCTION_ENVIRONMENTS.has(resolveWatchModernDeployEnvironment(env))
    ? PRODUCTION_STATIC_PREFIX
    : PREVIEW_STATIC_PREFIX
}

export function buildDatadogSourcemapUploadArgs(
  env: SourcemapEnvironment = process.env
): string[] {
  if (!env.GIT_COMMIT_SHA) {
    throw new Error('GIT_COMMIT_SHA is required to upload Datadog sourcemaps')
  }

  return [
    'dlx',
    DATADOG_CI_PACKAGE,
    'sourcemaps',
    'upload',
    WATCH_MODERN_STATIC_DIR,
    `--service=${DATADOG_SOURCEMAP_SERVICE}`,
    `--release-version=${env.GIT_COMMIT_SHA}`,
    `--minified-path-prefix=${getWatchModernMinifiedPathPrefix(env)}`
  ]
}

export function removePublicJavaScriptSourceMaps(
  rootDir = VERCEL_OUTPUT_DIR
): string[] {
  if (!existsSync(rootDir)) {
    return []
  }

  const removedFiles: string[] = []

  function removeSourceMapsFromDir(directory: string): void {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)

      if (entry.isDirectory()) {
        removeSourceMapsFromDir(path)
        continue
      }

      if (entry.isFile() && entry.name.endsWith('.js.map')) {
        rmSync(path)
        removedFiles.push(path)
      }
    }
  }

  removeSourceMapsFromDir(rootDir)
  return removedFiles
}

function uploadSourcemaps(): void {
  const result = spawnSync('pnpm', buildDatadogSourcemapUploadArgs(), {
    stdio: 'inherit'
  })

  if (result.error != null) {
    throw result.error
  }

  process.exit(result.status ?? 1)
}

function removePublicSourcemaps(): void {
  const removedFiles = removePublicJavaScriptSourceMaps()
  console.log(
    `Removed ${removedFiles.length} public JavaScript sourcemap file(s) from ${VERCEL_OUTPUT_DIR}`
  )
}

const command = process.argv[2]

if (command === 'upload') {
  uploadSourcemaps()
} else if (command === 'remove-public') {
  removePublicSourcemaps()
} else if (command != null) {
  throw new Error(`Unknown Datadog sourcemap command: ${command}`)
}
