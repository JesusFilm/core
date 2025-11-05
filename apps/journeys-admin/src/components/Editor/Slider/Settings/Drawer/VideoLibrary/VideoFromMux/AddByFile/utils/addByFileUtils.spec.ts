import { ReadStream, readFileSync } from 'fs'
import { join } from 'path'

import { fileToMuxUpload, getBuffer } from './addByFileUtils'

describe('addByFileUtils', () => {
  describe('fileToMuxUpload', () => {
    it('should return correct variables for Mux video upload without language', () => {
      const mockFile = new File([''], 'video.mp4', {
        type: 'video/mp4',
        lastModified: new Date().getTime()
      })

      const result = fileToMuxUpload(mockFile)

      expect(result).toEqual({
        variables: {
          name: 'video',
          generateSubtitlesInput: undefined
        }
      })
    })

    it('should return correct variables with language code and name', () => {
      const mockFile = new File([''], 'video.mp4', {
        type: 'video/mp4',
        lastModified: new Date().getTime()
      })

      const result = fileToMuxUpload(mockFile, 'en', 'English')

      expect(result).toEqual({
        variables: {
          name: 'video',
          generateSubtitlesInput: {
            languageCode: 'en',
            languageName: 'English'
          }
        }
      })
    })

    it('should not include generateSubtitlesInput if only languageCode is provided', () => {
      const mockFile = new File([''], 'video.mp4', {
        type: 'video/mp4',
        lastModified: new Date().getTime()
      })

      const result = fileToMuxUpload(mockFile, 'en')

      expect(result).toEqual({
        variables: {
          name: 'video',
          generateSubtitlesInput: undefined
        }
      })
    })

    it('should not include generateSubtitlesInput if only languageName is provided', () => {
      const mockFile = new File([''], 'video.mp4', {
        type: 'video/mp4',
        lastModified: new Date().getTime()
      })

      const result = fileToMuxUpload(mockFile, undefined, 'English')

      expect(result).toEqual({
        variables: {
          name: 'video',
          generateSubtitlesInput: undefined
        }
      })
    })
  })

  describe('getBuffer', () => {
    const testFilePath = join(__dirname, 'testFile.mp4')
    let mockFile: File
    const originalEnv = process.env

    beforeEach(() => {
      const fileContent = readFileSync(testFilePath)
      mockFile = new File([fileContent], 'testFile.mp4', { type: 'video/mp4' })
    })

    afterEach(() => {
      jest.resetModules()
      process.env = originalEnv
    })

    it('should return the file itself in non-test environments', () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: 'development'
      }

      const result = getBuffer(mockFile)
      expect(result).toBe(mockFile)
    })

    it('should return a ReadStream in test environment', () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: 'test'
      }

      const fileWithMockPath = { path: 'testFile.mp4' }
      const result = getBuffer(fileWithMockPath as unknown as File)

      expect(result).toBeInstanceOf(ReadStream)
      expect((result as ReadStream).path).toEqual(testFilePath)
    })
  })
})
