import { ExecutionContext } from '@nestjs/common'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import { AuthenticationError } from 'apollo-server-errors'
import { UserJourney, UserJourneyRole } from '../../__generated__/graphql'
import { UserJourneyService } from '../../modules/userJourney/userJourney.service'
import { RoleGuard } from './roleGuard'

describe('RoleGuard', () => {
  const userJourney = {
    id: '1',
    userId: '1',
    journeyId: '2',
    role: UserJourneyRole.owner
  }

  afterAll(() => {
    jest.resetAllMocks()
  })

  const gqlMockFactory = (
    args: { id: string | string[] },
    context: { headers: { 'user-id'?: string }; req: Request }
  ): DeepMocked<ExecutionContext> =>
    createMock<ExecutionContext>({
      getArgByIndex: () => args,
      getType: () => 'graphql',
      getHandler: () => 'query',
      getClass: () => 'Test',
      getArgs: () => [{}, {}, context, {}]
    })

  const gqlContextMockFactory = (
    args: { id: string | string[] },
    contextMock: { headers: { 'user-id'?: string }; req: Request }
  ): DeepMocked<ExecutionContext> => gqlMockFactory(args, contextMock)

  const checkActor = async (
    userJourneyService: UserJourneyService,
    journeyId: string,
    userId: string
  ): Promise<UserJourney> => {
    return userJourney
  }

  describe('1 Role', () => {
    it('should return true', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: '2' },
        {
          headers: { 'user-id': '1' },
          req: createMock<Request>()
        }
      )
      const RoleGuardClass = RoleGuard('id', UserJourneyRole.owner, checkActor)
      const roleGuard = new RoleGuardClass(gqlContext)
      expect(await roleGuard.canActivate(gqlContext)).toEqual(true)
    })
    it('should return true on array of ids', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: ['2', '3'] },
        {
          headers: { 'user-id': '1' },
          req: createMock<Request>()
        }
      )
      const RoleGuardClass = RoleGuard('id', UserJourneyRole.owner, checkActor)
      const roleGuard = new RoleGuardClass(gqlContext)
      expect(await roleGuard.canActivate(gqlContext)).toEqual(true)
    })
    it('should throw error', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: '2' },
        {
          headers: { 'user-id': '1' },
          req: createMock<Request>()
        }
      )
      const RoleGuardClass = RoleGuard('id', UserJourneyRole.editor, checkActor)
      const roleGuard = new RoleGuardClass(gqlContext)
      await expect(roleGuard.canActivate(gqlContext)).rejects.toThrow(
        new AuthenticationError(
          'User does not have the role to perform this action'
        )
      )
    })
  })

  describe('multiple Roles', () => {
    it('should return true', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: '2' },
        {
          headers: { 'user-id': '1' },
          req: createMock<Request>()
        }
      )
      const RoleGuardClass = RoleGuard(
        'id',
        [UserJourneyRole.owner, UserJourneyRole.editor],
        checkActor
      )
      const roleGuard = new RoleGuardClass(gqlContext)
      expect(await roleGuard.canActivate(gqlContext)).toEqual(true)
    })

    it('should return true on array of ids', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: ['2', '3'] },
        {
          headers: { 'user-id': '1' },
          req: createMock<Request>()
        }
      )
      const RoleGuardClass = RoleGuard(
        'id',
        [UserJourneyRole.owner, UserJourneyRole.editor],
        checkActor
      )
      const roleGuard = new RoleGuardClass(gqlContext)
      expect(await roleGuard.canActivate(gqlContext)).toEqual(true)
    })
    it('should throw error', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: '2' },
        {
          headers: { 'user-id': '1' },
          req: createMock<Request>()
        }
      )
      const RoleGuardClass = RoleGuard(
        'id',
        [UserJourneyRole.inviteRequested, UserJourneyRole.editor],
        checkActor
      )
      const roleGuard = new RoleGuardClass(gqlContext)

      await expect(roleGuard.canActivate(gqlContext)).rejects.toThrow(
        new AuthenticationError(
          'User does not have the role to perform this action'
        )
      )
    })
  })
  describe('no userId', () => {
    it('should return false', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: '2' },
        {
          headers: {},
          req: createMock<Request>()
        }
      )
      const RoleGuardClass = RoleGuard('id', UserJourneyRole.owner, checkActor)
      const roleGuard = new RoleGuardClass(gqlContext)
      expect(await roleGuard.canActivate(gqlContext)).toEqual(false)
    })
  })
})
