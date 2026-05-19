import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { checkStartupEnvironment } from '../startupPreflight'

const validEnv = {
  GRAPHQL_ENDPOINT: 'http://localhost:4000/graphql',
  FIREBASE_EMAIL: 'importer@example.com',
  FIREBASE_PASSWORD: 'password',
  FIREBASE_API_KEY: 'firebase-api-key',
  FIREBASE_AUTH_DOMAIN: 'example.firebaseapp.com',
  FIREBASE_PROJECT_ID: 'project-id',
  FIREBASE_APP_ID: 'app-id',
  CLOUDFLARE_R2_ENDPOINT: 'https://example.r2.cloudflarestorage.com',
  CLOUDFLARE_R2_ACCESS_KEY_ID: 'access-key',
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: 'secret-key',
  CLOUDFLARE_R2_BUCKET: 'bucket',
  SLACK_BOT_TOKEN: 'xoxb-test',
  SLACK_CHANNEL_ID: 'C123'
}

describe('checkStartupEnvironment', () => {
  it('passes when required importer configuration is present', () => {
    assert.deepEqual(checkStartupEnvironment(validEnv), [])
  })

  it('requires Slack configuration', () => {
    const failures = checkStartupEnvironment({
      ...validEnv,
      SLACK_BOT_TOKEN: undefined
    })

    assert.deepEqual(
      failures.find((failure) => failure.variable === 'SLACK_BOT_TOKEN'),
      { variable: 'SLACK_BOT_TOKEN', message: 'is missing' }
    )
  })

  it('requires Firebase email and password', () => {
    const failures = checkStartupEnvironment({
      ...validEnv,
      FIREBASE_EMAIL: undefined,
      FIREBASE_PASSWORD: undefined
    })

    assert.deepEqual(
      failures.find((failure) => failure.variable === 'FIREBASE_EMAIL'),
      { variable: 'FIREBASE_EMAIL', message: 'is missing' }
    )
    assert.deepEqual(
      failures.find((failure) => failure.variable === 'FIREBASE_PASSWORD'),
      { variable: 'FIREBASE_PASSWORD', message: 'is missing' }
    )
  })

  it('uses a friendly message for invalid URLs', () => {
    const failures = checkStartupEnvironment({
      ...validEnv,
      GRAPHQL_ENDPOINT: 'not-a-url'
    })

    assert.deepEqual(
      failures.find((failure) => failure.variable === 'GRAPHQL_ENDPOINT'),
      { variable: 'GRAPHQL_ENDPOINT', message: 'must be a valid URL' }
    )
  })
})
