import { Prisma } from '.prisma/api-media-client'

import { fakeDeferExistingQuestions } from './fakeDeferExistingQuestions'

describe('fakeDeferExistingQuestions', () => {
  it('should defer existing questions', async () => {
    const transaction = {
      videoStudyQuestion: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'id1', order: 1 },
          { id: 'id2', order: 2 },
          { id: 'id3', order: 3 }
        ]),
        update: jest.fn()
      }
    }
    await fakeDeferExistingQuestions({
      videoId: 'videoId',
      transaction: transaction as unknown as Prisma.TransactionClient
    })
    expect(transaction.videoStudyQuestion.update).toHaveBeenCalledWith({
      where: { id: 'id1' },
      data: { order: 1001 }
    })
    expect(transaction.videoStudyQuestion.update).toHaveBeenCalledWith({
      where: { id: 'id2' },
      data: { order: 1002 }
    })
    expect(transaction.videoStudyQuestion.update).toHaveBeenCalledWith({
      where: { id: 'id3' },
      data: { order: 1003 }
    })
  })
})
