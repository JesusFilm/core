import { editInput } from './editContract'
import {
  mediaCommand,
  mediaCommandRegistry,
  mediaSearchInput
} from './mediaContract'

describe('typed mounted media commands', () => {
  it.each(Object.entries(mediaCommandRegistry))(
    'implements a closed registry row for %s',
    (_type, entry) => {
      expect(mediaCommand.safeParse(entry.fixtures.accepted).success).toBe(true)
      expect(mediaCommand.safeParse(entry.fixtures.rejected).success).toBe(
        false
      )
      expect(entry.dependencies).toContain('media-source-generation')
    }
  )
  it.each([-1, 101, 0.5])('rejects focal percentage %s', (focalLeft) => {
    expect(
      mediaCommand.safeParse({
        type: 'image_set',
        block: { id: 'image' },
        focalLeft
      }).success
    ).toBe(false)
  })
  it.each([99, 105, 201])(
    'rejects zoom percentage %s outside the mounted increments',
    (scale) => {
      expect(
        mediaCommand.safeParse({
          type: 'image_set',
          block: { id: 'image' },
          scale
        }).success
      ).toBe(false)
    }
  )
  it('rejects empty sparse edits and unsupported provider or metadata injection', () => {
    for (const value of [
      { type: 'image_set', block: { id: 'image' } },
      { type: 'video_settings_set', block: { id: 'video' } },
      {
        type: 'image_set',
        block: { id: 'image' },
        width: 100,
        src: 'http://127.0.0.1/file'
      },
      {
        type: 'video_source_set',
        block: { id: 'video' },
        source: { source: 'cloudflare', videoId: 'unsupported' }
      },
      {
        type: 'media_slot_set',
        target: { slot: 'poster', owner: { id: 'video' } },
        media: { kind: 'video', source: { source: 'mux', videoId: 'asset' } }
      },
      { type: 'video_settings_set', block: { id: 'video' }, fullsize: true }
    ])
      expect(mediaCommand.safeParse(value).success).toBe(false)
  })
  it('bounds discovery and requires the selected video for language and YouTube lookup', () => {
    expect(
      mediaSearchInput.parse({ journeyId: 'j', source: 'library' }).limit
    ).toBe(20)
    for (const value of [
      { source: 'languages' },
      { source: 'youTube', videoId: 'invalid' },
      { source: 'library', limit: 51 },
      { source: 'library', query: 'x'.repeat(201) }
    ])
      expect(
        mediaSearchInput.safeParse({ journeyId: 'j', ...value }).success
      ).toBe(false)
  })
  it('accepts source selection in the same closed atomic edit envelope', () => {
    expect(
      editInput.safeParse({
        journeyId: 'j',
        expectedRevision: '0',
        idempotencyKey: '1234567890123456',
        commands: [mediaCommandRegistry.image_set.fixtures.accepted]
      }).success
    ).toBe(true)
  })
})
