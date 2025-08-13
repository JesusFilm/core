process.env.CROWDIN_PROJECT_ID = '1'
process.env.CROWDIN_API_KEY = 'test-key'

// Reuse the same mock objects that importer.spec.ts imports, so spies line up
// eslint-disable-next-line @typescript-eslint/no-var-requires
const localCrowdinMocks = require('../src/workers/crowdin/__mocks__/@crowdin/crowdin-api-client')

jest.mock('@crowdin/crowdin-api-client', () => {
  return {
    __esModule: true,
    default: function CrowdinClient() {
      return {
        sourceStringsApi: localCrowdinMocks.SourceStrings,
        stringTranslationsApi: localCrowdinMocks.StringTranslations
      }
    }
  }
})
