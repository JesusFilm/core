import { graphql } from 'gql.tada'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

import {
  updateCreateOrder,
  updateDeleteOrder,
  updateOrderUpdate
} from './updateOrder'

jest.mock('./updateOrder', () => ({
  updateCreateOrder: jest
    .fn()
    .mockImplementation(async () => await Promise.resolve()),
  updateDeleteOrder: jest
    .fn()
    .mockImplementation(async () => await Promise.resolve()),
  updateOrderUpdate: jest
    .fn()
    .mockImplementation(async () => await Promise.resolve())
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
          createVideoStudyQuestion(input: $input) {
            id
          }
        }
      `)

      it('should create video study question', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
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
        expect(result).toHaveProperty('data.createVideoStudyQuestion', {
          id: 'id'
        })
        expect(updateCreateOrder).toHaveBeenCalledWith({
          videoId: 'videoId',
          order: 1,
          transaction: expect.any(Object)
        })
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

    describe('updateVideoStudyQuestion', () => {
      const UPDATE_VIDEO_STUDY_QUESTION_MUTATION = graphql(`
        mutation UpdateVideoStudyQuestion(
          $input: VideoStudyQuestionUpdateInput!
        ) {
          updateVideoStudyQuestion(input: $input) {
            id
          }
        }
      `)

      it('should update video study question', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        const result = await authClient({
          document: UPDATE_VIDEO_STUDY_QUESTION_MUTATION,
          variables: {
            input: {
              id: 'id',
              value: 'value',
              primary: true,
              languageId: 'languageId',
              crowdInId: 'crowdInId',
              order: 1
            }
          }
        })
        expect(result).toHaveProperty('data.updateVideoStudyQuestion', {
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
              languageId: 'languageId',
              crowdInId: 'crowdInId',
              order: 1
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })

    describe('deleteVideoStudyQuestion', () => {
      const DELETE_VIDEO_STUDY_QUESTION_MUTATION = graphql(`
        mutation DeleteVideoStudyQuestion($id: ID!) {
          deleteVideoStudyQuestion(id: $id) {
            id
          }
        }
      `)

      it('should delete video study question', async () => {
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
        expect(updateDeleteOrder).toHaveBeenCalledWith({
          videoId: 'videoId',
          transaction: expect.any(Object)
        })
        expect(result).toHaveProperty('data.deleteVideoStudyQuestion', {
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
    })
  })
})
