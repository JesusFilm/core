export const mockTranslation = {
  stringId: 1,
  contentType: 'text/plain',
  translationId: 1234,
  text: 'Translated Text',
  user: {
    id: 1,
    username: 'test',
    fullName: 'test'
  },
  createdAt: '2024-01-01T00:00:00Z'
}

export const mockSourceString = {
  id: 1,
  projectId: 1,
  fileId: 1,
  branchId: null,
  directoryId: null,
  identifier: 'test_string',
  text: 'Hello',
  type: 'text',
  context: '1\nThis is a test',
  maxLength: null,
  isHidden: false,
  isDuplicate: false,
  masterStringId: null,
  revision: 1,
  hasPlurals: false,
  isIcu: false,
  labelIds: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: null
}

export const SourceStrings = {
  listProjectStrings: jest.fn().mockImplementation(() => {
    return {
      data: [{ data: mockSourceString }]
    }
  })
}

export const StringTranslations = {
  listLanguageTranslations: jest.fn().mockImplementation(() => {
    return {
      data: [{ data: mockTranslation }]
    }
  })
}

export default class Crowdin {
  sourceStringsApi: typeof SourceStrings
  stringTranslationsApi: typeof StringTranslations

  constructor(config: { token: string }) {
    this.sourceStringsApi = SourceStrings
    this.stringTranslationsApi = StringTranslations
  }
}
