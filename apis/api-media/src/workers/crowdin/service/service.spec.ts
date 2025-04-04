import {
  importBibleBooks,
  importStudyQuestions,
  importVideoDescriptions,
  importVideoTitles
} from '../importers'

import { service } from './service'

jest.mock('../importers', () => ({
  importBibleBooks: jest.fn(),
  importStudyQuestions: jest.fn(),
  importVideoDescriptions: jest.fn(),
  importVideoTitles: jest.fn()
}))

describe('crowdin/service', () => {
  it('should call importers', async () => {
    await service()
    expect(importVideoTitles).toHaveBeenCalled()
    expect(importVideoDescriptions).toHaveBeenCalled()
    expect(importStudyQuestions).toHaveBeenCalled()
    expect(importBibleBooks).toHaveBeenCalled()
  })
})
