import { Test, TestingModule } from '@nestjs/testing'
import { FileService } from './file.service'

jest.mock('fs')
jest.mock('https')
jest.mock('http')
jest.mock('uuid', () => ({ v4: jest.fn(() => 'uuid-mock') }))
describe('File Service', () => {
  let service: FileService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileService]
    }).compile()
    service = module.get<FileService>(FileService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('generateGoogleDriveDirectLink', () => {
    it('should generate a direct download link from a Google Drive share link', () => {
      const shareUrl =
        'https://drive.google.com/file/d/FILE_ID/view?usp=sharing'
      const directLink = service.generateGoogleDriveDirectLink(shareUrl)
      expect(directLink).toBe(
        'https://drive.google.com/uc?export=download&id=FILE_ID'
      )
    })

    it('should throw an error for an invalid Google Drive share link', () => {
      const invalidUrl = 'https://drive.google.com/invalid'
      expect(() => service.generateGoogleDriveDirectLink(invalidUrl)).toThrow(
        'Invalid Google Drive share URL'
      )
    })
  })

  describe('getFileNameFromContentDisposition', () => {
    it('should extract the filename from the content-disposition header', () => {
      const contentDisposition = 'attachment; filename="testfile.txt"'
      const fileName =
        service.getFileNameFromContentDisposition(contentDisposition)
      expect(fileName).toBe('testfile.txt')
    })

    it('should return null if the content-disposition header is not present', () => {
      const fileName = service.getFileNameFromContentDisposition(undefined)
      expect(fileName).toBeNull()
    })

    it('should return null if the content-disposition header does not contain a filename', () => {
      const contentDisposition = 'attachment'
      const fileName =
        service.getFileNameFromContentDisposition(contentDisposition)
      expect(fileName).toBeNull()
    })
  })
})
