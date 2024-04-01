import { subject } from '@casl/ability'
import { Test, TestingModule } from '@nestjs/testing'

import { UserTeamRole } from '../../__generated__/graphql'
import { Action, AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'

describe('customDomainAcl', () => {
  let factory: AppCaslFactory, ability: AppAbility
  const customDomain = {
    id: 'cd',
    teamId: 'teamId',
    name: 'name.com',
    apexName: 'name.com',
    routeAllTeamJourneys: true,
    journeyCollectionId: null
  }
  const user = { id: 'userId' }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppCaslFactory]
    }).compile()
    factory = module.get<AppCaslFactory>(AppCaslFactory)
    ability = await factory.createAbility(user)
  })

  describe('Create', () => {
    it('should allow when user is team manager', () => {
      expect(
        ability.can(
          Action.Create,
          subject('CustomDomain', {
            ...customDomain,
            team: {
              userTeams: [
                {
                  userId: 'userId',
                  role: UserTeamRole.manager
                }
              ]
            }
          })
        )
      ).toBe(true)
    })

    it('should not allow when user is not team manager', () => {
      expect(
        ability.can(
          Action.Create,
          subject('CustomDomain', {
            ...customDomain,
            team: {
              userTeams: [
                {
                  userId: 'userId',
                  role: UserTeamRole.member
                }
              ]
            }
          })
        )
      ).toBe(false)
    })
  })

  describe('Manage', () => {
    it('should allow when user is team manager', () => {
      expect(
        ability.can(
          Action.Manage,
          subject('CustomDomain', {
            ...customDomain,
            team: {
              userTeams: [
                {
                  userId: 'userId',
                  role: UserTeamRole.manager
                }
              ]
            }
          })
        )
      ).toBe(true)
    })

    it('should not allow when user is not team manager', () => {
      expect(
        ability.can(
          Action.Manage,
          subject('CustomDomain', {
            ...customDomain,
            team: {
              userTeams: [
                {
                  userId: 'userId',
                  role: UserTeamRole.member
                }
              ]
            }
          })
        )
      ).toBe(false)
    })
  })

  describe('Delete', () => {
    it('should allow when user is team manager', () => {
      expect(
        ability.can(
          Action.Delete,
          subject('CustomDomain', {
            ...customDomain,
            team: {
              userTeams: [
                {
                  userId: 'userId',
                  role: UserTeamRole.manager
                }
              ]
            }
          })
        )
      ).toBe(true)
    })

    it('should not allow when user is not team manager', () => {
      expect(
        ability.can(
          Action.Delete,
          subject('CustomDomain', {
            ...customDomain,
            team: {
              userTeams: [
                {
                  userId: 'userId',
                  role: UserTeamRole.member
                }
              ]
            }
          })
        )
      ).toBe(false)
    })
  })
})
