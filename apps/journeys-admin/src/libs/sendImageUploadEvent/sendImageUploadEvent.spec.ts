import { sendGTMEvent } from '@next/third-parties/google'

import {
  sendImageUploadFailureEvent,
  sendImageUploadSuccessEvent
} from './sendImageUploadEvent'

jest.mock('@next/third-parties/google', () => ({
  sendGTMEvent: jest.fn()
}))

const mockSendGTMEvent = sendGTMEvent as jest.MockedFunction<
  typeof sendGTMEvent
>

describe('sendImageUploadEvent', () => {
  beforeEach(() => {
    mockSendGTMEvent.mockClear()
  })

  describe('sendImageUploadSuccessEvent', () => {
    it('should send image_upload_success event with file metadata', () => {
      sendImageUploadSuccessEvent({
        fileName: 'photo.png',
        fileSize: 1024,
        fileType: 'image/png'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'image_upload_success',
        fileName: 'photo.png',
        fileSize: 1024,
        fileType: 'image/png'
      })
    })
  })

  describe('sendImageUploadFailureEvent', () => {
    it('should send image_upload_failure event with errorCode when provided', () => {
      sendImageUploadFailureEvent({
        fileName: 'huge.png',
        fileSize: 11000000,
        fileType: 'image/png',
        errorCode: 'file-too-large'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'image_upload_failure',
        fileName: 'huge.png',
        fileSize: 11000000,
        fileType: 'image/png',
        errorCode: 'file-too-large'
      })
    })

    it('should send image_upload_failure event without errorCode when omitted', () => {
      sendImageUploadFailureEvent({
        fileName: 'photo.png',
        fileSize: 1024,
        fileType: 'image/png'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'image_upload_failure',
        fileName: 'photo.png',
        fileSize: 1024,
        fileType: 'image/png',
        errorCode: undefined
      })
    })
  })
})
