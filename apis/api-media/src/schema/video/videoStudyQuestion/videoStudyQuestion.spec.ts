import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

import {
  updateOrderCreate,
  updateOrderDelete,
  updateOrderUpdate
} from './updateOrder'

jest.mock('./updateOrder', () => ({
  updateOrderCreate: jest.fn(),
  updateOrderDelete: jest.fn(),
  updateOrderUpdate: jest.fn()
}))

describe('videoStudyQuestion', () => {
  const client = getClient()

  const authClient = getClient({
    headers: {
      authorization: 'token'
    },
    context: {
      currentRoles: ['publisher']
    }
  })

  describe('mutations', () => {
    describe('createVideoStudyQuestion', () => {
      const CREATE_VIDEO_STUDY_QUESTION_MUTATION = graphql(`
        mutation CreateVideoStudyQuestion(
          $input: VideoStudyQuestionCreateInput!
        ) {
          videoStudyQuestionCreate(input: $input) {
            id
          }
        }
      `)

      it('should create video study question', async () => {
        prismaMock.$transaction.mockImplementation(
          async (callback: any) => await callback(prismaMock)
        )
        ;(updateOrderCreate as jest.Mock).mockResolvedValue(undefined)
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoStudyQuestion.findUnique.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId',
          crowdInId: 'crowdInId',
          order: 1
        })
        prismaMock.videoStudyQuestion.create.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId',
          crowdInId: 'crowdInId',
          order: 1
        })
        prismaMock.videoStudyQuestion.update.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId',
          crowdInId: 'crowdInId',
          order: 1
        })
        const result = await authClient({
          document: CREATE_VIDEO_STUDY_QUESTION_MUTATION,
          variables: {
            input: {
              id: 'id',
              videoId: 'videoId',
              value: 'value',
              primary: true,
              languageId: 'languageId',
              crowdInId: 'crowdInId',
              order: 1
            }
          }
        })
        expect(result).toHaveProperty('data.videoStudyQuestionCreate', {
          id: 'id'
        })
        expect(updateOrderCreate).toHaveBeenCalled()
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: CREATE_VIDEO_STUDY_QUESTION_MUTATION,
          variables: {
            input: {
              id: 'id',
              videoId: 'videoId',
              value: 'value',
              primary: true,
              languageId: 'languageId',
              crowdInId: 'crowdInId',
              order: 1
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })

    describe('videoStudyQuestionUpdate', () => {
      const UPDATE_VIDEO_STUDY_QUESTION_MUTATION = graphql(`
        mutation UpdateVideoStudyQuestion(
          $input: VideoStudyQuestionUpdateInput!
        ) {
          videoStudyQuestionUpdate(input: $input) {
            id
          }
        }
      `)

      it('should update video study question', async () => {
        prismaMock.$transaction.mockImplementation(
          async (callback: any) => await callback(prismaMock)
        )
        prismaMock.videoStudyQuestion.findUnique.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId',
          crowdInId: 'crowdInId',
          order: 1
        })
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoStudyQuestion.update.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId',
          crowdInId: 'crowdInId',
          order: 1
        })
        const result = await authClient({
          document: UPDATE_VIDEO_STUDY_QUESTION_MUTATION,
          variables: {
            input: {
              id: 'id',
              value: 'value',
              primary: true,
              crowdInId: 'crowdInId',
              order: 1
            }
          }
        })
        expect(updateOrderUpdate).toHaveBeenCalled()
        expect(result).toHaveProperty('data.videoStudyQuestionUpdate', {
          id: 'id'
        })
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: UPDATE_VIDEO_STUDY_QUESTION_MUTATION,
          variables: {
            input: {
              id: 'id',
              value: 'value',
              primary: true,
              crowdInId: 'crowdInId',
              order: 1
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })

      it('should throw if not found', async () => {
        prismaMock.$transaction.mockImplementation(
          async (callback: any) => await callback(prismaMock)
        )
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoStudyQuestion.findUnique.mockResolvedValue(null)
        const result = await authClient({
          document: UPDATE_VIDEO_STUDY_QUESTION_MUTATION,
          variables: {
            input: {
              id: 'id',
              value: 'value',
              primary: true,
              crowdInId: 'crowdInId',
              order: 1
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })

      it('should throw if referenced video not found', async () => {
        prismaMock.$transaction.mockImplementation(
          async (callback: any) => await callback(prismaMock)
        )
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoStudyQuestion.findUnique.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId',
          crowdInId: 'crowdInId',
          order: 1
        })
        prismaMock.video.findUnique.mockResolvedValue(null)
        const result = await authClient({
          document: UPDATE_VIDEO_STUDY_QUESTION_MUTATION,
          variables: {
            input: {
              id: 'id',
              value: 'value',
              primary: true,
              crowdInId: 'crowdInId',
              order: 1
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })

    describe('videoStudyQuestionDelete', () => {
      const DELETE_VIDEO_STUDY_QUESTION_MUTATION = graphql(`
        mutation DeleteVideoStudyQuestion($id: ID!) {
          videoStudyQuestionDelete(id: $id) {
            id
          }
        }
      `)

      it('should delete video study question', async () => {
        prismaMock.$transaction.mockImplementation(
          async (callback: any) => await callback(prismaMock)
        )
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoStudyQuestion.findUnique.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId',
          crowdInId: 'crowdInId',
          order: 1
        })
        prismaMock.videoStudyQuestion.delete.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId',
          crowdInId: 'crowdInId',
          order: 1
        })
        const result = await authClient({
          document: DELETE_VIDEO_STUDY_QUESTION_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(updateOrderDelete).toHaveBeenCalled()
        expect(result).toHaveProperty('data.videoStudyQuestionDelete', {
          id: 'id'
        })
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: DELETE_VIDEO_STUDY_QUESTION_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(result).toHaveProperty('data', null)
      })

      it('should throw if not found', async () => {
        prismaMock.$transaction.mockImplementation(
          async (callback: any) => await callback(prismaMock)
        )
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoStudyQuestion.findUnique.mockResolvedValue(null)
        const result = await authClient({
          document: DELETE_VIDEO_STUDY_QUESTION_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })
  })
})
