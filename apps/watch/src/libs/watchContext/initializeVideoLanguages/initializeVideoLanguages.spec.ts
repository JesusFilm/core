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
        id: '529',
        slug: 'english'
      }
    ]

    const mockSubtitleLanguages = ['529']

    initializeVideoLanguages(
      mockDispatch,
      mockAudioLanguages,
      mockSubtitleLanguages
    )

    expect(mockDispatch).toHaveBeenCalledTimes(2)

    // Check first call - SetVideoAudioLanguages
    expect(mockDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SetVideoAudioLanguages',
      videoAudioLanguagesIdsAndSlugs: mockAudioLanguages
    })
  })

  it('should dispatch SetVideoSubtitleLanguages action with provided subtitle languages', () => {
    const mockAudioLanguages = [
      {
        id: '529',
        slug: 'english'
      }
    ]

    const mockSubtitleLanguages = ['529']

    initializeVideoLanguages(
      mockDispatch,
      mockAudioLanguages,
      mockSubtitleLanguages
    )

    expect(mockDispatch).toHaveBeenCalledTimes(2)

    // Check second call - SetVideoSubtitleLanguages
    expect(mockDispatch).toHaveBeenNthCalledWith(2, {
      type: 'SetVideoSubtitleLanguages',
      videoSubtitleLanguageIds: mockSubtitleLanguages
    })
  })

  it('should call actions in correct order, audio first, then subtitle', () => {
    const mockAudioLanguages = [
      {
        id: '529',
        slug: 'english'
      }
    ]

    const mockSubtitleLanguages = ['529']

    initializeVideoLanguages(
      mockDispatch,
      mockAudioLanguages,
      mockSubtitleLanguages
    )

    expect(mockDispatch).toHaveBeenCalledTimes(2)

    // Verify order: SetVideoAudioLanguages first, then SetVideoSubtitleLanguages
    expect(mockDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SetVideoAudioLanguages',
      videoAudioLanguagesIdsAndSlugs: mockAudioLanguages
    })

    expect(mockDispatch).toHaveBeenNthCalledWith(2, {
      type: 'SetVideoSubtitleLanguages',
      videoSubtitleLanguageIds: mockSubtitleLanguages
    })
  })

  it('should handle empty audio languages array', () => {
    const mockSubtitleLanguages = ['529']

    initializeVideoLanguages(mockDispatch, [], mockSubtitleLanguages)

    expect(mockDispatch).toHaveBeenCalledTimes(2)

    expect(mockDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SetVideoAudioLanguages',
      videoAudioLanguagesIdsAndSlugs: []
    })

    expect(mockDispatch).toHaveBeenNthCalledWith(2, {
      type: 'SetVideoSubtitleLanguages',
      videoSubtitleLanguageIds: mockSubtitleLanguages
    })
  })

  it('should handle empty subtitle languages array', () => {
    const mockAudioLanguages = [
      {
        id: '529',
        slug: 'english'
      }
    ]

    initializeVideoLanguages(mockDispatch, mockAudioLanguages, [])

    expect(mockDispatch).toHaveBeenCalledTimes(2)

    expect(mockDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SetVideoAudioLanguages',
      videoAudioLanguagesIdsAndSlugs: mockAudioLanguages
    })

    expect(mockDispatch).toHaveBeenNthCalledWith(2, {
      type: 'SetVideoSubtitleLanguages',
      videoSubtitleLanguageIds: []
    })
  })

  it('should handle both empty arrays', () => {
    initializeVideoLanguages(mockDispatch, [], [])

    expect(mockDispatch).toHaveBeenCalledTimes(2)

    expect(mockDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SetVideoAudioLanguages',
      videoAudioLanguagesIdsAndSlugs: []
    })

    expect(mockDispatch).toHaveBeenNthCalledWith(2, {
      type: 'SetVideoSubtitleLanguages',
      videoSubtitleLanguageIds: []
    })
  })

  it('should handle undefined audio languages by converting to empty array', () => {
    const mockSubtitleLanguages = ['529']

    initializeVideoLanguages(mockDispatch, [], mockSubtitleLanguages)

    expect(mockDispatch).toHaveBeenCalledTimes(2)

    expect(mockDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SetVideoAudioLanguages',
      videoAudioLanguagesIdsAndSlugs: []
    })

    expect(mockDispatch).toHaveBeenNthCalledWith(2, {
      type: 'SetVideoSubtitleLanguages',
      videoSubtitleLanguageIds: mockSubtitleLanguages
    })
  })

  it('should handle undefined subtitle languages by converting to empty array', () => {
    const mockAudioLanguages = [
      {
        id: '529',
        slug: 'english'
      }
    ]

    initializeVideoLanguages(mockDispatch, mockAudioLanguages, [])

    expect(mockDispatch).toHaveBeenCalledTimes(2)

    expect(mockDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SetVideoAudioLanguages',
      videoAudioLanguagesIdsAndSlugs: mockAudioLanguages
    })

    expect(mockDispatch).toHaveBeenNthCalledWith(2, {
      type: 'SetVideoSubtitleLanguages',
      videoSubtitleLanguageIds: []
    })
  })
})
