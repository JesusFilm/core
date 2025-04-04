import {
  fetchSourceStrings,
  fetchTranslations,
  processFile,
  processLanguage,
  processTranslations
} from './importer'

describe('importVideoTitles', () => {
  it('should be implemented', () => {
    expect(fetchSourceStrings).toBeDefined()
    expect(fetchTranslations).toBeDefined()
    expect(processFile).toBeDefined()
    expect(processLanguage).toBeDefined()
    expect(processTranslations).toBeDefined()
  })
})
