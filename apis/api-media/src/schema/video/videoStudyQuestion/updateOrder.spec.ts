import { Prisma } from '@core/prisma/media/client'

import {
  updateOrderCreate,
  updateOrderDelete,
  updateOrderUpdate
} from './updateOrder'

describe('updateOrder', () => {
  describe('updateOrderCreate', () => {
    it('should update order', async () => {
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
      await updateOrderCreate({
        videoId: 'videoId',
        order: 2,
        languageId: 'languageId',
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
        where: {
          id: 'id3'
        },
        data: { order: 1003 }
      })
      expect(transaction.videoStudyQuestion.update).toHaveBeenCalledWith({
        where: { id: 'id1' },
        data: { order: 1 }
      })
      expect(transaction.videoStudyQuestion.update).toHaveBeenCalledWith({
        where: { id: 'id2' },
        data: { order: 3 }
      })
      expect(transaction.videoStudyQuestion.update).toHaveBeenCalledWith({
        where: { id: 'id3' },
        data: { order: 4 }
      })
    })
  })

  describe('updateOrderDelete', () => {
    it('should update order', async () => {
      const transaction = {
        videoStudyQuestion: {
          findMany: jest.fn().mockResolvedValue([
            { id: 'id1', order: 1 },
            { id: 'id2', order: 2 },
            { id: 'id3', order: 4 }
          ]),
          update: jest.fn()
        }
      }
      await updateOrderDelete({
        videoId: 'videoId',
        languageId: 'languageId',
        transaction: transaction as unknown as Prisma.TransactionClient
      })
      expect(transaction.videoStudyQuestion.update).toHaveBeenCalledWith({
        where: { id: 'id1' },
        data: { order: 1 }
      })
      expect(transaction.videoStudyQuestion.update).toHaveBeenCalledWith({
        where: { id: 'id2' },
        data: { order: 2 }
      })
      expect(transaction.videoStudyQuestion.update).toHaveBeenCalledWith({
        where: { id: 'id3' },
        data: { order: 3 }
      })
    })
  })

  describe('updateOrderUpdate', () => {
    it('should update order', async () => {
      const transaction = {
        videoStudyQuestion: {
          findMany: jest.fn().mockResolvedValue([
            { id: 'id1', order: 1 },
            { id: 'id2', order: 2 },
            { id: 'id3', order: 4 }
          ]),
          update: jest.fn()
        }
      }
      await updateOrderUpdate({
        videoId: 'videoId',
        id: 'id3',
        languageId: 'languageId',
        order: 2,
        transaction: transaction as unknown as Prisma.TransactionClient
      })
      expect(transaction.videoStudyQuestion.update).toHaveBeenCalledWith({
        where: {
          id: 'id1'
        },
        data: { order: 1001 }
      })
      expect(transaction.videoStudyQuestion.update).toHaveBeenCalledWith({
        where: {
          id: 'id2'
        },
        data: { order: 1002 }
      })
      expect(transaction.videoStudyQuestion.update).toHaveBeenCalledWith({
        where: {
          id: 'id3'
        },
        data: { order: 1004 }
      })
      expect(transaction.videoStudyQuestion.update).toHaveBeenCalledWith({
        where: { id: 'id1' },
        data: { order: 1 }
      })
      expect(transaction.videoStudyQuestion.update).toHaveBeenCalledWith({
        where: { id: 'id3' },
        data: { order: 2 }
      })
      expect(transaction.videoStudyQuestion.update).toHaveBeenCalledWith({
        where: { id: 'id2' },
        data: { order: 3 }
      })
    })

    it('should update order inverse', async () => {
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
      await updateOrderUpdate({
        videoId: 'videoId',
        id: 'id1',
        languageId: 'languageId',
        order: 3,
        transaction: transaction as unknown as Prisma.TransactionClient
      })
      expect(transaction.videoStudyQuestion.update).toHaveBeenCalledWith({
        where: {
          id: 'id1'
        },
        data: { order: 1001 }
      })
      expect(transaction.videoStudyQuestion.update).toHaveBeenCalledWith({
        where: {
          id: 'id2'
        },
        data: { order: 1002 }
      })
      expect(transaction.videoStudyQuestion.update).toHaveBeenCalledWith({
        where: {
          id: 'id3'
        },
        data: { order: 1003 }
      })
      expect(transaction.videoStudyQuestion.update).toHaveBeenCalledWith({
        where: { id: 'id1' },
        data: { order: 3 }
      })
      expect(transaction.videoStudyQuestion.update).toHaveBeenCalledWith({
        where: { id: 'id2' },
        data: { order: 1 }
      })
      expect(transaction.videoStudyQuestion.update).toHaveBeenCalledWith({
        where: { id: 'id3' },
        data: { order: 2 }
      })
    })
  })
})
