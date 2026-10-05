import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'

import { getAudioMetadata, getVideoMetadata } from './fileMetadataHelpers'

const fixtureDir = path.resolve('apps/video-importer/test-videos')
const validVideoFixture = path.join(
  fixtureDir,
  '0_JesusVisionJohn---base---3934---1.mp4'
)
const invalidVideoFixture = path.join(
  fixtureDir,
  '0_JesusVisionJohn---base---3934---999.mp4'
)
const audioPreviewFixture = path.join(fixtureDir, '3934.aac')

describe('fileMetadataHelpers local fixtures', () => {
  it(
    'reads video metadata from the generated importer MP4 fixture',
    { skip: !existsSync(validVideoFixture) },
    async () => {
      const metadata = await getVideoMetadata(validVideoFixture)

      assert.equal(metadata.width, 2560)
      assert.equal(metadata.height, 1440)
      assert.equal(metadata.duration, 11)
      assert.equal(metadata.durationMs, 11083)
    }
  )

  it(
    'rejects importer-shaped MP4 fixture with invalid bytes before upload work',
    { skip: !existsSync(invalidVideoFixture) },
    async () => {
      await assert.rejects(
        getVideoMetadata(invalidVideoFixture),
        /Failed to parse ffprobe output|No video streams found|ffprobe/
      )
    }
  )

  it(
    'reads audio metadata from the generated AAC preview fixture',
    { skip: !existsSync(audioPreviewFixture) },
    async () => {
      const metadata = await getAudioMetadata(audioPreviewFixture)

      assert.equal(metadata.codec, 'AAC')
      assert.equal(metadata.duration, 4)
      assert.ok(metadata.bitrate > 0)
    }
  )
})
