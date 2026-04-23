import { VideoFields_subtitleLanguage as SubtitleLanguage } from '../../__generated__/VideoFields'
import { getYouTubePlayer } from '../getYouTubePlayer'
import { removeAllRemoteTextTracks } from '../removeAllRemoteTextTracks'
import { setYouTubeCaptionTrack } from '../setYouTubeCaptionTrack'
import { unloadYouTubeCaptions } from '../unloadYouTubeCaptions'
import VideoJsPlayer from '../videoJsTypes'
import { YoutubeCaptionLanguages } from '../videoJsTypes/YoutubeTech'

import { extractYouTubeCaptionsAndAddTextTracks } from './extractYouTubeCaptionsAndAddTextTracks'

jest.mock('../getYouTubePlayer')
jest.mock('../removeAllRemoteTextTracks')
jest.mock('../setYouTubeCaptionTrack')
jest.mock('../unloadYouTubeCaptions')

const mockGetYouTubePlayer = getYouTubePlayer as jest.MockedFunction<
  typeof getYouTubePlayer
>
const mockRemoveAllRemoteTextTracks =
  removeAllRemoteTextTracks as jest.MockedFunction<
    typeof removeAllRemoteTextTracks
  >
const mockSetYouTubeCaptionTrack =
  setYouTubeCaptionTrack as jest.MockedFunction<typeof setYouTubeCaptionTrack>
const mockUnloadYouTubeCaptions = unloadYouTubeCaptions as jest.MockedFunction<
  typeof unloadYouTubeCaptions
