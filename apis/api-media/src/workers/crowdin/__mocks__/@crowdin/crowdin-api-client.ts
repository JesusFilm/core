const mockSourceStrings = [
  {
    id: 1,
    projectId: 123,
    fileId: 456,
    branchId: null,
    directoryId: null,
    identifier: 'video_123',
    text: 'Sample Video Title',
    type: 'text',
    context: '',
    maxLength: 0,
    isHidden: false,
    isDuplicate: false,
    masterStringId: null,
    revision: 1,
    hasPlurals: false,
    isIcu: false,
    labelIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const mockTranslations = [
  {
    stringId: 1,
    contentType: 'text/plain',
    translationId: 1,
    text: 'Translated Video Title',
    pluralCategoryName: null,
    user: {
      id: 123,
      username: 'translator',
      fullName: 'Test Translator',
      avatarUrl: 'https://example.com/avatar.png'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

class SourceStrings {
  listProjectStrings = jest.fn().mockImplementation(() => {
    return Promise.resolve({
      data: mockSourceStrings.map((str) => ({ data: str }))
    })
  })
}

class StringTranslations {
  listLanguageTranslations = jest.fn().mockImplementation(() => {
    return Promise.resolve({
      data: mockTranslations.map((trans) => ({ data: trans }))
    })
  })
}

class CrowdinClient {
  sourceStringsApi: SourceStrings
  stringTranslationsApi: StringTranslations

  constructor(options: { token: string }) {
    this.sourceStringsApi = new SourceStrings()
    this.stringTranslationsApi = new StringTranslations()
  }
}

export { SourceStrings, StringTranslations }

export default CrowdinClient
