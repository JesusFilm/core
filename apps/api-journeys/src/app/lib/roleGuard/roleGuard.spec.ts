import { ExecutionContext } from '@nestjs/common'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import { AuthenticationError } from 'apollo-server-errors'
import { contextToUserId } from '@core/nest/common/firebaseClient'
import {
  Journey,
  JourneyStatus,
  Role,
  ThemeMode,
  ThemeName,
  UserJourney,
  UserJourneyRole,
  UserRole
} from '../../__generated__/graphql'
import { UserJourneyService } from '../../modules/userJourney/userJourney.service'
import { UserRoleService } from '../../modules/userRole/userRole.service'
import { JourneyService } from '../../modules/journey/journey.service'
import { RoleGuard } from './roleGuard'

jest.mock('@core/nest/common/firebaseClient', () => ({
  __esModule: true,
  contextToUserId: jest.fn()
}))

const mockContextToUserId = contextToUserId as jest.MockedFunction<
  typeof contextToUserId
>

describe('RoleGuard', () => {
  const userJourney: UserJourney = {
    id: '1',
    userId: '1',
    journeyId: '2',
    role: UserJourneyRole.owner
  }

  const userRole: UserRole = {
    id: '1',
    userId: '1',
    roles: [Role.publisher]
  }

  const journey: Journey = {
    id: 'journey-id',
    title: 'Journey Heading',
    description: 'Description',
    slug: 'default',
    language: { id: '529' },
    status: JourneyStatus.published,
    createdAt: '2021-11-19T12:34:56.647Z',
    publishedAt: null,
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    blocks: null,
    primaryImageBlock: null,
    seoTitle: null,
    seoDescription: null,
    userJourneys: [userJourney],
    template: true
  }

  afterAll(() => {
    jest.resetAllMocks()
  })

  const gqlMockFactory = (
    args: { id: string | string[] },
    context: { headers: { authorization?: string }; req: Request }
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
    contextMock: { headers: { authorization?: string }; req: Request }
  ): DeepMocked<ExecutionContext> => gqlMockFactory(args, contextMock)

  const fetchUserJourney = async (
    _userJourneyService: UserJourneyService,
    _journeyId: string,
    _userId: string
  ): Promise<UserJourney> => {
    return userJourney
  }

  const fetchUserRole = async (
    _userRoleService: UserRoleService,
    _userId: string
  ): Promise<UserRole> => {
    return userRole
  }

  const fetchJourney = async (
    _journeyService: JourneyService,
    _journeyId: string
  ): Promise<Journey> => {
    return journey
  }

  describe('1 Role', () => {
    beforeEach(() => {
      mockContextToUserId.mockResolvedValueOnce('1')
    })

    it('should return true', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: '2' },
        {
          headers: { authorization: 'firebaseAccessToken' },
          req: createMock<Request>()
        }
      )
      const RoleGuardClass = RoleGuard(
        'id',
        UserJourneyRole.owner,
        fetchUserJourney,
        fetchUserRole,
        fetchJourney
      )
      const roleGuard = new RoleGuardClass(gqlContext)
      expect(await roleGuard.canActivate(gqlContext)).toEqual(true)
    })

    it('should return true on array of ids', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: ['2', '3'] },
        {
          headers: { authorization: 'firebaseAccessToken' },
          req: createMock<Request>()
        }
      )
      const RoleGuardClass = RoleGuard(
        'id',
        [UserJourneyRole.owner],
        fetchUserJourney,
        fetchUserRole,
        fetchJourney
      )
      const roleGuard = new RoleGuardClass(gqlContext)
      expect(await roleGuard.canActivate(gqlContext)).toEqual(true)
    })

    it('should throw error', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: '2' },
        {
          headers: { authorization: 'firebaseAccessToken' },
          req: createMock<Request>()
        }
      )
      const RoleGuardClass = RoleGuard(
        'id',
        UserJourneyRole.editor,
        fetchUserJourney,
        fetchUserRole,
        fetchJourney
      )
      const roleGuard = new RoleGuardClass(gqlContext)
      await expect(roleGuard.canActivate(gqlContext)).rejects.toThrow(
        new AuthenticationError(
          'User does not have the role to perform this action'
        )
      )
    })
  })

  describe('multiple Roles', () => {
    beforeEach(() => {
      mockContextToUserId.mockResolvedValueOnce('1')
    })

    it('should return true', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: '2' },
        {
          headers: { authorization: 'firebaseAccessToken' },
          req: createMock<Request>()
        }
      )
      const RoleGuardClass = RoleGuard(
        'id',
        [UserJourneyRole.owner, UserJourneyRole.editor],
        fetchUserJourney,
        fetchUserRole,
        fetchJourney
      )
      const roleGuard = new RoleGuardClass(gqlContext)
      expect(await roleGuard.canActivate(gqlContext)).toEqual(true)
    })

    it('should return true on array of ids', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: ['2', '3'] },
        {
          headers: { authorization: 'firebaseAccessToken' },
          req: createMock<Request>()
        }
      )
      const RoleGuardClass = RoleGuard(
        'id',
        [UserJourneyRole.owner, UserJourneyRole.editor],
        fetchUserJourney,
        fetchUserRole,
        fetchJourney
      )
      const roleGuard = new RoleGuardClass(gqlContext)
      expect(await roleGuard.canActivate(gqlContext)).toEqual(true)
    })

    it('should return true with different roles', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: '2' },
        {
          headers: { authorization: 'firebaseAccessToken' },
          req: createMock<Request>()
        }
      )
      const RoleGuardClass = RoleGuard(
        'id',
        [UserJourneyRole.editor, UserJourneyRole.owner, Role.publisher],
        fetchUserJourney,
        fetchUserRole,
        fetchJourney
      )
      const roleGuard = new RoleGuardClass(gqlContext)
      expect(await roleGuard.canActivate(gqlContext)).toEqual(true)
    })

    it('should return true with defined roles and custom roles', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: '2' },
        {
          headers: { authorization: 'firebaseAccessToken' },
          req: createMock<Request>()
        }
      )
      const RoleGuardClass = RoleGuard(
        'id',
        [
          UserJourneyRole.owner,
          UserJourneyRole.editor,
          { role: [Role.publisher], attributes: { template: true } }
        ],
        fetchUserJourney,
        fetchUserRole,
        fetchJourney
      )
      const roleGuard = new RoleGuardClass(gqlContext)
      expect(await roleGuard.canActivate(gqlContext)).toEqual(true)
    })

    it('should throw error', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: '2' },
        {
          headers: { authorization: 'firebaseAccessToken' },
          req: createMock<Request>()
        }
      )
      const RoleGuardClass = RoleGuard(
        'id',
        [UserJourneyRole.inviteRequested, UserJourneyRole.editor],
        fetchUserJourney,
        fetchUserRole,
        fetchJourney
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
    beforeEach(() => {
      mockContextToUserId.mockResolvedValueOnce(null)
    })

    it('should return false', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: '2' },
        {
          headers: {},
          req: createMock<Request>()
        }
      )
      const RoleGuardClass = RoleGuard(
        'id',
        UserJourneyRole.owner,
        fetchUserJourney,
        fetchUserRole,
        fetchJourney
      )
      const roleGuard = new RoleGuardClass(gqlContext)
      expect(await roleGuard.canActivate(gqlContext)).toEqual(false)
    })
  })

  describe('user Role', () => {
    beforeEach(() => {
      mockContextToUserId.mockResolvedValueOnce('1')
    })

    it('should return true for single user role', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: '2' },
        {
          headers: { authorization: 'firebaseAccessToken' },
          req: createMock<Request>()
        }
      )
      const RoleGuardClass = RoleGuard(
        'id',
        Role.publisher,
        fetchUserJourney,
        fetchUserRole,
        fetchJourney
      )
      const roleGuard = new RoleGuardClass(gqlContext)
      expect(await roleGuard.canActivate(gqlContext)).toEqual(true)
    })

    it('should return true for user role in array', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: '2' },
        {
          headers: { authorization: 'firebaseAccessToken' },
          req: createMock<Request>()
        }
      )
      const RoleGuardClass = RoleGuard(
        'id',
        [Role.publisher],
        fetchUserJourney,
        fetchUserRole,
        fetchJourney
      )
      const roleGuard = new RoleGuardClass(gqlContext)
      expect(await roleGuard.canActivate(gqlContext)).toEqual(true)
    })
  })

  describe('custom Roles', () => {
    beforeEach(() => {
      mockContextToUserId.mockResolvedValueOnce('1')
    })
    it('should return true for 1 role', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: '2' },
        {
          headers: { authorization: 'firebaseAccessToken' },
          req: createMock<Request>()
        }
      )
      const RoleGuardClass = RoleGuard(
        'id',
        [
          {
            role: Role.publisher,
            attributes: { template: true }
          }
        ],
        fetchUserJourney,
        fetchUserRole,
        fetchJourney
      )
      const roleGuard = new RoleGuardClass(gqlContext)
      expect(await roleGuard.canActivate(gqlContext)).toEqual(true)
    })

    it('should return true for role in an array', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: '2' },
        {
          headers: { authorization: 'firebaseAccessToken' },
          req: createMock<Request>()
        }
      )
      const RoleGuardClass = RoleGuard(
        'id',
        [
          {
            role: [Role.publisher]
          }
        ],
        fetchUserJourney,
        fetchUserRole,
        fetchJourney
      )
      const roleGuard = new RoleGuardClass(gqlContext)
      await expect(roleGuard.canActivate(gqlContext)).resolves.toEqual(true)
    })

    it('should return true for role with attributes', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: '2' },
        {
          headers: { authorization: 'firebaseAccessToken' },
          req: createMock<Request>()
        }
      )
      const RoleGuardClass = RoleGuard(
        'id',
        [
          {
            role: ['public'],
            attributes: { template: true, status: JourneyStatus.published }
          }
        ],
        fetchUserJourney,
        fetchUserRole,
        fetchJourney
      )
      const roleGuard = new RoleGuardClass(gqlContext)
      expect(await roleGuard.canActivate(gqlContext)).toEqual(true)
    })
  })
})
