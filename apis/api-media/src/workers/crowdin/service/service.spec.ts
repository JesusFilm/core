import { vi } from 'vitest'
import {
  importBibleBooks,
  importStudyQuestions,
  importVideoDescriptions,
  importVideoTitles
} from '../importers'

import { service } from './service'

vi.mock('../importers', () => ({
  importBibleBooks: vi.fn(),
  importStudyQuestions: vi.fn(),
  importVideoDescriptions: vi.fn(),
  importVideoTitles: vi.fn()
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
