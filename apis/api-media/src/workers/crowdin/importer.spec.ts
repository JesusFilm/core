import {
  apis,
  fetchSourceStrings,
  fetchTranslations,
  processFile
} from './importer'

jest.mock('@crowdin/crowdin-api-client')

const mockFile = {
  id: 1,
  name: 'test.csv',
  title: 'test',
  path: 'test.csv'
}

const mockTranslation = {
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

const mockSourceStrings = [
  {
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
]

describe('importVideoTitles', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch source strings', async () => {
    const strings = await fetchSourceStrings(mockFile.id, apis.sourceStrings)
    expect(strings).toEqual(mockSourceStrings)
  })

  it('should fetch translations', async () => {
    const translations = await fetchTranslations(
      'ru',
      mockFile.id,
      apis.stringTranslations
    )
    expect(translations).toEqual([mockTranslation])
  })

  it('should process a file successfully', async () => {
    const importOne = jest.fn()
    await processFile(mockFile, importOne)
    expect(importOne).toHaveBeenCalled()
  })
})
