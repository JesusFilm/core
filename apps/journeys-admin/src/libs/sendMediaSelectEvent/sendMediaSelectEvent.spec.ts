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
    it('should send image_select event with isAi false', () => {
      sendImageSelectEvent({ isAi: false })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'image_select',
        isAi: false
      })
    })

    it('should forward isAi when true', () => {
      sendImageSelectEvent({ isAi: true })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'image_select',
        isAi: true
      })
    })
  })

  describe('sendVideoSelectEvent', () => {
    it('should send video_select event with duration and mux videoSource', () => {
      sendVideoSelectEvent({ duration: 120 })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'video_select',
        duration: 120,
        videoSource: 'mux'
      })
    })

    it('should send video_select event with null duration', () => {
      sendVideoSelectEvent({ duration: null })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'video_select',
        duration: null,
        videoSource: 'mux'
      })
    })
  })
})
