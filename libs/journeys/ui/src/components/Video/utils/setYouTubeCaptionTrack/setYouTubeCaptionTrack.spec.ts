import { YoutubeTech } from '../videoJsTypes/YoutubeTech'

import { setYouTubeCaptionTrack } from './setYouTubeCaptionTrack'

describe('setYouTubeCaptionTrack', () => {
  let mockYtPlayer: YoutubeTech['ytPlayer']
  let mockLoadModule: jest.Mock
  let mockSetOption: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    mockLoadModule = jest.fn()
    mockSetOption = jest.fn()

    mockYtPlayer = {
      loadModule: mockLoadModule,
      setOption: mockSetOption
    } as unknown as YoutubeTech['ytPlayer']
  })

  it('should call loadModule with "captions" and setOption with languageCode', () => {
    const languageCode = 'en'

    setYouTubeCaptionTrack(mockYtPlayer, languageCode)

    expect(mockLoadModule).toHaveBeenCalledWith('captions')
    expect(mockSetOption).toHaveBeenCalledWith('captions', 'track', {
      languageCode
    })
  })

  it('should handle different language codes', () => {
    const languageCode = 'es'

    setYouTubeCaptionTrack(mockYtPlayer, languageCode)

    expect(mockLoadModule).toHaveBeenCalledWith('captions')
    expect(mockSetOption).toHaveBeenCalledWith('captions', 'track', {
      languageCode: 'es'
    })
  })

  it('should return early when ytPlayer is null', () => {
    const languageCode = 'en'

    setYouTubeCaptionTrack(null, languageCode)

    expect(mockLoadModule).not.toHaveBeenCalled()
    expect(mockSetOption).not.toHaveBeenCalled()
  })

  it('should return early when languageCode is undefined', () => {
    setYouTubeCaptionTrack(mockYtPlayer, undefined)

    expect(mockLoadModule).not.toHaveBeenCalled()
    expect(mockSetOption).not.toHaveBeenCalled()
  })

  it('should return early when languageCode is null', () => {
    setYouTubeCaptionTrack(mockYtPlayer, null as any)

    expect(mockLoadModule).not.toHaveBeenCalled()
    expect(mockSetOption).not.toHaveBeenCalled()
  })

  it('should handle ytPlayer with undefined loadModule', () => {
    const ytPlayerWithoutLoadModule = {
      setOption: mockSetOption
    } as unknown as YoutubeTech['ytPlayer']

    const languageCode = 'en'

    setYouTubeCaptionTrack(ytPlayerWithoutLoadModule, languageCode)

    expect(mockSetOption).toHaveBeenCalledWith('captions', 'track', {
      languageCode
    })
  })

  it('should handle ytPlayer with undefined setOption', () => {
    const ytPlayerWithoutSetOption = {
      loadModule: mockLoadModule
    } as unknown as YoutubeTech['ytPlayer']

    const languageCode = 'en'

    setYouTubeCaptionTrack(ytPlayerWithoutSetOption, languageCode)

    expect(mockLoadModule).toHaveBeenCalledWith('captions')
  })

  it('should handle ytPlayer with both undefined loadModule and setOption', () => {
    const ytPlayerWithoutBoth = {} as YoutubeTech['ytPlayer']

    const languageCode = 'en'

    setYouTubeCaptionTrack(ytPlayerWithoutBoth, languageCode)

    expect(mockLoadModule).not.toHaveBeenCalled()
    expect(mockSetOption).not.toHaveBeenCalled()
  })

  it('should handle empty string languageCode', () => {
    const languageCode = ''

    setYouTubeCaptionTrack(mockYtPlayer, languageCode)

    expect(mockLoadModule).toHaveBeenCalledWith('captions')
    expect(mockSetOption).toHaveBeenCalledWith('captions', 'track', {
      languageCode: ''
    })
  })

  it('should call methods in correct order', () => {
    const languageCode = 'fr'
    const callOrder: string[] = []

    mockLoadModule.mockImplementation(() => {
      callOrder.push('loadModule')
    })
    mockSetOption.mockImplementation(() => {
      callOrder.push('setOption')
    })

    setYouTubeCaptionTrack(mockYtPlayer, languageCode)

    expect(callOrder).toEqual(['loadModule', 'setOption'])
  })

  it('should work with complex language codes', () => {
    const languageCode = 'pt-BR'

    setYouTubeCaptionTrack(mockYtPlayer, languageCode)

    expect(mockLoadModule).toHaveBeenCalledWith('captions')
    expect(mockSetOption).toHaveBeenCalledWith('captions', 'track', {
      languageCode: 'pt-BR'
    })
  })
})
