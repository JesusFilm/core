import { SourceStringsModel } from '@crowdin/crowdin-api-client/out/sourceStrings'
import { StringTranslationsModel } from '@crowdin/crowdin-api-client/out/stringTranslations'
import { Logger } from 'pino'

export const mockUser = {
  id: 1,
  username: 'test',
  fullName: 'Test User',
  avatarUrl: 'https://example.com/avatar.jpg'
}

export const createMockLogger = (): jest.Mocked<Logger> =>
  ({
    info: jest.fn().mockReturnThis(),
    warn: jest.fn().mockReturnThis(),
    debug: jest.fn().mockReturnThis(),
    error: jest.fn().mockReturnThis(),
    fatal: jest.fn().mockReturnThis(),
    trace: jest.fn().mockReturnThis(),
    level: 'info',
    child: jest.fn().mockReturnThis(),
    silent: jest.fn().mockReturnThis()
  }) as unknown as jest.Mocked<Logger>

export const createMockSourceString = (
  overrides: Partial<SourceStringsModel.String> = {}
): SourceStringsModel.String =>
  ({
    id: 1,
    projectId: 47654,
    fileId: 1,
    branchId: 1,
    directoryId: 1,
    identifier: 'test-id',
    text: 'Test String',
    type: SourceStringsModel.Type.TEXT,
    context: '',
    maxLength: 0,
    isHidden: false,
    isDuplicate: false,
    masterStringId: false,
    revision: 1,
    hasPlurals: false,
    isIcu: false,
    labelIds: [],
    createdAt: '',
    updatedAt: '',
    webUrl: 'https://crowdin.com/string/1',
    ...overrides
  }) as unknown as SourceStringsModel.String

export const createMockTranslation = (
  overrides: Partial<StringTranslationsModel.PlainLanguageTranslation> = {}
): StringTranslationsModel.PlainLanguageTranslation =>
  ({
    stringId: 1,
    contentType: 'text/plain',
    translationId: 1,
    text: 'Test Translation',
    user: mockUser,
    createdAt: '',
    updatedAt: '',
    ...overrides
  }) as unknown as StringTranslationsModel.PlainLanguageTranslation

export const setupCrowdinTest = () => {
  const originalEnv = process.env

  beforeAll(() => {
    process.env = {
      ...originalEnv,
      CROWDIN_API_KEY: 'test-api-key'
    }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })
}
