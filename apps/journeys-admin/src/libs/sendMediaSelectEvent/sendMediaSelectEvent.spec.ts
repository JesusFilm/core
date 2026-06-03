import { sendGTMEvent } from '@next/third-parties/google'
import { type MockedFunction } from 'vitest'

import {
  sendImageSelectEvent,
  sendVideoSelectEvent
} from './sendMediaSelectEvent'

vi.mock('@next/third-parties/google', () => ({
  sendGTMEvent: vi.fn()
}))

const mockSendGTMEvent = sendGTMEvent as MockedFunction<typeof sendGTMEvent>

describe('sendMediaSelectEvent', () => {
  beforeEach(() => {
    mockSendGTMEvent.mockClear()
  })

  describe('sendImageSelectEvent', () => {
    it('should send image_select event with imageId and isAi', () => {
      sendImageSelectEvent({
        imageId: 'abc',
        isAi: false
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'image_select',
        imageId: 'abc',
        isAi: false
      })
    })

    it('should forward isAi when true', () => {
      sendImageSelectEvent({
        imageId: 'def',
        isAi: true
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'image_select',
        imageId: 'def',
        isAi: true
      })
    })
  })

  describe('sendVideoSelectEvent', () => {
    it('should send video_select event with videoId, duration and mux source', () => {
      sendVideoSelectEvent({
        videoId: 'xyz',
        duration: 120
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'video_select',
        videoId: 'xyz',
        duration: 120,
        source: 'mux'
      })
    })

    it('should send video_select event with null duration', () => {
      sendVideoSelectEvent({
        videoId: 'xyz',
        duration: null
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'video_select',
        videoId: 'xyz',
        duration: null,
        source: 'mux'
      })
    })
  })
})
