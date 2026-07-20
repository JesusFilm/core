import assert from 'node:assert/strict'
import { afterEach, before, describe, it, mock } from 'node:test'

import { createProcessingSummary, type ProcessingSummary } from '../types'

const validateLanguageMock = mock.fn()
const getAudioMetadataMock = mock.fn()
const uploadFileToR2DirectMock = mock.fn()
const requestMock = mock.fn()
const markFileAsCompletedMock = mock.fn()

mock.module('../env', {
  namedExports: {
    env: {
      CLOUDFLARE_R2_BUCKET: 'test-bucket'
    }
  }
})

mock.module('../utils/videoEditionValidator', {
  namedExports: {
    validateLanguage: validateLanguageMock
  }
})

mock.module('../utils/fileMetadataHelpers', {
  namedExports: {
    getAudioMetadata: getAudioMetadataMock
  }
})

mock.module('../services/r2', {
  namedExports: {
    uploadFileToR2Direct: uploadFileToR2DirectMock
  }
})

mock.module('../gql/graphqlClient', {
  namedExports: {
    getGraphQLClient: async () => ({
      request: requestMock
    })
  }
})

mock.module('../utils/fileUtils', {
  namedExports: {
    markFileAsCompleted: markFileAsCompletedMock
  }
})

function getModuleExports<T>(module: T): any {
  return (module as any)['module.exports'] ?? (module as any).default ?? module
}

function resetMockCalls(): void {
  validateLanguageMock.mock.resetCalls()
  getAudioMetadataMock.mock.resetCalls()
  uploadFileToR2DirectMock.mock.resetCalls()
  requestMock.mock.resetCalls()
  markFileAsCompletedMock.mock.resetCalls()
}

let AUDIO_PREVIEW_FILENAME_REGEX: RegExp
let processAudioPreviewFile: (
  file: string,
  filePath: string,
  contentLength: number,
  summary: ProcessingSummary
) => Promise<void>
let importOrUpdateAudioPreview: typeof import('./audiopreview').importOrUpdateAudioPreview

before(async () => {
  const audioPreviewModule = await import('./audiopreview')
  const exports = getModuleExports(audioPreviewModule)
  AUDIO_PREVIEW_FILENAME_REGEX = exports.AUDIO_PREVIEW_FILENAME_REGEX
  processAudioPreviewFile = exports.processAudioPreviewFile
  importOrUpdateAudioPreview = exports.importOrUpdateAudioPreview
})

describe('AUDIO_PREVIEW_FILENAME_REGEX', () => {
  afterEach(resetMockCalls)

  it('matches language-id AAC filenames only', () => {
    assert.equal(AUDIO_PREVIEW_FILENAME_REGEX.test('3934.aac'), true)
    assert.equal(AUDIO_PREVIEW_FILENAME_REGEX.test('3934.mp3'), false)
  })
})

