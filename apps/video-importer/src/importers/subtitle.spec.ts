import assert from 'node:assert/strict'
import { afterEach, describe, it, mock } from 'node:test'

function getModuleExports<T>(module: T): any {
  return (module as any)['module.exports'] ?? (module as any).default ?? module
}

describe('processSubtitleFile', () => {
  afterEach(() => {
    mock.reset()
  })

  it('should fail before uploading subtitle content when languageId is blank', async () => {
    const originalSkipEnvValidation = process.env.SKIP_ENV_VALIDATION
    process.env.SKIP_ENV_VALIDATION = '1'

    try {
      const subtitleModule = await import('./subtitle')
      const { processSubtitleFile } = getModuleExports(subtitleModule)

      const consoleErrorMock = mock.method(console, 'error', () => {})

      const summary = {
        total: 1,
        successful: 0,
        failed: 0,
        successfulFiles: [] as string[],
        failedFiles: [] as string[],
        failureDetails: [] as { file: string; reason: string }[]
      }

      await processSubtitleFile(
        'video123---ot---   .srt',
        '/tmp/video123---ot---   .srt',
        100,
        summary
      )

      assert.equal(consoleErrorMock.mock.calls.length, 1)
      assert.deepEqual(summary, {
        total: 1,
        successful: 0,
        failed: 1,
        successfulFiles: [],
        failedFiles: ['video123---ot---   .srt'],
        failureDetails: [
          {
            file: 'video123---ot---   .srt',
            reason: 'Missing languageId in filename'
          }
        ]
      })
    } finally {
      if (originalSkipEnvValidation === undefined) {
        delete process.env.SKIP_ENV_VALIDATION
      } else {
        process.env.SKIP_ENV_VALIDATION = originalSkipEnvValidation
      }
    }
  })
})
