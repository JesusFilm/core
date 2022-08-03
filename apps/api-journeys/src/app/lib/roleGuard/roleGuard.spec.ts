import { ExecutionContext } from '@nestjs/common'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import { AuthenticationError } from 'apollo-server-errors'
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

describe('RoleGuard', () => {
  const userJourney = {
    id: '1',
    userId: '1',
    journeyId: '2',
    role: UserJourneyRole.owner
  }

  const userRole = {
    id: '1',
    userId: '1',
    roles: [Role.publisher]
  }

  const journey = {
    id: 'journey-id',
    title: 'Journey Heading',
    description: 'Description',
    slug: 'default',
    language: {
      __typename: 'Language',
      id: '529',
      name: [
        {
          __typename: 'Translation',
          value: 'English',
          primary: true
        }
      ]
    },
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

  const fetchUserJourney = async (
    userJourneyService: UserJourneyService,
    journeyId: string,
    userId: string
  ): Promise<UserJourney> => {
    return userJourney
  }

  const fetchUserRole = async (
    userRoleService: UserRoleService,
    userId: string
  ): Promise<UserRole> => {
    return userRole
  }

  const fetchJourney = async (
    journeyService: JourneyService,
    journeyId: string
  ): Promise<Journey> => {
    return journey
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
          headers: { 'user-id': '1' },
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
          headers: { 'user-id': '1' },
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
          headers: { 'user-id': '1' },
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
          headers: { 'user-id': '1' },
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
          headers: { 'user-id': '1' },
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
          headers: { 'user-id': '1' },
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
    it('should return true for single user role', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: '2' },
        {
          headers: { 'user-id': '1' },
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
          headers: { 'user-id': '1' },
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
    it('should return true if role is publisher and template true', async () => {
      const gqlContext = gqlContextMockFactory(
        { id: '2' },
        {
          headers: { 'user-id': '1' },
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
          headers: { 'user-id': '1' },
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
          headers: { 'user-id': '1' },
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