describe('processAudioPreviewFile', () => {
  afterEach(resetMockCalls)

  it('should fail before uploading audio preview content when languageId is blank', async () => {
    const consoleErrorMock = mock.method(console, 'error', () => {})
    const summary = createProcessingSummary(1)

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
    assert.equal(validateLanguageMock.mock.calls.length, 0)
  })

  it('creates a new audio preview and marks the file completed', async () => {
    validateLanguageMock.mock.mockImplementation(async () => undefined)
    getAudioMetadataMock.mock.mockImplementation(async () => ({
      duration: 4,
      bitrate: 99913,
      codec: 'AAC'
    }))
    uploadFileToR2DirectMock.mock.mockImplementation(
      async () => 'https://cdn.example.com/audiopreview/3934.aac'
    )
    requestMock.mock.mockImplementation(async () => ({
      language: { audioPreview: null }
    }))
    markFileAsCompletedMock.mock.mockImplementation(async () => undefined)

    const summary = createProcessingSummary(1)

    await processAudioPreviewFile('3934.aac', '/tmp/3934.aac', 49748, summary)

    assert.equal(summary.successful, 1)
    assert.equal(summary.failed, 0)
    assert.equal(validateLanguageMock.mock.calls.length, 1)
    assert.equal(getAudioMetadataMock.mock.calls.length, 1)
    assert.deepEqual(uploadFileToR2DirectMock.mock.calls[0].arguments[0], {
      bucket: 'test-bucket',
      key: 'audiopreview/3934.aac',
      filePath: '/tmp/3934.aac',
      contentType: 'audio/aac',
      contentLength: 49748
    })
    assert.equal(requestMock.mock.calls.length, 2)
    assert.equal(markFileAsCompletedMock.mock.calls.length, 1)
  })

  it('updates an existing audio preview', async () => {
    validateLanguageMock.mock.mockImplementation(async () => undefined)
    getAudioMetadataMock.mock.mockImplementation(async () => ({
      duration: 4,
      bitrate: 99913,
      codec: 'AAC'
    }))
    uploadFileToR2DirectMock.mock.mockImplementation(
      async () => 'https://cdn.example.com/audiopreview/3934.aac'
    )
    requestMock.mock.mockImplementation(async () => ({
      language: {
        audioPreview: {
          languageId: '3934',
          value: 'https://cdn.example.com/old.aac',
          duration: 2,
          size: 123,
          bitrate: 64000,
          codec: 'AAC'
        }
      }
    }))
    markFileAsCompletedMock.mock.mockImplementation(async () => undefined)

    const summary = createProcessingSummary(1)

    await processAudioPreviewFile('3934.aac', '/tmp/3934.aac', 49748, summary)

    assert.equal(summary.successful, 1)
    assert.deepEqual(requestMock.mock.calls[1].arguments[1].input, {
      languageId: '3934',
      value: 'https://cdn.example.com/audiopreview/3934.aac',
      duration: 4,
      size: 49748,
      bitrate: 99913,
      codec: 'AAC'
    })
  })

  it('fails before metadata when language validation fails', async () => {
    validateLanguageMock.mock.mockImplementation(async () => {
      throw new Error('Language does not exist')
    })
    const consoleErrorMock = mock.method(console, 'error', () => {})
    const summary = createProcessingSummary(1)

    await processAudioPreviewFile('999999.aac', '/tmp/999999.aac', 100, summary)

    assert.equal(consoleErrorMock.mock.calls.length, 1)
    assert.equal(summary.failed, 1)
    assert.equal(getAudioMetadataMock.mock.calls.length, 0)
    assert.equal(uploadFileToR2DirectMock.mock.calls.length, 0)
  })

  it('records metadata, R2 upload, and GraphQL failures', async () => {
    validateLanguageMock.mock.mockImplementation(async () => undefined)
    getAudioMetadataMock.mock.mockImplementationOnce(async () => {
      throw new Error('Invalid bitrate value')
    })
    const consoleErrorMock = mock.method(console, 'error', () => {})
    const metadataSummary = createProcessingSummary(1)

    await processAudioPreviewFile(
      '3934.aac',
      '/tmp/3934.aac',
      49748,
      metadataSummary
    )

    assert.equal(metadataSummary.failed, 1)
    assert.match(metadataSummary.failureDetails[0].reason, /Audio metadata/)

    resetMockCalls()
    validateLanguageMock.mock.mockImplementation(async () => undefined)
    getAudioMetadataMock.mock.mockImplementation(async () => ({
      duration: 4,
      bitrate: 99913,
      codec: 'AAC'
    }))
    uploadFileToR2DirectMock.mock.mockImplementation(async () => {
      throw new Error('R2 unavailable')
    })
    const uploadSummary = createProcessingSummary(1)

    await processAudioPreviewFile(
      '3934.aac',
      '/tmp/3934.aac',
      49748,
      uploadSummary
    )

    assert.equal(uploadSummary.failed, 1)
    assert.match(uploadSummary.failureDetails[0].reason, /R2 upload/)

    resetMockCalls()
    validateLanguageMock.mock.mockImplementation(async () => undefined)
    getAudioMetadataMock.mock.mockImplementation(async () => ({
      duration: 4,
      bitrate: 99913,
      codec: 'AAC'
    }))
    uploadFileToR2DirectMock.mock.mockImplementation(
      async () => 'https://cdn.example.com/audiopreview/3934.aac'
    )
    requestMock.mock.mockImplementation(async () => {
      throw new Error('query failed')
    })
    const graphQLSummary = createProcessingSummary(1)

    await processAudioPreviewFile(
      '3934.aac',
      '/tmp/3934.aac',
      49748,
      graphQLSummary
    )

    assert.equal(consoleErrorMock.mock.calls.length >= 3, true)
    assert.equal(graphQLSummary.failed, 1)
    assert.match(
      graphQLSummary.failureDetails[0].reason,
      /GraphQL audio preview create\/update returned failure/
    )
    assert.equal(markFileAsCompletedMock.mock.calls.length, 0)
  })
})

describe('importOrUpdateAudioPreview', () => {
  afterEach(resetMockCalls)

  it('returns failed when creating or updating audio preview fails', async () => {
    let callCount = 0
    requestMock.mock.mockImplementation(async () => {
      callCount += 1
      if (callCount === 1) return { language: { audioPreview: null } }
      throw new Error('create failed')
    })

    assert.equal(
      await importOrUpdateAudioPreview({
        languageId: '3934',
        publicUrl: 'https://cdn.example.com/audiopreview/3934.aac',
        duration: 4,
        size: 49748,
        bitrate: 99913,
        codec: 'AAC'
      }),
      'failed'
    )

    resetMockCalls()
    callCount = 0
    requestMock.mock.mockImplementation(async () => {
      callCount += 1
      if (callCount === 1) {
        return {
          language: {
            audioPreview: {
              languageId: '3934',
              value: 'https://cdn.example.com/old.aac',
              duration: 2,
              size: 123,
              bitrate: 64000,
              codec: 'AAC'
            }
          }
        }
      }
      throw new Error('update failed')
    })

    assert.equal(
      await importOrUpdateAudioPreview({
        languageId: '3934',
        publicUrl: 'https://cdn.example.com/audiopreview/3934.aac',
        duration: 4,
        size: 49748,
        bitrate: 99913,
        codec: 'AAC'
      }),
      'failed'
    )
  })
})
