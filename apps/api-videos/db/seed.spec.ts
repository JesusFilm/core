import {
  fetchMediaLanguagesAndTransformToLanguages,
  //   getArclightMediaComponent,
  getArclightMediaComponents
} from '../src/libs/arclight/arclight'
import { getVideoIdsAndSlugs } from '../src/libs/postgresql/postgresql'

import { handleArclightMediaComponent, main } from './seed'

jest.mock('../src/libs/postgresql/postgresql')

jest.mock('../src/libs/arclight/arclight')

describe('main', () => {
  it('should import media components in complete mode', async () => {
    await main('complete')
    // Assert the expected function calls
    expect(getVideoIdsAndSlugs).toHaveBeenCalled()
    expect(fetchMediaLanguagesAndTransformToLanguages).toHaveBeenCalled()
    expect(getArclightMediaComponents).toHaveBeenCalled()
  })
})
