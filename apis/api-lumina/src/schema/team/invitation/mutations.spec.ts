import { Team, TeamInvitation, TeamMember } from '@core/prisma/lumina/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

import { generateToken, generateTokenHash } from './lib/generateToken'
import { sendTeamInvitationEmail } from './lib/sendTeamInvitationEmail'

jest.mock('./lib/generateToken', () => ({
  generateToken: jest.fn(),
  generateTokenHash: jest.fn()
}))
jest.mock('./lib/sendTeamInvitationEmail', () => ({
  sendTeamInvitationEmail: jest.fn()
}))

const generateTokenMock = generateToken as jest.MockedFunction<
  typeof generateToken
>
const generateTokenHashMock = generateTokenHash as jest.MockedFunction<
  typeof generateTokenHash
>

const sendTeamInvitationEmailMock =
  sendTeamInvitationEmail as jest.MockedFunction<typeof sendTeamInvitationEmail>

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
            createdAt
            updatedAt
          }
        }
        ... on ForbiddenError {
          message
        }
        ... on NotFoundError {
          message
        }
        ... on ZodError {
          fieldErrors {
            message
            path
          }
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
      const userMember: TeamMember = {
        id: 'memberId',
        teamId: 'teamId',
        userId: 'testUserId',
        role: 'OWNER',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
      prismaMock.teamMember.findUnique.mockResolvedValue(userMember)

      const invitation: TeamInvitation = {
        id: 'newInvitationId',
        teamId: 'teamId',
        email: 'new@example.com',
        role: 'MEMBER',
        tokenHash: 'test-hash',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
      prismaMock.teamInvitation.create.mockResolvedValue(invitation)

      const data = await authClient({
        document: CREATE_INVITATION_MUTATION,
        variables: {
          input: {
            teamId: '9f2c2d38-5c91-47b3-8a9b-63a472a6ffb1',
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
        role: 'MEMBER',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      })
    })

    it('should reject if user is not owner or manager', async () => {
      prismaMock.teamMember.findUnique.mockResolvedValue({
        id: 'memberId',
        teamId: 'teamId',
        userId: 'testUserId',
        role: 'MEMBER',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: CREATE_INVITATION_MUTATION,
        variables: {
          input: {
            teamId: '9f2c2d38-5c91-47b3-8a9b-63a472a6ffb1',
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

    it('should reject if input is not valid', async () => {
      const data = await authClient({
        document: CREATE_INVITATION_MUTATION,
        variables: {
          input: {
            teamId: 'invalid-team-id',
            email: 'invalid-email',
            role: 'MEMBER'
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamInvitationCreate.fieldErrors',
        [
          {
            message: 'Team ID must be a valid UUID',
            path: ['input', 'teamId']
          },
          {
            message: 'Invalid email',
            path: ['input', 'email']
          }
        ]
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
        } as Team & { members: TeamMember[] }
      } as TeamInvitation & { team: Team & { members: TeamMember[] } })

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

    it('should reject if user is not owner or manager', async () => {
      const invitation: TeamInvitation & {
        team: Team & { members: TeamMember[] }
      } = {
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
              role: 'MEMBER',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01')
            }
          ]
        }
      }
      prismaMock.teamInvitation.findUnique.mockResolvedValue(invitation)
      const data = await authClient({
        document: RESEND_INVITATION_MUTATION,
        variables: { id: 'invitationId' }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamInvitationResend.message',
        'Only team owner or manager can resend invitations'
      )
    })

    it('should reject if invitation not found', async () => {
      prismaMock.teamInvitation.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: RESEND_INVITATION_MUTATION,
        variables: { id: 'invitationId' }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamInvitationResend.message',
        'Team invitation not found'
      )
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
        } as Team & { members: TeamMember[] }
      } as TeamInvitation & { team: Team & { members: TeamMember[] } })

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

    it('should reject if user is not owner or manager', async () => {
      const invitation: TeamInvitation & {
        team: Team & { members: TeamMember[] }
      } = {
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
              role: 'MEMBER',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01')
            }
          ]
        }
      }

      prismaMock.teamInvitation.findUnique.mockResolvedValue(invitation)
      const data = await authClient({
        document: DELETE_INVITATION_MUTATION,
        variables: { id: 'invitationId' }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamInvitationDelete.message',
        'Only team owner or manager can delete invitations'
      )
    })

    it('should reject if invitation not found', async () => {
      prismaMock.teamInvitation.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: DELETE_INVITATION_MUTATION,
        variables: { id: 'invitationId' }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamInvitationDelete.message',
        'Team invitation not found'
      )
    })
  })
})
