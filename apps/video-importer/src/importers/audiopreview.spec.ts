import assert from 'node:assert/strict'
import { afterEach, describe, it, mock } from 'node:test'

function getModuleExports<T>(module: T): any {
  return (module as any)['module.exports'] ?? (module as any).default ?? module
}

describe('processAudioPreviewFile', () => {
  afterEach(() => {
    mock.reset()
  })

  it('should fail before uploading audio preview content when languageId is blank', async () => {
    process.env.SKIP_ENV_VALIDATION = '1'

    const audioPreviewModule = await import('./audiopreview')
    const { processAudioPreviewFile } = getModuleExports(audioPreviewModule)

    const consoleErrorMock = mock.method(console, 'error', () => {})

    const summary = {
      total: 1,
      successful: 0,
      failed: 0,
      successfulFiles: [] as string[],
      failedFiles: [] as string[],
      failureDetails: [] as { file: string; reason: string }[]
    }

    await processAudioPreviewFile('   .aac', '/tmp/   .aac', 100, summary)

    assert.equal(consoleErrorMock.mock.calls.length, 1)
    assert.deepEqual(summary, {
      total: 1,
      successful: 0,
      failed: 1,
      successfulFiles: [],
      failedFiles: ['   .aac'],
      failureDetails: [
        {
          file: '   .aac',
          reason: 'Missing languageId in filename'
        }
      ]
    })
  })
})
