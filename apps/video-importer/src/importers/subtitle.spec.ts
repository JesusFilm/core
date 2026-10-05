import assert from 'node:assert/strict'
import { afterEach, before, describe, it, mock } from 'node:test'

import { createProcessingSummary, type ProcessingSummary } from '../types'

const validateVideoAndEditionMock = mock.fn()
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
  createR2AssetMock.mock.resetCalls()
  uploadToR2Mock.mock.resetCalls()
  formatR2AssetDiagnosticMock.mock.resetCalls()
  requestMock.mock.resetCalls()
  markFileAsCompletedMock.mock.resetCalls()
}

let SUBTITLE_FILENAME_REGEX: RegExp
let processSubtitleFile: (
  file: string,
  filePath: string,
  contentLength: number,
  summary: ProcessingSummary
) => Promise<void>
let importOrUpdateSubtitle: typeof import('./subtitle').importOrUpdateSubtitle

before(async () => {
  const subtitleModule = await import('./subtitle')
  const exports = getModuleExports(subtitleModule)
  SUBTITLE_FILENAME_REGEX = exports.SUBTITLE_FILENAME_REGEX
  processSubtitleFile = exports.processSubtitleFile
  importOrUpdateSubtitle = exports.importOrUpdateSubtitle
})

describe('SUBTITLE_FILENAME_REGEX', () => {
  afterEach(resetMockCalls)

  it('matches srt and vtt subtitle filenames', () => {
    assert.equal(
      SUBTITLE_FILENAME_REGEX.test('0_JesusVisionJohn---base---3934.srt'),
      true
    )
    assert.equal(
      SUBTITLE_FILENAME_REGEX.test('0_JesusVisionJohn---base---3934.vtt'),
      true
    )
  })
})

