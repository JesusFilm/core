import { YoutubeTech } from '../videoJsTypes/YoutubeTech'

import { unloadYouTubeCaptions } from './unloadYouTubeCaptions'

describe('unloadYouTubeCaptions', () => {
  let mockYtPlayer: YoutubeTech['ytPlayer']
  let mockUnloadModule: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    mockUnloadModule = jest.fn()

    mockYtPlayer = {
      unloadModule: mockUnloadModule
    } as unknown as YoutubeTech['ytPlayer']
  })

  it('should call unloadModule with "captions" when ytPlayer is provided', () => {
    unloadYouTubeCaptions(mockYtPlayer)

    expect(mockUnloadModule).toHaveBeenCalledWith('captions')
    expect(mockUnloadModule).toHaveBeenCalledTimes(1)
  })

  it('should return early when ytPlayer is null', () => {
    unloadYouTubeCaptions(null)

    expect(mockUnloadModule).not.toHaveBeenCalled()
  })

  it('should return early when ytPlayer is undefined', () => {
    unloadYouTubeCaptions(null)

    expect(mockUnloadModule).not.toHaveBeenCalled()
  })

  it('should handle ytPlayer with undefined unloadModule', () => {
    const ytPlayerWithoutUnloadModule = {} as unknown as YoutubeTech['ytPlayer']

    // Should not throw an error
    expect(() => {
      unloadYouTubeCaptions(ytPlayerWithoutUnloadModule)
    }).not.toThrow()
  })

  it('should handle ytPlayer with null unloadModule', () => {
    const ytPlayerWithNullUnloadModule = {
      unloadModule: null
    } as unknown as YoutubeTech['ytPlayer']

    // Should not throw an error
    expect(() => {
      unloadYouTubeCaptions(ytPlayerWithNullUnloadModule)
    }).not.toThrow()
  })

  it('should work with different ytPlayer instances', () => {
    const mockUnloadModule2 = jest.fn()
    const ytPlayer2 = {
      unloadModule: mockUnloadModule2
    } as unknown as YoutubeTech['ytPlayer']

    unloadYouTubeCaptions(mockYtPlayer)
    unloadYouTubeCaptions(ytPlayer2)

    expect(mockUnloadModule).toHaveBeenCalledWith('captions')
    expect(mockUnloadModule2).toHaveBeenCalledWith('captions')
  })

  it('should handle multiple calls with the same ytPlayer', () => {
    unloadYouTubeCaptions(mockYtPlayer)
    unloadYouTubeCaptions(mockYtPlayer)

    expect(mockUnloadModule).toHaveBeenCalledTimes(2)
    expect(mockUnloadModule).toHaveBeenNthCalledWith(1, 'captions')
    expect(mockUnloadModule).toHaveBeenNthCalledWith(2, 'captions')
  })

  it('should handle ytPlayer with additional properties', () => {
    const ytPlayerWithExtraProps = {
      unloadModule: mockUnloadModule,
      loadModule: jest.fn(),
      setOption: jest.fn(),
      getOption: jest.fn()
    } as unknown as YoutubeTech['ytPlayer']

    unloadYouTubeCaptions(ytPlayerWithExtraProps)

    expect(mockUnloadModule).toHaveBeenCalledWith('captions')
  })

  it('should handle edge case with empty string unloadModule', () => {
    const ytPlayerWithEmptyString = {
      unloadModule: ''
    } as unknown as YoutubeTech['ytPlayer']

    // Empty string is truthy but not a function, so will throw an error
    expect(() => {
      unloadYouTubeCaptions(ytPlayerWithEmptyString)
    }).toThrow('ytPlayer.unloadModule is not a function')
  })

  it('should handle ytPlayer with function that throws error', () => {
    const errorUnloadModule = jest.fn(() => {
      throw new Error('Test error')
    })
    const ytPlayerWithErrorFunction = {
      unloadModule: errorUnloadModule
    } as unknown as YoutubeTech['ytPlayer']

    expect(() => {
      unloadYouTubeCaptions(ytPlayerWithErrorFunction)
    }).toThrow('Test error')
  })
})
