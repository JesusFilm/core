import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseVideoFilename } from './videoFilename'

describe('parseVideoFilename', () => {
  it('parses the classic 4-segment shape', () => {
    const parsed = parseVideoFilename('1_jf-0-0---ot---529---1.mp4')

    assert.ok(parsed)
    assert.equal(parsed?.videoId, '1_jf-0-0')
    assert.equal(parsed?.edition, 'ot')
    assert.equal(parsed?.editionDisplay, 'ot')
    assert.equal(parsed?.languageId, '529')
    assert.equal(parsed?.version, '1')
    assert.equal(parsed?.burnedIn, false)
    assert.equal(parsed?.audioLanguageId, undefined)
    assert.equal(parsed?.audioVersion, undefined)
  })

  it('treats the 6-segment shape with trailing 0/0 as NOT burned-in and keeps the audio pair', () => {
    const parsed = parseVideoFilename(
      '1_jf6138-0-0---OT---6440---28288---0---0.mp4'
    )

    assert.ok(parsed)
    assert.equal(parsed?.videoId, '1_jf6138-0-0')
    assert.equal(parsed?.edition, 'ot')
    assert.equal(parsed?.editionDisplay, 'OT')
    assert.equal(parsed?.languageId, '6440')
    assert.equal(parsed?.version, '28288')
    assert.equal(parsed?.audioLanguageId, '6440')
    assert.equal(parsed?.audioVersion, '28288')
    assert.equal(parsed?.burnedIn, false)
  })

  it('uses the burned-in pair as the variant language/version when present', () => {
    const parsed = parseVideoFilename(
      '1_jf6138-0-0---OT---529---1234---6440---28288.mp4'
    )

    assert.ok(parsed)
    assert.equal(parsed?.videoId, '1_jf6138-0-0')
    assert.equal(parsed?.edition, 'ot')
    assert.equal(parsed?.languageId, '6440')
    assert.equal(parsed?.version, '28288')
    assert.equal(parsed?.audioLanguageId, '529')
    assert.equal(parsed?.audioVersion, '1234')
    assert.equal(parsed?.burnedIn, true)
  })

  it('treats blank trailing segments as 0-equivalent (non-burned-in)', () => {
    const parsed = parseVideoFilename(
      '1_jf6138-0-0---OT---529---1234---   ---   .mp4'
    )

    assert.ok(parsed)
    assert.equal(parsed?.burnedIn, false)
    assert.equal(parsed?.languageId, '529')
    assert.equal(parsed?.version, '1234')
  })

  it('returns null for unsupported segment counts', () => {
    assert.equal(parseVideoFilename('1_jf-0-0---ot---529.mp4'), null)
    assert.equal(
      parseVideoFilename('1_jf-0-0---ot---529---1---extra.mp4'),
      null
    )
    assert.equal(
      parseVideoFilename(
        '1_jf-0-0---ot---529---1---a---b---c.mp4'
      ),
      null
    )
  })

  it('returns null for non-mp4 files', () => {
    assert.equal(parseVideoFilename('1_jf-0-0---ot---529---1.srt'), null)
  })
})
