import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { v4 as uuidv4 } from 'uuid'

import { Channel, NexusStatus, Prisma } from '.prisma/api-nexus-client'
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
    status: NexusStatus.created,
    connected: true,
    platform: 'youtube',
    createdAt: new Date(),
    deletedAt: null
  }
  const channelWithNexusUserNexus = {
    ...channel,
    nexus: {
      userNexuses: [{ userId: 'userId', role: 'owner' }],
      status: NexusStatus.created
    }
  }

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
        },
        include: { youtube: true }
      })
    })

    it('returns channels with filter', async () => {
      const filter = { nexusId: 'nexusId' }
      expect(await resolver.channels(accessibleChannels, filter)).toEqual([
        channel
      ])
      expect(prismaService.channel.findMany).toHaveBeenCalledWith({
        where: {
          AND: [accessibleChannels, { nexusId: 'nexusId' }]
        },
        include: { youtube: true }
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
        take: 1,
        include: { youtube: true }
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
        },
        include: { youtube: true, nexus: { include: { userNexuses: true } } }
      })
    })

    it('throws error if not found', async () => {
      prismaService.channel.findUnique.mockResolvedValueOnce(null)
      await expect(resolver.channel(ability, 'channelId')).rejects.toThrow(
        'channel not found'
      )
    })

    it('throws error if not authorized', async () => {
      prismaService.channel.findUnique.mockResolvedValueOnce(channel)
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
          nexusId: 'nexusId',
          name: 'New Channel',
          platform: 'Youtube'
        })
      ).toEqual(channelWithNexusUserNexus)
      expect(prismaService.channel.create).toHaveBeenCalledWith({
        data: {
          id: 'channelId',
          name: 'New Channel',
          nexusId: 'nexusId',
          platform: 'Youtube',
          status: 'published'
        }
      })
    })

    it('throws error if not found', async () => {
      prismaService.channel.create.mockResolvedValueOnce(channel)
      prismaService.channel.findUnique.mockResolvedValue(null)
      await expect(
        resolver.channelCreate(ability, {
          nexusId: 'nexusId',
          name: 'New Channel',
          platform: 'Youtube'
        })
      ).rejects.toThrow('channel not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.channel.create.mockResolvedValueOnce(channel)
      prismaService.channel.findUnique.mockResolvedValue(channel)
      await expect(
        resolver.channelCreate(ability, {
          nexusId: 'nexusId',
          name: 'New Channel',
          platform: 'Youtube'
        })
      ).rejects.toThrow('user is not allowed to create channel')
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
        data: input,
        include: { youtube: true }
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
        },
        include: { youtube: true }
      })
    })

    it('throws error if not authorized', async () => {
      prismaService.channel.findUnique.mockResolvedValueOnce(channel)
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
        data: { status: NexusStatus.deleted, connected: false },
        include: { youtube: true }
      })
    })

    it('throws error if not authorized', async () => {
      prismaService.channel.findUnique.mockResolvedValueOnce(channel)
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
      prismaService.channelYoutube.create.mockResolvedValue({
        id: 'channelYoutubeId',
        channelId: 'channelId',
        title: 'YouTube Channel Title',
        description: 'YouTube Channel Description',
        youtubeId: 'youtubeChannelId',
        imageUrl: 'thumbnailUrl',
        refreshToken: 'refreshToken'
      })
      prismaService.channel.update.mockResolvedValue({
        ...channel,
        connected: true
      })

      expect(
        await resolver.connectYoutubeChannel(ability, {
          channelId: 'channelId',
          authCode: 'authCode',
          redirectUri: 'redirectUri'
        })
      ).toEqual({
        ...channel,
        connected: true
      })

      expect(googleOAuthService.getAccessToken).toHaveBeenCalledWith({
        code: 'authCode',
        grant_type: 'authorization_code',
        redirect_uri: 'redirectUri'
      })
      expect(googleYoutubeService.getChannels).toHaveBeenCalledWith({
        accessToken: authResponse.access_token
      })
      expect(prismaService.channel.update).toHaveBeenCalledWith(
        expect.any(Object)
      )
    })

    it('throws error if not authorized', async () => {
      prismaService.channel.findUnique.mockResolvedValueOnce(channel)
      await expect(
        resolver.connectYoutubeChannel(ability, {
          channelId: 'channelId',
          authCode: 'authCode',
          redirectUri: 'redirectUri'
        })
      ).rejects.toThrow('user is not allowed to manage channel')
    })

    it('throws error if not found', async () => {
      prismaService.channel.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.connectYoutubeChannel(ability, {
          channelId: 'channelId',
          authCode: 'authCode',
          redirectUri: 'redirectUri'
        })
      ).rejects.toThrow('channel not found')
    })
  })
})
