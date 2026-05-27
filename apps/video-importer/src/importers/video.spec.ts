import assert from 'node:assert/strict'
import { afterEach, before, describe, it, mock } from 'node:test'

import { createProcessingSummary, type ProcessingSummary } from '../types'

const validateVideoAndEditionMock = mock.fn()
const getVideoMetadataMock = mock.fn()
const createR2AssetMock = mock.fn()
const uploadToR2Mock = mock.fn()
const formatR2AssetDiagnosticMock = mock.fn(() => ' (assetId=test-asset)')
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
    validateVideoAndEdition: validateVideoAndEditionMock
  }
})

mock.module('../utils/fileMetadataHelpers', {
  namedExports: {
    getVideoMetadata: getVideoMetadataMock
  }
})

mock.module('../services/r2', {
  namedExports: {
    createR2Asset: createR2AssetMock,
    formatR2AssetDiagnostic: formatR2AssetDiagnosticMock,
    uploadToR2: uploadToR2Mock
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
  validateVideoAndEditionMock.mock.resetCalls()
  getVideoMetadataMock.mock.resetCalls()
  createR2AssetMock.mock.resetCalls()
  uploadToR2Mock.mock.resetCalls()
  formatR2AssetDiagnosticMock.mock.resetCalls()
  requestMock.mock.resetCalls()
  markFileAsCompletedMock.mock.resetCalls()
}

let VIDEO_FILENAME_REGEX: RegExp
let processVideoFile: (
  file: string,
  filePath: string,
  contentLength: number,
  summary: ProcessingSummary
) => Promise<void>

before(async () => {
  const videoModule = await import('./video')
  const exports = getModuleExports(videoModule)
  VIDEO_FILENAME_REGEX = exports.VIDEO_FILENAME_REGEX
  processVideoFile = exports.processVideoFile
})

describe('VIDEO_FILENAME_REGEX', () => {
  afterEach(resetMockCalls)

  it('should match a normal video filename', () => {
    assert.equal(
      VIDEO_FILENAME_REGEX.test('0_JesusVisionJohn---base---3934---1.mp4'),
      true
    )
  })

  it('should match a burned-in video filename with audio and burned-in pairs', () => {
    assert.equal(
      VIDEO_FILENAME_REGEX.test(
        '0_JesusVisionJohn---base---3934---1---496---2.mp4'
      ),
      true
    )
  })
})

describe('processVideoFile', () => {
  afterEach(resetMockCalls)

  it('should process a normal video file', async () => {
    validateVideoAndEditionMock.mock.mockImplementation(async () => ({
      editionId: 'edition-id'
    }))
    getVideoMetadataMock.mock.mockImplementation(async () => ({
      durationMs: 10000,
      duration: 10,
      width: 1920,
      height: 1080
    }))
    createR2AssetMock.mock.mockImplementation(async () => ({
      uploadUrl: 'https://upload.example.com/video.mp4',
      publicUrl: 'https://cdn.example.com/video.mp4'
    }))
    uploadToR2Mock.mock.mockImplementation(async () => undefined)
    requestMock.mock.mockImplementation(async () => undefined)
    markFileAsCompletedMock.mock.mockImplementation(async () => undefined)

    const summary = createProcessingSummary(1)

    await processVideoFile(
      '0_JesusVisionJohn---base---3934---1.mp4',
      '/tmp/0_JesusVisionJohn---base---3934---1.mp4',
      1024,
      summary
    )

    assert.equal(summary.successful, 1)
    assert.equal(summary.failed, 0)
    assert.deepEqual(summary.successfulFiles, [
      '0_JesusVisionJohn---base---3934---1.mp4'
    ])
    assert.equal(validateVideoAndEditionMock.mock.calls.length, 1)
    assert.equal(getVideoMetadataMock.mock.calls.length, 1)
    assert.equal(createR2AssetMock.mock.calls.length, 1)
    assert.equal(uploadToR2Mock.mock.calls.length, 1)
    assert.equal(requestMock.mock.calls.length, 1)
    assert.equal(markFileAsCompletedMock.mock.calls.length, 1)
  })

  it('should fail before validation when languageId is blank', async () => {
    const consoleErrorMock = mock.method(console, 'error', () => {})
    const summary = createProcessingSummary(1)

    await processVideoFile(
      '0_JesusVisionJohn---base---   ---1.mp4',
      '/tmp/0_JesusVisionJohn---base---   ---1.mp4',
      1024,
      summary
    )

    assert.equal(consoleErrorMock.mock.calls.length, 1)
    assert.equal(summary.successful, 0)
    assert.equal(summary.failed, 1)
    assert.equal(validateVideoAndEditionMock.mock.calls.length, 0)
  })

  it('should fail before upload when the video does not exist', async () => {
    validateVideoAndEditionMock.mock.mockImplementation(async () => {
      throw new Error(
        'Video with ID "missing_0_JesusVisionJohn" does not exist in the database'
      )
    })
    const consoleErrorMock = mock.method(console, 'error', () => {})
    const summary = createProcessingSummary(1)

    await processVideoFile(
      'missing_0_JesusVisionJohn---base---3934---1.mp4',
      '/tmp/missing_0_JesusVisionJohn---base---3934---1.mp4',
      1024,
      summary
    )

    assert.equal(consoleErrorMock.mock.calls.length, 1)
    assert.equal(summary.successful, 0)
    assert.equal(summary.failed, 1)
    assert.equal(validateVideoAndEditionMock.mock.calls.length, 1)
    assert.equal(createR2AssetMock.mock.calls.length, 0)
    assert.equal(uploadToR2Mock.mock.calls.length, 0)
  })

  it('should fail before creating an R2 asset when mp4 metadata cannot be read', async () => {
    validateVideoAndEditionMock.mock.mockImplementation(async () => ({
      editionId: 'edition-id'
    }))
    getVideoMetadataMock.mock.mockImplementation(async () => {
      throw new Error('No video streams found in file')
    })
    const consoleErrorMock = mock.method(console, 'error', () => {})
    const summary = createProcessingSummary(1)

    await processVideoFile(
      '0_JesusVisionJohn---base---3934---999.mp4',
      '/tmp/0_JesusVisionJohn---base---3934---999.mp4',
      128,
      summary
    )

    assert.equal(consoleErrorMock.mock.calls.length, 1)
    assert.equal(summary.successful, 0)
    assert.equal(summary.failed, 1)
    assert.equal(validateVideoAndEditionMock.mock.calls.length, 1)
    assert.equal(getVideoMetadataMock.mock.calls.length, 1)
    assert.equal(createR2AssetMock.mock.calls.length, 0)
    assert.equal(uploadToR2Mock.mock.calls.length, 0)
    assert.equal(requestMock.mock.calls.length, 0)
  })
})
