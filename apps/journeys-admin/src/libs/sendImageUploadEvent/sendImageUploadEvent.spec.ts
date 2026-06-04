import { sendGTMEvent } from '@next/third-parties/google'
import { type MockedFunction } from 'vitest'

import {
  sendImageUploadFailureEvent,
  sendImageUploadSuccessEvent
} from './sendImageUploadEvent'

vi.mock('@next/third-parties/google', () => ({
  sendGTMEvent: vi.fn()
}))

const mockSendGTMEvent = sendGTMEvent as MockedFunction<typeof sendGTMEvent>

describe('sendImageUploadEvent', () => {
  beforeEach(() => {
    mockSendGTMEvent.mockClear()
  })

  describe('sendImageUploadSuccessEvent', () => {
    it('should send image_upload_success event with file metadata', () => {
      sendImageUploadSuccessEvent({
        fileSize: 1024,
        fileType: 'image/png'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'image_upload_success',
        fileSize: 1024,
        fileType: 'image/png'
      })
    })
  })

  describe('sendImageUploadFailureEvent', () => {
    it('should send image_upload_failure event with errorCode when provided', () => {
      sendImageUploadFailureEvent({
        fileSize: 11000000,
        fileType: 'image/png',
        errorCode: 'file-too-large'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'image_upload_failure',
        fileSize: 11000000,
        fileType: 'image/png',
        errorCode: 'file-too-large'
      })
    })

    it('should send image_upload_failure event without errorCode when omitted', () => {
      sendImageUploadFailureEvent({
        fileSize: 1024,
        fileType: 'image/png'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'image_upload_failure',
        fileSize: 1024,
        fileType: 'image/png',
        errorCode: undefined
      })
    })
  })
})
