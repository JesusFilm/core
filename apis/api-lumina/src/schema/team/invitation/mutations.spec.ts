import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

import * as generateTokenModule from './lib/generateToken'
import * as sendTeamInvitationEmailModule from './lib/sendTeamInvitationEmail'

jest.mock('./lib/generateToken')
jest.mock('./lib/sendTeamInvitationEmail')

const generateTokenMock =
  generateTokenModule.generateToken as jest.MockedFunction<
    typeof generateTokenModule.generateToken
  >
const generateTokenHashMock =
  generateTokenModule.generateTokenHash as jest.MockedFunction<
    typeof generateTokenModule.generateTokenHash
  >
const sendTeamInvitationEmailMock =
  sendTeamInvitationEmailModule.sendTeamInvitationEmail as jest.MockedFunction<
    typeof sendTeamInvitationEmailModule.sendTeamInvitationEmail
  >

describe('team invitation mutations', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  const CREATE_INVITATION_MUTATION = graphql(`
    mutation CreateInvitation($input: LuminaTeamInvitationCreateInput!) {
      luminaTeamInvitationCreate(input: $input) {
        ... on MutationLuminaTeamInvitationCreateSuccess {
          data {
            id
            teamId
            email
            role
          }
        }
        ... on ForbiddenError {
          message
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `)

  const ACCEPT_INVITATION_MUTATION = graphql(`
    mutation AcceptInvitation($token: String!) {
      luminaTeamInvitationAccept(token: $token) {
        ... on MutationLuminaTeamInvitationAcceptSuccess {
          data {
            id
            teamId
            userId
            role
          }
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `)

  const RESEND_INVITATION_MUTATION = graphql(`
    mutation ResendInvitation($id: ID!) {
      luminaTeamInvitationResend(id: $id) {
        ... on MutationLuminaTeamInvitationResendSuccess {
          data {
            id
            email
          }
        }
        ... on ForbiddenError {
          message
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `)

  const DELETE_INVITATION_MUTATION = graphql(`
    mutation DeleteInvitation($id: ID!) {
      luminaTeamInvitationDelete(id: $id) {
        ... on MutationLuminaTeamInvitationDeleteSuccess {
          data {
            id
          }
        }
        ... on ForbiddenError {
          message
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `)

  beforeEach(() => {
    generateTokenMock.mockResolvedValue({
      token: 'test-token',
      hash: 'test-hash'
    })
    generateTokenHashMock.mockReturnValue('test-hash')
    sendTeamInvitationEmailMock.mockResolvedValue(undefined)
  })

  describe('luminaTeamInvitationCreate', () => {
    it('should create invitation as owner', async () => {
      prismaMock.teamMember.findUnique.mockResolvedValue({
        id: 'memberId',
        teamId: 'teamId',
        userId: 'testUserId',
        role: 'OWNER'
      })

      prismaMock.teamInvitation.create.mockResolvedValue({
        id: 'newInvitationId',
        teamId: 'teamId',
        email: 'new@example.com',
        role: 'MEMBER'
      } as any)

      const data = await authClient({
        document: CREATE_INVITATION_MUTATION,
        variables: {
          input: {
            teamId: 'teamId',
            email: 'new@example.com',
            role: 'MEMBER'
          }
        }
      })

      expect(sendTeamInvitationEmailMock).toHaveBeenCalled()
      expect(data).toHaveProperty('data.luminaTeamInvitationCreate.data', {
        id: 'newInvitationId',
        teamId: 'teamId',
        email: 'new@example.com',
        role: 'MEMBER'
      })
    })

    it('should reject if user is not owner or manager', async () => {
      prismaMock.teamMember.findUnique.mockResolvedValue({
        id: 'memberId',
        teamId: 'teamId',
        userId: 'testUserId',
        role: 'MEMBER'
      })

      const data = await authClient({
        document: CREATE_INVITATION_MUTATION,
        variables: {
          input: {
            teamId: 'teamId',
            email: 'new@example.com',
            role: 'MEMBER'
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamInvitationCreate.message',
        'Only team owner or manager can create invitations'
      )
    })
  })

  describe('luminaTeamInvitationAccept', () => {
    it('should accept invitation', async () => {
      const token = 'test-token'

      prismaMock.teamInvitation.findUnique.mockResolvedValue({
        id: 'invitationId',
        teamId: 'teamId',
        email: 'test@example.com',
        role: 'MEMBER',
        tokenHash: 'hashed-token',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      prismaMock.$transaction.mockImplementation(async (callback) => {
        const tx = prismaMock
        return await callback(tx)
      })

      prismaMock.teamInvitation.delete.mockResolvedValue({
        id: 'invitationId',
        teamId: 'teamId',
        email: 'test@example.com',
        role: 'MEMBER',
        tokenHash: 'hashed-token',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      prismaMock.teamMember.create.mockResolvedValue({
        id: 'newMemberId',
        teamId: 'teamId',
        userId: 'testUserId',
        role: 'MEMBER',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: ACCEPT_INVITATION_MUTATION,
        variables: { token }
      })

      expect(generateTokenHashMock).toHaveBeenCalledWith(token)
      expect(prismaMock.teamInvitation.findUnique).toHaveBeenCalled()
      expect(data).toHaveProperty('data.luminaTeamInvitationAccept.data', {
        id: 'newMemberId',
        teamId: 'teamId',
        userId: 'testUserId',
        role: 'MEMBER'
      })
    })

    it('should reject if invitation not found', async () => {
      prismaMock.teamInvitation.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: ACCEPT_INVITATION_MUTATION,
        variables: { token: 'invalid-token' }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamInvitationAccept.message',
        'Team invitation not found'
      )
    })
  })

  describe('luminaTeamInvitationResend', () => {
    it('should resend invitation', async () => {
      prismaMock.teamInvitation.findUnique.mockResolvedValue({
        id: 'invitationId',
        teamId: 'teamId',
        email: 'test@example.com',
        role: 'MEMBER',
        tokenHash: 'hashed-token',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        team: {
          id: 'teamId',
          name: 'Test Team',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          members: [
            {
              id: 'memberId',
              teamId: 'teamId',
              userId: 'testUserId',
              role: 'OWNER',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01')
            }
          ]
        }
      })

      prismaMock.teamInvitation.update.mockResolvedValue({
        id: 'invitationId',
        teamId: 'teamId',
        email: 'test@example.com',
        role: 'MEMBER',
        tokenHash: 'hashed-token',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: RESEND_INVITATION_MUTATION,
        variables: { id: 'invitationId' }
      })

      expect(sendTeamInvitationEmailMock).toHaveBeenCalled()
      expect(data).toHaveProperty('data.luminaTeamInvitationResend.data', {
        id: 'invitationId',
        email: 'test@example.com'
      })
    })
  })

  describe('luminaTeamInvitationDelete', () => {
    it('should delete invitation', async () => {
      prismaMock.teamInvitation.findUnique.mockResolvedValue({
        id: 'invitationId',
        teamId: 'teamId',
        email: 'test@example.com',
        role: 'MEMBER',
        tokenHash: 'hashed-token',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        team: {
          id: 'teamId',
          name: 'Test Team',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          members: [
            {
              id: 'memberId',
              teamId: 'teamId',
              userId: 'testUserId',
              role: 'OWNER',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01')
            }
          ]
        }
      })

      prismaMock.teamInvitation.delete.mockResolvedValue({
        id: 'invitationId',
        teamId: 'teamId',
        email: 'test@example.com',
        role: 'MEMBER',
        tokenHash: 'hashed-token',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: DELETE_INVITATION_MUTATION,
        variables: { id: 'invitationId' }
      })

      expect(data).toHaveProperty('data.luminaTeamInvitationDelete.data', {
        id: 'invitationId'
      })
    })
  })
})