>

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
    expect(mockUnloadYouTubeCaptions).not.toHaveBeenCalled()
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
    expect(mockUnloadYouTubeCaptions).toHaveBeenCalledWith(mockYtPlayer)
  })

  it('should handle empty languages array', () => {
    const languages: YoutubeCaptionLanguages[] = []
    mockYtPlayer.getOption.mockReturnValue(languages)

    extractYouTubeCaptionsAndAddTextTracks({
      player: mockPlayer,
      subtitleLanguage: null
    })

    expect(mockUnloadYouTubeCaptions).toHaveBeenCalledWith(mockYtPlayer)
    expect(mockAddRemoteTextTrack).not.toHaveBeenCalled()
    expect(mockSetYouTubeCaptionTrack).not.toHaveBeenCalled()
  })

  it('should handle undefined languages from getOption', () => {
    mockYtPlayer.getOption.mockReturnValue(undefined)

    extractYouTubeCaptionsAndAddTextTracks({
      player: mockPlayer,
      subtitleLanguage: null
    })

    expect(mockUnloadYouTubeCaptions).toHaveBeenCalledWith(mockYtPlayer)
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

    expect(mockUnloadYouTubeCaptions).toHaveBeenCalledWith(mockYtPlayer)
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

    expect(mockUnloadYouTubeCaptions).toHaveBeenCalledWith(mockYtPlayer)
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

    expect(mockUnloadYouTubeCaptions).toHaveBeenCalledWith(mockYtPlayer)
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

    expect(mockUnloadYouTubeCaptions).toHaveBeenCalledWith(mockYtPlayer)
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

    expect(mockUnloadYouTubeCaptions).toHaveBeenCalledWith(mockYtPlayer)
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

    expect(mockUnloadYouTubeCaptions).toHaveBeenCalledWith(mockYtPlayer)
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

    expect(mockUnloadYouTubeCaptions).toHaveBeenCalledWith(mockYtPlayer)
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

  it('should match locale-variant languageCode to base bcp47', () => {
    const subtitleLanguage: SubtitleLanguage = {
      __typename: 'Language',
      id: 'en-id',
      bcp47: 'en'
    }

    const languages: YoutubeCaptionLanguages[] = [
      {
        id: 'en-GB',
        languageCode: 'en-GB',
        languageName: 'English (United Kingdom)',
        displayName: 'English (United Kingdom)',
        is_default: false,
        is_servable: true,
        is_translateable: false,
        kind: 'captions',
        name: 'English (United Kingdom)',
        vss_id: 'en-GB'
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
        id: 'en-GB',
        kind: 'captions',
        srclang: 'en-GB',
        label: 'English (United Kingdom)',
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
    expect(mockSetYouTubeCaptionTrack).toHaveBeenCalledTimes(1)
    expect(mockSetYouTubeCaptionTrack).toHaveBeenCalledWith(
      mockYtPlayer,
      'en-GB'
    )
  })

  it('should only activate first matching locale variant', () => {
    const subtitleLanguage: SubtitleLanguage = {
      __typename: 'Language',
      id: 'en-id',
      bcp47: 'en'
    }

    const languages: YoutubeCaptionLanguages[] = [
      {
        id: 'en-GB',
        languageCode: 'en-GB',
        languageName: 'English (United Kingdom)',
        displayName: 'English (United Kingdom)',
        is_default: false,
        is_servable: true,
        is_translateable: false,
        kind: 'captions',
        name: 'English (United Kingdom)',
        vss_id: 'en-GB'
      },
      {
        id: 'en-US',
        languageCode: 'en-US',
        languageName: 'English (United States)',
        displayName: 'English (United States)',
        is_default: false,
        is_servable: true,
        is_translateable: false,
        kind: 'captions',
        name: 'English (United States)',
        vss_id: 'en-US'
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
        id: 'en-GB',
        kind: 'captions',
        srclang: 'en-GB',
        label: 'English (United Kingdom)',
        mode: 'showing'
      },
      true
    )
    expect(mockAddRemoteTextTrack).toHaveBeenCalledWith(
      {
        id: 'en-US',
        kind: 'captions',
        srclang: 'en-US',
        label: 'English (United States)',
        mode: 'hidden'
      },
      true
    )
    expect(mockSetYouTubeCaptionTrack).toHaveBeenCalledTimes(1)
    expect(mockSetYouTubeCaptionTrack).toHaveBeenCalledWith(
      mockYtPlayer,
      'en-GB'
    )
  })

  it('should not match partial language codes', () => {
    const subtitleLanguage: SubtitleLanguage = {
      __typename: 'Language',
      id: 'en-id',
      bcp47: 'en'
    }

    const languages: YoutubeCaptionLanguages[] = [
      {
        id: 'end',
        languageCode: 'end',
        languageName: 'Ende',
        displayName: 'Ende',
        is_default: false,
        is_servable: true,
        is_translateable: false,
        kind: 'captions',
        name: 'Ende',
        vss_id: 'end'
      }
    ]
    mockYtPlayer.getOption.mockReturnValue(languages)

    extractYouTubeCaptionsAndAddTextTracks({
      player: mockPlayer,
      subtitleLanguage
    })

    expect(mockAddRemoteTextTrack).toHaveBeenCalledWith(
      {
        id: 'end',
        kind: 'captions',
        srclang: 'end',
        label: 'Ende',
        mode: 'hidden'
      },
      true
    )
    expect(mockSetYouTubeCaptionTrack).not.toHaveBeenCalled()
  })

  it('should match pt-BR locale variant to pt base code', () => {
    const subtitleLanguage: SubtitleLanguage = {
      __typename: 'Language',
      id: 'pt-id',
      bcp47: 'pt'
    }

    const languages: YoutubeCaptionLanguages[] = [
      {
        id: 'pt-BR',
        languageCode: 'pt-BR',
        languageName: 'Portuguese (Brazil)',
        displayName: 'Portuguese (Brazil)',
        is_default: false,
        is_servable: true,
        is_translateable: false,
        kind: 'captions',
        name: 'Portuguese (Brazil)',
        vss_id: 'pt-BR'
      }
    ]
    mockYtPlayer.getOption.mockReturnValue(languages)

    extractYouTubeCaptionsAndAddTextTracks({
      player: mockPlayer,
      subtitleLanguage
    })

    expect(mockAddRemoteTextTrack).toHaveBeenCalledWith(
      {
        id: 'pt-BR',
        kind: 'captions',
        srclang: 'pt-BR',
        label: 'Portuguese (Brazil)',
        mode: 'showing'
      },
      true
    )
    expect(mockSetYouTubeCaptionTrack).toHaveBeenCalledWith(
      mockYtPlayer,
      'pt-BR'
    )
  })

  it('should not match base languageCode when bcp47 is a locale variant', () => {
    const subtitleLanguage: SubtitleLanguage = {
      __typename: 'Language',
      id: 'en-gb-id',
      bcp47: 'en-GB'
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

    expect(mockUnloadYouTubeCaptions).toHaveBeenCalledWith(mockYtPlayer)
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