describe('processSubtitleFile', () => {
  afterEach(resetMockCalls)

  it('should fail before uploading subtitle content when languageId is blank', async () => {
    const consoleErrorMock = mock.method(console, 'error', () => {})
    const summary = createProcessingSummary(1)

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
    assert.equal(validateVideoAndEditionMock.mock.calls.length, 0)
  })

  it('creates a new SRT subtitle and marks the file completed', async () => {
    validateVideoAndEditionMock.mock.mockImplementation(async () => undefined)
    createR2AssetMock.mock.mockImplementation(async () => ({
      id: 'srt-asset',
      uploadUrl: 'https://upload.example.com/subtitle.srt',
      publicUrl: 'https://cdn.example.com/subtitle.srt'
    }))
    uploadToR2Mock.mock.mockImplementation(async () => undefined)
    requestMock.mock.mockImplementation(async () => ({
      video: { subtitles: [] }
    }))
    markFileAsCompletedMock.mock.mockImplementation(async () => undefined)

    const summary = createProcessingSummary(1)

    await processSubtitleFile(
      '0_JesusVisionJohn---base---3934.srt',
      '/tmp/0_JesusVisionJohn---base---3934.srt',
      126,
      summary
    )

    assert.equal(summary.successful, 1)
    assert.equal(summary.failed, 0)
    assert.equal(validateVideoAndEditionMock.mock.calls.length, 1)
    assert.equal(createR2AssetMock.mock.calls.length, 1)
    assert.deepEqual(createR2AssetMock.mock.calls[0].arguments[0], {
      fileName:
        '0_JesusVisionJohn/editions/base/subtitles/3934_base_0_JesusVisionJohn.srt',
      contentType: 'text/srt',
      originalFilename: '0_JesusVisionJohn---base---3934.srt',
      videoId: '0_JesusVisionJohn',
      contentLength: 126
    })
    assert.equal(uploadToR2Mock.mock.calls.length, 1)
    assert.equal(requestMock.mock.calls.length, 2)
    assert.equal(markFileAsCompletedMock.mock.calls.length, 1)
  })

  it('updates an existing VTT subtitle and increments only the VTT version', async () => {
    validateVideoAndEditionMock.mock.mockImplementation(async () => undefined)
    createR2AssetMock.mock.mockImplementation(async () => ({
      id: 'vtt-asset-new',
      uploadUrl: 'https://upload.example.com/subtitle.vtt',
      publicUrl: 'https://cdn.example.com/subtitle.vtt'
    }))
    uploadToR2Mock.mock.mockImplementation(async () => undefined)
    requestMock.mock.mockImplementation(async () => ({
      video: {
        subtitles: [
          {
            id: 'subtitle-id',
            videoId: '0_JesusVisionJohn',
            edition: 'base',
            languageId: '3934',
            primary: false,
            srtSrc: 'https://cdn.example.com/subtitle.srt',
            srtAssetId: 'srt-asset-old',
            srtVersion: 3,
            vttSrc: 'https://cdn.example.com/old.vtt',
            vttAssetId: 'vtt-asset-old',
            vttVersion: 4
          }
        ]
      }
    }))
    markFileAsCompletedMock.mock.mockImplementation(async () => undefined)

    const summary = createProcessingSummary(1)

    await processSubtitleFile(
      '0_JesusVisionJohn---base---3934.vtt',
      '/tmp/0_JesusVisionJohn---base---3934.vtt',
      130,
      summary
    )

    const updateInput = requestMock.mock.calls[1].arguments[1].input
    assert.equal(updateInput.srtSrc, 'https://cdn.example.com/subtitle.srt')
    assert.equal(updateInput.srtAssetId, 'srt-asset-old')
    assert.equal(updateInput.srtVersion, undefined)
    assert.equal(updateInput.vttSrc, 'https://cdn.example.com/subtitle.vtt')
    assert.equal(updateInput.vttAssetId, 'vtt-asset-new')
    assert.equal(updateInput.vttVersion, 5)
    assert.equal(summary.successful, 1)
  })

  it('fails before R2 asset creation when video validation fails', async () => {
    validateVideoAndEditionMock.mock.mockImplementation(async () => {
      throw new Error('Video does not exist')
    })
    const consoleErrorMock = mock.method(console, 'error', () => {})
    const summary = createProcessingSummary(1)

    await processSubtitleFile(
      'missing_0_JesusVisionJohn---base---3934.srt',
      '/tmp/missing_0_JesusVisionJohn---base---3934.srt',
      126,
      summary
    )

    assert.equal(consoleErrorMock.mock.calls.length, 1)
    assert.equal(summary.failed, 1)
    assert.equal(createR2AssetMock.mock.calls.length, 0)
  })

  it('records R2 create and upload failures without marking completed', async () => {
    validateVideoAndEditionMock.mock.mockImplementation(async () => undefined)
    createR2AssetMock.mock.mockImplementationOnce(async () => {
      throw new Error('create failed')
    })
    const consoleErrorMock = mock.method(console, 'error', () => {})
    const createSummary = createProcessingSummary(1)

    await processSubtitleFile(
      '0_JesusVisionJohn---base---3934.srt',
      '/tmp/0_JesusVisionJohn---base---3934.srt',
      126,
      createSummary
    )

    assert.equal(createSummary.failed, 1)
    assert.match(createSummary.failureDetails[0].reason, /R2 create asset/)

    resetMockCalls()
    validateVideoAndEditionMock.mock.mockImplementation(async () => undefined)
    createR2AssetMock.mock.mockImplementation(async () => ({
      id: 'asset-id',
      uploadUrl: 'https://upload.example.com/subtitle.srt',
      publicUrl: 'https://cdn.example.com/subtitle.srt'
    }))
    uploadToR2Mock.mock.mockImplementation(async () => {
      throw new Error('upload failed')
    })
    const uploadSummary = createProcessingSummary(1)

    await processSubtitleFile(
      '0_JesusVisionJohn---base---3934.srt',
      '/tmp/0_JesusVisionJohn---base---3934.srt',
      126,
      uploadSummary
    )

    assert.equal(consoleErrorMock.mock.calls.length >= 2, true)
    assert.equal(uploadSummary.failed, 1)
    assert.match(uploadSummary.failureDetails[0].reason, /R2 upload/)
    assert.match(uploadSummary.failureDetails[0].reason, /assetId=test-asset/)
    assert.equal(markFileAsCompletedMock.mock.calls.length, 0)
  })
})

describe('importOrUpdateSubtitle', () => {
  afterEach(resetMockCalls)

  it('throws a friendly fetch error when existing subtitles cannot be read', async () => {
    requestMock.mock.mockImplementation(async () => {
      throw new Error('query failed')
    })
    const consoleErrorMock = mock.method(console, 'error', () => {})

    await assert.rejects(
      importOrUpdateSubtitle({
        videoId: '0_JesusVisionJohn',
        editionName: 'base',
        languageId: '3934',
        fileType: 'text/srt',
        r2Asset: {
          id: 'asset-id',
          uploadUrl: 'https://upload.example.com/subtitle.srt',
          publicUrl: 'https://cdn.example.com/subtitle.srt'
        }
      }),
      /Failed to fetch existing subtitle/
    )
    assert.equal(consoleErrorMock.mock.calls.length, 1)
  })
})
