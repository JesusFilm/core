import { subject } from '@casl/ability'
import { Test, TestingModule } from '@nestjs/testing'

import { Channel, Nexus, NexusStatus, Resource } from '.prisma/api-nexus-client'

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

  describe('Nexus', () => {
    it('allow create when user is owner', () => {
      expect(
        ability.can(
          Action.Create,
          subject('Nexus', {
            id: 'nexusId',
            status: NexusStatus.created,
            userNexuses: [{ userId: user.id, role: 'owner' }]
          } as unknown as Nexus)
        )
      ).toBe(true)
    })

    it('allow manage when user is owner', () => {
      expect(
        ability.can(
          Action.Manage,
          subject('Nexus', {
            id: 'nexusId',
            status: NexusStatus.created,
            userNexuses: [{ userId: user.id, role: 'owner' }]
          } as unknown as Nexus)
        )
      ).toBe(true)
    })
  })

  describe('Channel', () => {
    it('allow create when user is nexus owner', () => {
      expect(
        ability.can(
          Action.Create,
          subject('Channel', {
            id: 'channelId',
            status: NexusStatus.created,
            nexus: {
              userNexuses: [{ userId: user.id, role: 'owner' }],
              status: NexusStatus.created
            }
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
            status: NexusStatus.created,
            nexus: {
              userNexuses: [{ userId: user.id, role: 'owner' }],
              status: NexusStatus.created
            }
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
            status: NexusStatus.created,
            nexus: {
              userNexuses: [{ userId: user.id, role: 'owner' }],
              status: NexusStatus.created
            }
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
            status: NexusStatus.created,
            nexus: {
              userNexuses: [{ userId: user.id, role: 'owner' }],
              status: NexusStatus.created
            }
          } as unknown as Resource)
        )
      ).toBe(true)
    })
  })
})
