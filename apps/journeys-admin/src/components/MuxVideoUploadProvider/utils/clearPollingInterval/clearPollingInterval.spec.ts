import { RefObject } from 'react'

import { clearPollingInterval } from './clearPollingInterval'

describe('clearPollingInterval', () => {
  let pollingIntervalsRef: RefObject<Map<string, NodeJS.Timeout>>
  let mockClearInterval: jest.SpyInstance

  beforeEach(() => {
    mockClearInterval = jest.spyOn(global, 'clearInterval').mockImplementation()
    pollingIntervalsRef = {
      current: new Map<string, NodeJS.Timeout>()
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should clear interval and delete from map when interval exists', () => {
    const videoId = 'video-1'
    const mockInterval = setInterval(() => {}, 1000)
    pollingIntervalsRef.current.set(videoId, mockInterval)

    clearPollingInterval(videoId, pollingIntervalsRef)

    expect(mockClearInterval).toHaveBeenCalledTimes(1)
    expect(mockClearInterval).toHaveBeenCalledWith(mockInterval)
    expect(pollingIntervalsRef.current.has(videoId)).toBe(false)
    expect(pollingIntervalsRef.current.size).toBe(0)
  })

  it('should do nothing when interval does not exist', () => {
    const videoId = 'video-1'

    clearPollingInterval(videoId, pollingIntervalsRef)

    expect(mockClearInterval).not.toHaveBeenCalled()
    expect(pollingIntervalsRef.current.has(videoId)).toBe(false)
  })

  it('should handle multiple intervals and only clear the specified one', () => {
    const videoId1 = 'video-1'
    const videoId2 = 'video-2'
    const mockInterval1 = setInterval(() => {}, 1000)
    const mockInterval2 = setInterval(() => {}, 1000)
    pollingIntervalsRef.current.set(videoId1, mockInterval1)
    pollingIntervalsRef.current.set(videoId2, mockInterval2)

    clearPollingInterval(videoId1, pollingIntervalsRef)

    expect(mockClearInterval).toHaveBeenCalledTimes(1)
    expect(mockClearInterval).toHaveBeenCalledWith(mockInterval1)
    expect(pollingIntervalsRef.current.has(videoId1)).toBe(false)
    expect(pollingIntervalsRef.current.has(videoId2)).toBe(true)
    expect(pollingIntervalsRef.current.size).toBe(1)
  })

  it('should handle empty map', () => {
    const videoId = 'video-1'
    pollingIntervalsRef.current = new Map()

    clearPollingInterval(videoId, pollingIntervalsRef)

    expect(mockClearInterval).not.toHaveBeenCalled()
  })

  it('should handle null ref current', () => {
    const videoId = 'video-1'
    pollingIntervalsRef.current = null as unknown as Map<string, NodeJS.Timeout>

    expect(() => {
      clearPollingInterval(videoId, pollingIntervalsRef)
    }).toThrow()
  })
})

