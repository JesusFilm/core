process.env.CROWDIN_PROJECT_ID = '1'
process.env.CROWDIN_API_KEY = 'test-key'

// Mock data objects
export const mockSourceString = {
  id: 1,
  projectId: 1,
  fileId: 1,
  branchId: 1,
  directoryId: 1,
  identifier: 'test_string',
  text: 'Hello',
  type: 0, // Type enum value - 0 = 'text'
  context: '1\nThis is a test',
  maxLength: 100,
  isHidden: false,
  isDuplicate: false,
  masterStringId: true,
  revision: 1,
  hasPlurals: false,
  isIcu: false,
  labelIds: [],
  webUrl: 'https://test.crowdin.com/project/1/translate?file=1&string=1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

export const mockTranslation = {
  stringId: 1,
  contentType: 'text/plain' as const,
  translationId: 1234,
  text: 'Translated Text',
  pluralCategoryName: null,
  user: {
    id: 1,
    username: 'test',
    fullName: 'test',
    avatarUrl: 'https://test.crowdin.com/avatar/1.png'
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

// Mock API objects
const SourceStrings = {
  listProjectStrings: jest.fn().mockImplementation(() => {
    return {
      data: [{ data: mockSourceString }],
      pagination: { offset: 0, limit: 500 }
    }
  })
}

const StringTranslations = {
  listLanguageTranslations: jest.fn().mockImplementation(() => {
    return {
      data: [{ data: mockTranslation }],
      pagination: { offset: 0, limit: 500 }
    }
  })
}

jest.mock('@crowdin/crowdin-api-client', () => {
  return {
    __esModule: true,
    default: function CrowdinClient() {
      return {
        sourceStringsApi: SourceStrings,
        stringTranslationsApi: StringTranslations
      }
    }
  }
})
