const mockSourceString = {
  id: 1,
  projectId: 1,
  fileId: 1,
  branchId: null,
  directoryId: null,
  identifier: null,
  text: 'Test String',
  type: 'text',
  context: null,
  maxLength: null,
  isHidden: false,
  isDuplicate: false,
  masterStringId: null,
  revision: 1,
  hasPlurals: false,
  isIcu: false,
  labelIds: [],
  createdAt: '2021-01-01T00:00:00Z',
  updatedAt: null
}

const mockTranslation = {
  stringId: 1,
  contentType: 'text/plain',
  translationId: 1,
  text: 'Test Translation',
  user: {
    id: 1,
    username: 'test',
    fullName: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg'
  },
  createdAt: '2021-01-01T00:00:00Z',
  updatedAt: null
}

export const listProjectStrings = jest.fn().mockResolvedValue({
  data: [mockSourceString],
  pagination: { offset: 0, limit: 500 }
})

export const listLanguageTranslations = jest.fn().mockResolvedValue({
  data: [mockTranslation],
  pagination: { offset: 0, limit: 500 }
})

// Mock console.log for debugging
const originalLog = console.log
console.log = (...args) => {
  originalLog('MOCK:', ...args)
}

export class SourceStrings {
  constructor(config: { token: string }) {
    // Implementation not needed for mock
  }
  listProjectStrings = listProjectStrings
}

export class StringTranslations {
  constructor(config: { token: string }) {
    // Implementation not needed for mock
  }
  listLanguageTranslations = listLanguageTranslations
}

// Mock the default export class
export default class CrowdinClient {
  sourceStringsApi: SourceStrings
  stringTranslationsApi: StringTranslations

  constructor(config: { token: string }) {
    this.sourceStringsApi = new SourceStrings(config)
    this.stringTranslationsApi = new StringTranslations(config)
  }
}

// Export models that are used in type assertions
export const StringTranslationsModel = {
  PlainLanguageTranslation: Symbol('PlainLanguageTranslation'),
  PluralLanguageTranslation: Symbol('PluralLanguageTranslation')
}

export const SourceStringsModel = {
  String: Symbol('String'),
  Type: {
    TEXT: 0
  }
}
