import { Test, TestingModule } from '@nestjs/testing'
import { subject } from '@casl/ability'
import { Host } from '.prisma/api-journeys-client'
import { Action, AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'

describe('hostAcl', () => {
  let factory: AppCaslFactory, ability: AppAbility
  const user = { id: 'userId' }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppCaslFactory]
    }).compile()
    factory = module.get<AppCaslFactory>(AppCaslFactory)
    ability = await factory.createAbility(user)
  })
  it('should allow manage when user is member of team', () => {
    expect(
      ability.can(
        Action.Manage,
        subject('Host', {
          id: 'hostId',
          team: {
            userTeams: [{ userId: user.id }]
          }
        } as unknown as Host)
      )
    ).toEqual(true)
  })
})
