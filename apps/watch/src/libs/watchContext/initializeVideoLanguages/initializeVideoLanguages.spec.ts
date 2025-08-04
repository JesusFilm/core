import { Dispatch } from 'react'

import { WatchAction } from '../WatchContext'

import { initializeVideoLanguages } from './initializeVideoLanguages'

describe('initializeVideoLanguages', () => {
  let mockDispatch: jest.MockedFunction<Dispatch<WatchAction>>

  beforeEach(() => {
    mockDispatch = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should dispatch SetVideoAudioLanguages action with provided audio languages', () => {
    const mockAudioLanguages = [
      {
        language: {
          id: '529',
          slug: 'english',
          name: [
            { primary: true, value: 'English', __typename: 'LanguageName' }
          ],
          __typename: 'Language'
        },
        slug: 'english',
        __typename: 'LanguageWithSlug'
      }
    ] as any

    const mockSubtitleLanguages = [
      {
        language: {
          id: '529',
          bcp47: 'en',
          name: [
            { primary: true, value: 'English', __typename: 'LanguageName' }
          ],
          __typename: 'Language'
        },
        value: 'English subtitles',
        __typename: 'VideoSubtitle'
      }
    ] as any

    initializeVideoLanguages(
      mockDispatch,
      mockAudioLanguages,
      mockSubtitleLanguages
    )

    expect(mockDispatch).toHaveBeenCalledTimes(2)

    // Check first call - SetVideoAudioLanguages
    expect(mockDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SetVideoAudioLanguages',
      videoAudioLanguages: mockAudioLanguages
    })
  })

  it('should dispatch SetVideoSubtitleLanguages action with provided subtitle languages', () => {
    const mockAudioLanguages = [
      {
        language: {
          id: '529',
          slug: 'english',
          name: [
            { primary: true, value: 'English', __typename: 'LanguageName' }
          ],
          __typename: 'Language'
        },
        slug: 'english',
        __typename: 'LanguageWithSlug'
      }
    ] as any

    const mockSubtitleLanguages = [
      {
        language: {
          id: '529',
          bcp47: 'en',
          name: [
            { primary: true, value: 'English', __typename: 'LanguageName' }
          ],
          __typename: 'Language'
        },
        value: 'English subtitles',
        __typename: 'VideoSubtitle'
      }
    ] as any

    initializeVideoLanguages(
      mockDispatch,
      mockAudioLanguages,
      mockSubtitleLanguages
    )

    expect(mockDispatch).toHaveBeenCalledTimes(2)

    // Check second call - SetVideoSubtitleLanguages
    expect(mockDispatch).toHaveBeenNthCalledWith(2, {
      type: 'SetVideoSubtitleLanguages',
      videoSubtitleLanguages: mockSubtitleLanguages
    })
  })

  it('should call actions in correct order, audio first, then subtitle', () => {
    const mockAudioLanguages = [
      {
        language: {
          id: '529',
          slug: 'english',
          name: [
            { primary: true, value: 'English', __typename: 'LanguageName' }
          ],
          __typename: 'Language'
        },
        slug: 'english',
        __typename: 'LanguageWithSlug'
      }
    ] as any

    const mockSubtitleLanguages = [
      {
        language: {
          id: '529',
          bcp47: 'en',
          name: [
            { primary: true, value: 'English', __typename: 'LanguageName' }
          ],
          __typename: 'Language'
        },
        value: 'English subtitles',
        __typename: 'VideoSubtitle'
      }
    ] as any

    initializeVideoLanguages(
      mockDispatch,
      mockAudioLanguages,
      mockSubtitleLanguages
    )

    expect(mockDispatch).toHaveBeenCalledTimes(2)

    // Verify order: SetVideoAudioLanguages first, then SetVideoSubtitleLanguages
    expect(mockDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SetVideoAudioLanguages',
      videoAudioLanguages: mockAudioLanguages
    })

    expect(mockDispatch).toHaveBeenNthCalledWith(2, {
      type: 'SetVideoSubtitleLanguages',
      videoSubtitleLanguages: mockSubtitleLanguages
    })
  })

  it('should handle empty audio languages array', () => {
    const mockSubtitleLanguages = [
      {
        language: {
          id: '529',
          bcp47: 'en',
          name: [
            { primary: true, value: 'English', __typename: 'LanguageName' }
          ],
          __typename: 'Language'
        },
        value: 'English subtitles',
        __typename: 'VideoSubtitle'
      }
    ] as any

    initializeVideoLanguages(mockDispatch, [], mockSubtitleLanguages)

    expect(mockDispatch).toHaveBeenCalledTimes(2)

    expect(mockDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SetVideoAudioLanguages',
      videoAudioLanguages: []
    })

    expect(mockDispatch).toHaveBeenNthCalledWith(2, {
      type: 'SetVideoSubtitleLanguages',
      videoSubtitleLanguages: mockSubtitleLanguages
    })
  })

  it('should handle empty subtitle languages array', () => {
    const mockAudioLanguages = [
      {
        language: {
          id: '529',
          slug: 'english',
          name: [
            { primary: true, value: 'English', __typename: 'LanguageName' }
          ],
          __typename: 'Language'
        },
        slug: 'english',
        __typename: 'LanguageWithSlug'
      }
    ] as any

    initializeVideoLanguages(mockDispatch, mockAudioLanguages, [])

    expect(mockDispatch).toHaveBeenCalledTimes(2)

    expect(mockDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SetVideoAudioLanguages',
      videoAudioLanguages: mockAudioLanguages
    })

    expect(mockDispatch).toHaveBeenNthCalledWith(2, {
      type: 'SetVideoSubtitleLanguages',
      videoSubtitleLanguages: []
    })
  })

  it('should handle both empty arrays', () => {
    initializeVideoLanguages(mockDispatch, [], [])

    expect(mockDispatch).toHaveBeenCalledTimes(2)

    expect(mockDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SetVideoAudioLanguages',
      videoAudioLanguages: []
    })

    expect(mockDispatch).toHaveBeenNthCalledWith(2, {
      type: 'SetVideoSubtitleLanguages',
      videoSubtitleLanguages: []
    })
  })

  it('should handle undefined audio languages by converting to empty array', () => {
    const mockSubtitleLanguages = [
      {
        language: {
          id: '529',
          bcp47: 'en',
          name: [
            { primary: true, value: 'English', __typename: 'LanguageName' }
          ],
          __typename: 'Language'
        },
        value: 'English subtitles',
        __typename: 'VideoSubtitle'
      }
    ] as any

    initializeVideoLanguages(
      mockDispatch,
      undefined as any,
      mockSubtitleLanguages
    )

    expect(mockDispatch).toHaveBeenCalledTimes(2)

    expect(mockDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SetVideoAudioLanguages',
      videoAudioLanguages: []
    })

    expect(mockDispatch).toHaveBeenNthCalledWith(2, {
      type: 'SetVideoSubtitleLanguages',
      videoSubtitleLanguages: mockSubtitleLanguages
    })
  })

  it('should handle undefined subtitle languages by converting to empty array', () => {
    const mockAudioLanguages = [
      {
        language: {
          id: '529',
          slug: 'english',
          name: [
            { primary: true, value: 'English', __typename: 'LanguageName' }
          ],
          __typename: 'Language'
        },
        slug: 'english',
        __typename: 'LanguageWithSlug'
      }
    ] as any

    initializeVideoLanguages(mockDispatch, mockAudioLanguages, undefined as any)

    expect(mockDispatch).toHaveBeenCalledTimes(2)

    expect(mockDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SetVideoAudioLanguages',
      videoAudioLanguages: mockAudioLanguages
    })

    expect(mockDispatch).toHaveBeenNthCalledWith(2, {
      type: 'SetVideoSubtitleLanguages',
      videoSubtitleLanguages: []
    })
  })
})
