import { VideoFields_subtitleLanguage as SubtitleLanguage } from '../../__generated__/VideoFields'
import { getYouTubePlayer } from '../getYouTubePlayer'
import { removeAllRemoteTextTracks } from '../removeAllRemoteTextTracks'
import { setYouTubeCaptionTrack } from '../setYouTubeCaptionTrack'
import VideoJsPlayer from '../videoJsTypes'
import { YoutubeCaptionLanguages } from '../videoJsTypes/YoutubeTech'

import { extractYouTubeCaptionsAndAddTextTracks } from './extractYouTubeCaptionsAndAddTextTracks'

jest.mock('../getYouTubePlayer')
jest.mock('../removeAllRemoteTextTracks')
jest.mock('../setYouTubeCaptionTrack')

const mockGetYouTubePlayer = getYouTubePlayer as jest.MockedFunction<
  typeof getYouTubePlayer
>
const mockRemoveAllRemoteTextTracks =
  removeAllRemoteTextTracks as jest.MockedFunction<
    typeof removeAllRemoteTextTracks
  >
const mockSetYouTubeCaptionTrack =
  setYouTubeCaptionTrack as jest.MockedFunction<typeof setYouTubeCaptionTrack>

describe('extractYouTubeCaptionsAndAddTextTracks', () => {
  let mockPlayer: VideoJsPlayer
  let mockYtPlayer: any
  let mockAddRemoteTextTrack: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    mockAddRemoteTextTrack = jest.fn()
    mockPlayer = {
      addRemoteTextTrack: mockAddRemoteTextTrack,
      remoteTextTracks: jest.fn(() => []),
      removeRemoteTextTrack: jest.fn()
    } as unknown as VideoJsPlayer

    mockYtPlayer = {
      getOption: jest.fn(),
      loadModule: jest.fn(),
      setOption: jest.fn()
    }

    mockGetYouTubePlayer.mockReturnValue(mockYtPlayer)
  })

  it('should return early without calling any functions when YouTube player is not available', () => {
    mockGetYouTubePlayer.mockReturnValue(null)

    extractYouTubeCaptionsAndAddTextTracks({
      player: mockPlayer,
      subtitleLanguage: null
    })

    expect(mockRemoveAllRemoteTextTracks).not.toHaveBeenCalled()
    expect(mockAddRemoteTextTrack).not.toHaveBeenCalled()
    expect(mockSetYouTubeCaptionTrack).not.toHaveBeenCalled()
  })

  it('should remove all existing remote text tracks', () => {
    const languages: YoutubeCaptionLanguages[] = []
    mockYtPlayer.getOption.mockReturnValue(languages)

    extractYouTubeCaptionsAndAddTextTracks({
      player: mockPlayer,
      subtitleLanguage: null
    })

    expect(mockRemoveAllRemoteTextTracks).toHaveBeenCalledWith(mockPlayer)
  })

  it('should handle empty languages array', () => {
    const languages: YoutubeCaptionLanguages[] = []
    mockYtPlayer.getOption.mockReturnValue(languages)

    extractYouTubeCaptionsAndAddTextTracks({
      player: mockPlayer,
      subtitleLanguage: null
    })

    expect(mockAddRemoteTextTrack).not.toHaveBeenCalled()
    expect(mockSetYouTubeCaptionTrack).not.toHaveBeenCalled()
  })

  it('should handle undefined languages from getOption', () => {
    mockYtPlayer.getOption.mockReturnValue(undefined)

    extractYouTubeCaptionsAndAddTextTracks({
      player: mockPlayer,
      subtitleLanguage: null
    })

    expect(mockAddRemoteTextTrack).not.toHaveBeenCalled()
    expect(mockSetYouTubeCaptionTrack).not.toHaveBeenCalled()
  })

  it('should add text tracks for languages with valid languageCode and languageName', () => {
    const languages: YoutubeCaptionLanguages[] = [
      {
        id: 'en',
        languageCode: 'en',
        languageName: 'English',
        displayName: 'English',
        is_default: false,
        is_servable: true,
        is_translateable: false,
        kind: 'captions',
        name: 'English',
        vss_id: 'en'
      },
      {
        id: 'es',
        languageCode: 'es',
        languageName: 'Spanish',
        displayName: 'Spanish',
        is_default: false,
        is_servable: true,
        is_translateable: false,
        kind: 'captions',
        name: 'Spanish',
        vss_id: 'es'
      }
    ]
    mockYtPlayer.getOption.mockReturnValue(languages)

    extractYouTubeCaptionsAndAddTextTracks({
      player: mockPlayer,
      subtitleLanguage: null
    })

    expect(mockAddRemoteTextTrack).toHaveBeenCalledTimes(2)
    expect(mockAddRemoteTextTrack).toHaveBeenCalledWith(
      {
        id: 'en',
        kind: 'captions',
        srclang: 'en',
        label: 'English',
        mode: 'hidden'
      },
      true
    )
    expect(mockAddRemoteTextTrack).toHaveBeenCalledWith(
      {
        id: 'es',
        kind: 'captions',
        srclang: 'es',
        label: 'Spanish',
        mode: 'hidden'
      },
      true
    )
  })

  it('should skip languages with null languageCode', () => {
    const languages: YoutubeCaptionLanguages[] = [
      {
        id: 'en',
        languageCode: null as any,
        languageName: 'English',
        displayName: 'English',
        is_default: false,
        is_servable: true,
        is_translateable: false,
        kind: 'captions',
        name: 'English',
        vss_id: 'en'
      }
    ]
    mockYtPlayer.getOption.mockReturnValue(languages)

    extractYouTubeCaptionsAndAddTextTracks({
      player: mockPlayer,
      subtitleLanguage: null
    })

    expect(mockAddRemoteTextTrack).not.toHaveBeenCalled()
  })

  it('should skip languages with null languageName', () => {
    const languages: YoutubeCaptionLanguages[] = [
      {
        id: 'en',
        languageCode: 'en',
        languageName: null as any,
        displayName: 'English',
        is_default: false,
        is_servable: true,
        is_translateable: false,
        kind: 'captions',
        name: 'English',
        vss_id: 'en'
      }
    ]
    mockYtPlayer.getOption.mockReturnValue(languages)

    extractYouTubeCaptionsAndAddTextTracks({
      player: mockPlayer,
      subtitleLanguage: null
    })

    expect(mockAddRemoteTextTrack).not.toHaveBeenCalled()
  })

  it('should set mode to "showing" for matching subtitle language', () => {
    const subtitleLanguage: SubtitleLanguage = {
      __typename: 'Language',
      id: 'en-id',
      bcp47: 'en'
    }

    const languages: YoutubeCaptionLanguages[] = [
      {
        id: 'en',
        languageCode: 'en',
        languageName: 'English',
        displayName: 'English',
        is_default: false,
        is_servable: true,
        is_translateable: false,
        kind: 'captions',
        name: 'English',
        vss_id: 'en'
      },
      {
        id: 'es',
        languageCode: 'es',
        languageName: 'Spanish',
        displayName: 'Spanish',
        is_default: false,
        is_servable: true,
        is_translateable: false,
        kind: 'captions',
        name: 'Spanish',
        vss_id: 'es'
      }
    ]
    mockYtPlayer.getOption.mockReturnValue(languages)

    extractYouTubeCaptionsAndAddTextTracks({
      player: mockPlayer,
      subtitleLanguage
    })

    expect(mockAddRemoteTextTrack).toHaveBeenCalledTimes(2)
    expect(mockAddRemoteTextTrack).toHaveBeenCalledWith(
      {
        id: 'en',
        kind: 'captions',
        srclang: 'en',
        label: 'English',
        mode: 'showing'
      },
      true
    )
    expect(mockAddRemoteTextTrack).toHaveBeenCalledWith(
      {
        id: 'es',
        kind: 'captions',
        srclang: 'es',
        label: 'Spanish',
        mode: 'hidden'
      },
      true
    )
  })

  it('should call setYouTubeCaptionTrack for matching language', () => {
    const subtitleLanguage: SubtitleLanguage = {
      __typename: 'Language',
      id: 'en-id',
      bcp47: 'en'
    }

    const languages: YoutubeCaptionLanguages[] = [
      {
        id: 'en',
        languageCode: 'en',
        languageName: 'English',
        displayName: 'English',
        is_default: false,
        is_servable: true,
        is_translateable: false,
        kind: 'captions',
        name: 'English',
        vss_id: 'en'
      }
    ]
    mockYtPlayer.getOption.mockReturnValue(languages)

    extractYouTubeCaptionsAndAddTextTracks({
      player: mockPlayer,
      subtitleLanguage
    })

    expect(mockSetYouTubeCaptionTrack).toHaveBeenCalledWith(mockYtPlayer, 'en')
  })

  it('should not call setYouTubeCaptionTrack for non-matching language', () => {
    const subtitleLanguage: SubtitleLanguage = {
      __typename: 'Language',
      id: 'en-id',
      bcp47: 'en'
    }

    const languages: YoutubeCaptionLanguages[] = [
      {
        id: 'es',
        languageCode: 'es',
        languageName: 'Spanish',
        displayName: 'Spanish',
        is_default: false,
        is_servable: true,
        is_translateable: false,
        kind: 'captions',
        name: 'Spanish',
        vss_id: 'es'
      }
    ]
    mockYtPlayer.getOption.mockReturnValue(languages)

    extractYouTubeCaptionsAndAddTextTracks({
      player: mockPlayer,
      subtitleLanguage
    })

    expect(mockSetYouTubeCaptionTrack).not.toHaveBeenCalled()
  })

  it('should handle subtitle language with null bcp47', () => {
    const subtitleLanguageWithNullBcp47: SubtitleLanguage = {
      __typename: 'Language',
      id: 'en-id',
      bcp47: null
    }

    const languages: YoutubeCaptionLanguages[] = [
      {
        id: 'en',
        languageCode: 'en',
        languageName: 'English',
        displayName: 'English',
        is_default: false,
        is_servable: true,
        is_translateable: false,
        kind: 'captions',
        name: 'English',
        vss_id: 'en'
      }
    ]
    mockYtPlayer.getOption.mockReturnValue(languages)

    extractYouTubeCaptionsAndAddTextTracks({
      player: mockPlayer,
      subtitleLanguage: subtitleLanguageWithNullBcp47
    })

    expect(mockAddRemoteTextTrack).toHaveBeenCalledWith(
      {
        id: 'en',
        kind: 'captions',
        srclang: 'en',
        label: 'English',
        mode: 'hidden'
      },
      true
    )
    expect(mockSetYouTubeCaptionTrack).not.toHaveBeenCalled()
  })

  it('should set all tracks to hidden mode with null subtitle language', () => {
    const languages: YoutubeCaptionLanguages[] = [
      {
        id: 'en',
        languageCode: 'en',
        languageName: 'English',
        displayName: 'English',
        is_default: false,
        is_servable: true,
        is_translateable: false,
        kind: 'captions',
        name: 'English',
        vss_id: 'en'
      }
    ]
    mockYtPlayer.getOption.mockReturnValue(languages)

    extractYouTubeCaptionsAndAddTextTracks({
      player: mockPlayer,
      subtitleLanguage: null
    })

    expect(mockAddRemoteTextTrack).toHaveBeenCalledWith(
      {
        id: 'en',
        kind: 'captions',
        srclang: 'en',
        label: 'English',
        mode: 'hidden'
      },
      true
    )
    expect(mockSetYouTubeCaptionTrack).not.toHaveBeenCalled()
  })
})
