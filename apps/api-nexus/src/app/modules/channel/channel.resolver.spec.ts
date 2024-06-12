import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { v4 as uuidv4 } from 'uuid'

import { Channel, Prisma } from '.prisma/api-nexus-client'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { GoogleOAuthService } from '../../lib/google/oauth.service'
import { GoogleYoutubeService } from '../../lib/google/youtube.service'
import { PrismaService } from '../../lib/prisma.service'

import { ChannelResolver } from './channel.resolver'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('ChannelResolver', () => {
  let resolver: ChannelResolver,
    prismaService: DeepMockProxy<PrismaService>,
    googleOAuthService: DeepMockProxy<GoogleOAuthService>,
    googleYoutubeService: DeepMockProxy<GoogleYoutubeService>,
    ability: AppAbility

  const channel: Channel = {
    id: 'channelId',
    name: 'Channel Name',
    connected: false,
    platform: 'youtube',
    createdAt: new Date(),
    deletedAt: null,
    title: null,
    description: null,
    youtubeId: null,
    imageUrl: null,
    updatedAt: null,
    publishedAt: null
  }
  const channelWithNexusUserNexus = { ...channel }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        ChannelResolver,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
        {
          provide: GoogleOAuthService,
          useValue: mockDeep<GoogleOAuthService>()
        },
        {
          provide: GoogleYoutubeService,
          useValue: mockDeep<GoogleYoutubeService>()
        }
      ]
    }).compile()

    resolver = module.get<ChannelResolver>(ChannelResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    googleOAuthService = module.get<GoogleOAuthService>(
      GoogleOAuthService
    ) as DeepMockProxy<GoogleOAuthService>
    googleYoutubeService = module.get<GoogleYoutubeService>(
      GoogleYoutubeService
    ) as DeepMockProxy<GoogleYoutubeService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  describe('channels', () => {
    const accessibleChannels: Prisma.ChannelWhereInput = { OR: [{}] }

    beforeEach(() => {
      prismaService.channel.findMany.mockResolvedValueOnce([channel])
    })

    it('returns channels', async () => {
      expect(await resolver.channels(accessibleChannels)).toEqual([channel])
      expect(prismaService.channel.findMany).toHaveBeenCalledWith({
        where: {
          AND: [accessibleChannels, {}]
        }
      })
    })

    it('returns channels with filter', async () => {
      const filter = {}
      expect(await resolver.channels(accessibleChannels, filter)).toEqual([
        channel
      ])
      expect(prismaService.channel.findMany).toHaveBeenCalledWith({
        where: {
          AND: [accessibleChannels, {}]
        }
      })
    })

    it('returns channels with take', async () => {
      const filter = { limit: 1 }
      expect(await resolver.channels(accessibleChannels, filter)).toEqual([
        channel
      ])
      expect(prismaService.channel.findMany).toHaveBeenCalledWith({
        where: {
          AND: [accessibleChannels, {}]
        },
        take: 1
      })
    })
  })

  describe('channel', () => {
    it('returns channel', async () => {
      prismaService.channel.findUnique.mockResolvedValueOnce(
        channelWithNexusUserNexus
      )
      expect(await resolver.channel(ability, 'channelId')).toEqual(
        channelWithNexusUserNexus
      )
      expect(prismaService.channel.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'channelId'
        }
      })
    })

    it('throws error if not found', async () => {
      prismaService.channel.findUnique.mockResolvedValueOnce(null)
      await expect(resolver.channel(ability, 'channelId')).rejects.toThrow(
        'channel not found'
      )
    })

    it('throws error if not authorized', async () => {
      prismaService.channel.findUnique.mockResolvedValueOnce({
        ...channel,
        deletedAt: new Date()
      })
      await expect(resolver.channel(ability, 'channelId')).rejects.toThrow(
        'user is not allowed to view channel'
      )
    })
  })

  describe('channelCreate', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('creates a channel', async () => {
      prismaService.channel.create.mockResolvedValueOnce(channel)
      prismaService.channel.findUnique.mockResolvedValue(
        channelWithNexusUserNexus
      )
      mockUuidv4.mockReturnValueOnce('channelId')
      expect(
        await resolver.channelCreate(ability, {
          name: 'New Channel',
          platform: 'Youtube'
        })
      ).toEqual(channelWithNexusUserNexus)
      expect(prismaService.channel.create).toHaveBeenCalledWith({
        data: {
          id: 'channelId',
          name: 'New Channel',
          platform: 'Youtube'
        }
      })
    })

    it('throws error if not found', async () => {
      prismaService.channel.create.mockResolvedValueOnce(channel)
      prismaService.channel.findUnique.mockResolvedValue(null)
      await expect(
        resolver.channelCreate(ability, {
          name: 'New Channel',
          platform: 'Youtube'
        })
      ).rejects.toThrow('channel not found')
    })
  })

  describe('channelUpdate', () => {
    it('updates a channel', async () => {
      prismaService.channel.findUnique.mockResolvedValueOnce(
        channelWithNexusUserNexus
      )
      prismaService.channel.update.mockResolvedValueOnce(channel)
      const input = {
        name: 'Updated Channel Name',
        platform: 'Updated Platform'
      }
      expect(await resolver.channelUpdate(ability, 'channelId', input)).toEqual(
        channel
      )
      expect(prismaService.channel.update).toHaveBeenCalledWith({
        where: { id: 'channelId' },
        data: input
      })
    })

    it('updates a channel with empty fields when not passed in', async () => {
      prismaService.channel.findUnique.mockResolvedValueOnce(
        channelWithNexusUserNexus
      )
      await resolver.channelUpdate(ability, 'channelId', {
        name: null,
        platform: null
      })
      expect(prismaService.channel.update).toHaveBeenCalledWith({
        where: { id: 'channelId' },
        data: {
          name: undefined,
          platform: undefined
        }
      })
    })

    it('throws error if not authorized', async () => {
      prismaService.channel.findUnique.mockResolvedValueOnce({
        ...channel,
        deletedAt: new Date()
      })
      await expect(
        resolver.channelUpdate(ability, 'channelId', { name: 'new title' })
      ).rejects.toThrow('user is not allowed to update channel')
    })

    it('throws error if not found', async () => {
      prismaService.channel.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.channelUpdate(ability, 'channelId', { name: 'new title' })
      ).rejects.toThrow('channel not found')
    })
  })

  describe('channelDelete', () => {
    it('deletes a channel', async () => {
      prismaService.channel.findUnique.mockResolvedValueOnce(
        channelWithNexusUserNexus
      )
      prismaService.channel.update.mockResolvedValueOnce(channel)
      expect(await resolver.channelDelete(ability, 'channelId')).toEqual(
        channel
      )
      expect(prismaService.channel.update).toHaveBeenCalledWith({
        where: { id: 'channelId' },
        data: {
          connected: false,
          deletedAt: expect.any(Date)
        }
      })
    })

    it('throws error if not authorized', async () => {
      prismaService.channel.findUnique.mockResolvedValueOnce({
        ...channel,
        deletedAt: new Date()
      })
      await expect(
        resolver.channelDelete(ability, 'channelId')
      ).rejects.toThrow('user is not allowed to delete channel')
    })

    it('throws error if not found', async () => {
      prismaService.channel.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.channelDelete(ability, 'channelId')
      ).rejects.toThrow('channel not found')
    })
  })

  describe('connectYoutubeChannel', () => {
    it('connects a nexus channel to a youtube channel', async () => {
      const authResponse = {
        access_token: 'accessToken',
        refresh_token: 'refreshToken',
        expires_in: 3600,
        scope: 'https://www.googleapis.com/auth/youtube.readonly',
        token_type: 'Bearer'
      }

      const youtubeChannels = {
        items: [
          {
            id: 'youtubeChannelId',
            kind: 'youtube#channel',
            etag: '"etagValue"',
            snippet: {
              title: 'YouTube Channel Title',
              description: 'YouTube Channel Description',
              customUrl: 'channelCustomURL',
              publishedAt: '2020-01-01T00:00:00Z',
              thumbnails: {
                default: {
                  url: 'thumbnailUrlDefault',
                  width: 120,
                  height: 90
                },
                medium: {
                  url: 'thumbnailUrlMedium',
                  width: 320,
                  height: 180
                },
                high: {
                  url: 'thumbnailUrlHigh',
                  width: 480,
                  height: 360
                }
              }
            },
            localized: {
              title: 'Localized Title',
              description: 'Localized Description'
            }
          }
        ],
        kind: 'youtube#channelListResponse',
        etag: '"etagListResponse"'
      }

      prismaService.channel.findUnique.mockResolvedValue(
        channelWithNexusUserNexus
      )
      googleOAuthService.getAccessToken.mockResolvedValue(authResponse)
      googleYoutubeService.getChannels.mockResolvedValue(youtubeChannels)
      prismaService.channel.update.mockResolvedValue({
        ...channel,
        connected: true
      })

      expect(
        await resolver.channelConnect(ability, {
          channelId: 'channelId',
          accessToken: 'accessToken'
        })
      ).toEqual({
        ...channel,
        connected: true
      })

      expect(googleYoutubeService.getChannels).toHaveBeenCalledWith({
        accessToken: authResponse.access_token
      })

      expect(prismaService.channel.update).toHaveBeenCalledWith(
        expect.any(Object)
      )
    })

    it('throws error if not authorized', async () => {
      prismaService.channel.findUnique.mockResolvedValueOnce({
        ...channel,
        deletedAt: new Date()
      })
      await expect(
        resolver.channelConnect(ability, {
          channelId: 'channelId',
          accessToken: 'accessToken'
        })
      ).rejects.toThrow('user is not allowed to manage channel')
    })

    it('throws error if not found', async () => {
      prismaService.channel.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.channelConnect(ability, {
          channelId: 'channelId',
          accessToken: 'accessToken'
        })
      ).rejects.toThrow('channel not found')
    })
  })
})
