import { subject } from '@casl/ability'
import { Test, TestingModule } from '@nestjs/testing'

import { Channel, Resource } from '.prisma/api-nexus-client'

import { ResourceStatus } from '../../../__generated__/graphql'

import { Action, AppAbility, AppCaslFactory } from '.'

describe('AppCaslFactory', () => {
  let factory: AppCaslFactory, ability: AppAbility
  const user = { id: 'userId' }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppCaslFactory]
    }).compile()
    factory = module.get<AppCaslFactory>(AppCaslFactory)
    ability = await factory.createAbility(user)
  })

  describe('Channel', () => {
    it('allow create when user is nexus owner', () => {
      expect(
        ability.can(
          Action.Create,
          subject('Channel', {
            id: 'channelId',
            deletedAt: null
          } as unknown as Channel)
        )
      ).toBe(true)
    })

    it('allow manage when user is nexus owner', () => {
      expect(
        ability.can(
          Action.Manage,
          subject('Channel', {
            id: 'channelId',
            deletedAt: null
          } as unknown as Channel)
        )
      ).toBe(true)
    })
  })

  describe('Resource', () => {
    it('allow create when user is nexus owner', () => {
      expect(
        ability.can(
          Action.Create,
          subject('Resource', {
            id: 'resourceId',
            status: ResourceStatus.created
          } as unknown as Resource)
        )
      ).toBe(true)
    })

    it('allow manage when user is nexus owner', () => {
      expect(
        ability.can(
          Action.Manage,
          subject('Resource', {
            id: 'resourceId',
            deletedAt: null
          } as unknown as Resource)
        )
      ).toBe(true)
    })
  })
})
