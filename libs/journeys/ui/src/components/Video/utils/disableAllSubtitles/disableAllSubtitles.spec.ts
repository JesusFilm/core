import VideoJsPlayer from '../videoJsTypes'

import { disableAllSubtitles } from './disableAllSubtitles'

describe('disableAllSubtitles', () => {
  function mockPlayer(tracks: Array<{ kind: string; mode: string }>): {
    player: VideoJsPlayer
    tracks: typeof tracks
  } {
    const player = {
      textTracks: vi.fn(() => tracks as unknown as TextTrackList)
    } as unknown as VideoJsPlayer
    return { player, tracks }
  }

  it('should disable subtitle and caption tracks', () => {
    const { player, tracks } = mockPlayer([
      { kind: 'subtitles', mode: 'showing' },
      { kind: 'captions', mode: 'hidden' }
    ])

    disableAllSubtitles(player)

    expect(tracks.map(({ mode }) => mode)).toEqual(['disabled', 'disabled'])
  })

  it('should disable tracks of non-standard kinds such as forced', () => {
    const { player, tracks } = mockPlayer([
      { kind: 'forced', mode: 'showing' },
      { kind: 'descriptions', mode: 'showing' }
    ])

    disableAllSubtitles(player)

    expect(tracks.map(({ mode }) => mode)).toEqual(['disabled', 'disabled'])
  })

  it('should leave metadata and chapters tracks alone', () => {
    const { player, tracks } = mockPlayer([
      { kind: 'metadata', mode: 'hidden' },
      { kind: 'chapters', mode: 'showing' }
    ])

    disableAllSubtitles(player)

    expect(tracks.map(({ mode }) => mode)).toEqual(['hidden', 'showing'])
  })

  it('should do nothing when the player has no text tracks', () => {
    const player = {
      textTracks: vi.fn(() => undefined)
    } as unknown as VideoJsPlayer

    expect(() => disableAllSubtitles(player)).not.toThrow()
  })
})
