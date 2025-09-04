// Mock for algoliasearch package
const mockSearchIndex = {
  search: jest.fn()
}

const mockAlgoliaClient = {
  initIndex: jest.fn(() => mockSearchIndex)
}

const algoliasearch = jest.fn(() => mockAlgoliaClient)

// Export as named export to match the import style
export { algoliasearch }

// Also export as default for compatibility
export default algoliasearch
