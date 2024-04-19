import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Channel } from '.prisma/api-nexus-client'

import { ChannelFilter, ChannelStatus } from '../../__generated__/graphql'
import { GoogleOAuthService } from '../../lib/google/oauth.service'
import { GoogleYoutubeService } from '../../lib/google/youtube.service'
import { PrismaService } from '../../lib/prisma.service'

import { ChannelResolver } from './channel.resolver'

describe('ChannelResolver', () => {
  let resolver: ChannelResolver
  let prismaService: DeepMockProxy<PrismaService>
  let googleOAuthService: DeepMockProxy<GoogleOAuthService>
  let googleYoutubeService: DeepMockProxy<GoogleYoutubeService>

  const channelExample: Channel = {
    id: 'channelId',
    name: 'Channel Name',
    status: 'published',
    nexusId: 'nexusId',
    connected: true,
    platform: 'youtube',
    createdAt: new Date(),
    deletedAt: null
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
  })

  describe('channels', () => {
    it('fetches channels based on filter', async () => {
      prismaService.channel.findMany.mockResolvedValue([channelExample])
      const filter: ChannelFilter = {
        status: ChannelStatus.published,
        nexusId: 'nexusId',
        limit: 10
      }

      const channels = await resolver.channels(filter)
      expect(prismaService.channel.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { status: 'published', nexusId: 'nexusId' },
            { nexus: { userNexuses: {} } }
          ]
        },
        take: 10,
        include: {
          youtube: true
        }
      })
      expect(channels).toEqual([channelExample])
    })
  })

  describe('channel', () => {
    it('fetches a single channel by ID for the current user', async () => {
      prismaService.channel.findUnique.mockResolvedValue(channelExample)
      const userId = 'userId'
      const channel = await resolver.channel(userId, 'channelId')
      expect(prismaService.channel.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'channelId',
          AND: [
            { id: 'channelId' },
            { nexus: { userNexuses: { every: { userId } } } }
          ]
        },
        include: {
          youtube: true
        }
      })
      expect(channel).toEqual(channelExample)
    })
  })

  describe('channelCreate', () => {
    it('creates a channel with the given input and associates it with the nexus', async () => {
      prismaService.nexus.findUnique.mockResolvedValue({
        id: 'nexusId',
        name: 'Nexus Name',
        description: 'Nexus Description',
        createdAt: new Date(),
        deletedAt: null,
        status: 'published'
      })
      prismaService.channel.create.mockResolvedValue(channelExample)
      const userId = 'userId'
      const input = {
        name: 'New Channel',
        nexusId: 'nexusId',
        platform: 'youtube',
        status: 'published'
      }
      const channel = await resolver.channelCreate(userId, input)
      expect(prismaService.channel.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: expect.any(String),
          ...input
        }),
        include: {
          youtube: true
        }
      })
      expect(channel).toEqual(channelExample)
    })
  })

  describe('channelUpdate', () => {
    it('updates a channel with the given input for the current user', async () => {
      prismaService.channel.update.mockResolvedValue(channelExample)
      const userId = 'userId'
      const input = {
        name: 'Updated Channel Name',
        nexusId: 'nexusId',
        platform: 'youtube'
      }
      const channel = await resolver.channelUpdate(userId, 'channelId', input)
      expect(prismaService.channel.update).toHaveBeenCalledWith({
        where: {
          id: 'channelId',
          nexus: { userNexuses: { every: { userId } } }
        },
        data: input,
        include: {
          youtube: true
        }
      })
      expect(channel).toEqual(channelExample)
    })
  })

  describe('channelDelete', () => {
    it('marks a channel as deleted for the current user', async () => {
      prismaService.channel.update.mockResolvedValue({
        ...channelExample,
        status: 'deleted'
      })
      const userId = 'userId'
      const channel = await resolver.channelDelete(userId, 'channelId')
      expect(prismaService.channel.update).toHaveBeenCalledWith({
        where: {
          id: 'channelId',
          nexus: { userNexuses: { every: { userId } } }
        },
        data: {
          status: 'deleted',
          connected: false
        }
      })
      expect(channel).toMatchObject({ ...channelExample, status: 'deleted' })
    })
  })

  describe('connectYoutubeChannel', () => {
    it('connects a YouTube channel using the provided auth code and updates the channel', async () => {
      const userId = 'userId'
      const input = {
        channelId: 'channelId',
        authCode: 'authCode',
        redirectUri: 'redirectUri'
      }

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

      googleOAuthService.getAccessToken.mockResolvedValue(authResponse)
      googleYoutubeService.getChannels.mockResolvedValue(youtubeChannels)
      prismaService.channel.findUnique.mockResolvedValue(channelExample)
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
        ...channelExample,
        connected: true
      })

      const channel = await resolver.connectYoutubeChannel(userId, input)

      expect(googleOAuthService.getAccessToken).toHaveBeenCalledWith({
        code: input.authCode,
        grant_type: 'authorization_code',
        redirect_uri: input.redirectUri
      })
      expect(googleYoutubeService.getChannels).toHaveBeenCalledWith({
        accessToken: authResponse.access_token
      })
      expect(prismaService.channel.update).toHaveBeenCalledWith(
        expect.any(Object)
      )
      expect(channel).toMatchObject({ ...channelExample, connected: true })
    })
  })
})
