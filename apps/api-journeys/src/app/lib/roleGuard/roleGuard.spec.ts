import { Test, TestingModule } from '@nestjs/testing'
import { UserJourneyRole } from '../../__generated__/graphql'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { mockDbQueryResult } from '@core/nest/database'
import { DocumentCollection } from 'arangojs/collection'
import { UserJourneyService } from '../../modules/userJourney/userJourney.service'
import { RoleGuard } from './roleGuard'
import { CanActivate, ExecutionContext, Type } from '@nestjs/common'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

describe('RoleGuard', () => {
  let roleGuard: any

  const userJourney = {
    _key: '1',
    userId: '1',
    journeyId: '2',
    role: UserJourneyRole.editor
  }

  const userJourneyService = {
    provide: UserJourneyService,
    useFactory: () => ({
      forJourneyUser: jest.fn(() => userJourney)
    })
  }

  afterAll(() => {
    jest.resetAllMocks()
  })

  const gqlMockFactory = (
    args: any,
    context: Record<string, any>,
    info: Record<string, any>
  ): DeepMocked<ExecutionContext> =>
    createMock<ExecutionContext>({
      getArgByIndex: () => args,
      getType: () => 'graphql',
      getHandler: () => 'query',
      getClass: () => 'Test',
      getArgs: () => [{}, {}, context, info]
    })

  const gqlContextMockFactory = (
    args,
    contextMock: any
  ): DeepMocked<ExecutionContext> => gqlMockFactory(args, contextMock, {})

  describe('1 Role', () => {
    it('should return true', async () => {
      const requestMock = createMock<Request>()
      const gqlContext = gqlContextMockFactory(
        { id: '2' },
        {
          headers: { 'user-id': '1' },
          req: requestMock
        }
      )
      const RoleGuardClass = RoleGuard('id', UserJourneyRole.owner)
      const newroleGuard: any = new RoleGuardClass(gqlContext)
      const module = await Test.createTestingModule({
        providers: [
          userJourneyService,
          newroleGuard,
          {
            provide: 'DATABASE',
            useFactory: () => mockDeep<Database>()
          }
        ]
      }).compile()
      roleGuard = module.get<Type<CanActivate>>(newroleGuard)
      expect(roleGuard.canActivate(gqlContext)).toEqual(true)
    })
  })
})
