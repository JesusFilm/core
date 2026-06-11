import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  buildDatadogSourcemapUploadArgs,
  getWatchModernMinifiedPathPrefix,
  removePublicJavaScriptSourceMaps
} from './datadog-sourcemaps'

describe('getWatchModernMinifiedPathPrefix', () => {
  it.each(['production', 'prod', 'stage'])(
    'uses the asset-prefix static path for %s deploys',
    (environment) => {
      expect(
        getWatchModernMinifiedPathPrefix({
          NEXT_PUBLIC_VERCEL_ENV: environment
        })
      ).toBe('/watch/modern/_next/static/')
    }
  )

  it.each(['preview', 'development', undefined])(
    'uses the basePath static path for %s deploys',
    (environment) => {
      expect(
        getWatchModernMinifiedPathPrefix({
          NEXT_PUBLIC_VERCEL_ENV: environment
        })
      ).toBe('/watch/_next/static/')
    }
  )
})

describe('buildDatadogSourcemapUploadArgs', () => {
  it('builds a Datadog upload command aligned to the Watch RUM service and release', () => {
    expect(
      buildDatadogSourcemapUploadArgs({
        GIT_COMMIT_SHA: 'abc123',
        NEXT_PUBLIC_VERCEL_ENV: 'prod'
      })
    ).toEqual([
      'dlx',
      '@datadog/datadog-ci@5.8.0',
      'sourcemaps',
      'upload',
      'dist/apps/watch-modern/.next/static',
      '--service=watch',
      '--release-version=abc123',
      '--minified-path-prefix=/watch/modern/_next/static/'
    ])
  })

  it('requires the deploy commit SHA used by RUM version tags', () => {
    expect(() => buildDatadogSourcemapUploadArgs({})).toThrow(
      'GIT_COMMIT_SHA is required to upload Datadog sourcemaps'
    )
  })
})

describe('removePublicJavaScriptSourceMaps', () => {
  it('removes public JavaScript sourcemaps without deleting other files', () => {
    const root = mkdtempSync(join(tmpdir(), 'watch-modern-sourcemaps-'))
    const staticDir = join(root, 'static', 'chunks')
    mkdirSync(staticDir, { recursive: true })
    const sourceMapPath = join(staticDir, 'app.js.map')
    const chunkPath = join(staticDir, 'app.js')
    const cssMapPath = join(staticDir, 'app.css.map')

    writeFileSync(sourceMapPath, '{}')
    writeFileSync(chunkPath, 'console.log("chunk")')
    writeFileSync(cssMapPath, '{}')

    expect(removePublicJavaScriptSourceMaps(root)).toEqual([sourceMapPath])
    expect(readFileSync(chunkPath, 'utf8')).toBe('console.log("chunk")')
    expect(readFileSync(cssMapPath, 'utf8')).toBe('{}')
    expect(() => readFileSync(sourceMapPath, 'utf8')).toThrow()
  })
})
