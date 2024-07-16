import { InMemoryCache } from '@apollo/client'

import { cardBlock } from '../../useBlockRestoreMutation.mock'
import { blockRestoreCacheUpdate } from './blockRestoreCacheUpdate'

describe('blockRestoreCacheUpdate', () => {
  const blockRestoreResMock = {
    blockRestore: [cardBlock]
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should update the blocks field in the cache', async () => {
    const cache = new InMemoryCache()
    const mockModify = jest.spyOn(cache, 'modify')

    blockRestoreCacheUpdate(cache, blockRestoreResMock)
    expect(mockModify).toHaveBeenCalledWith({
      fields: {
        blocks: expect.any(Function)
      }
    })
  })

  it('should update the blocks field for the object of the passed in id in the cache', async () => {
    const cache = new InMemoryCache()
    const mockModify = jest.spyOn(cache, 'modify')

    blockRestoreCacheUpdate(cache, blockRestoreResMock, 'Journey:journeyId')
    expect(mockModify).toHaveBeenCalledWith({
      id: 'Journey:journeyId',
      fields: {
        blocks: expect.any(Function)
      }
    })
  })
})
