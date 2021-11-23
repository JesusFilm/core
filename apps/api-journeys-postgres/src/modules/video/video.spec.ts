import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import {
  videoModule,
  actionModule,
  journeyModule,
  blockModule,
  responseModule
} from '..'
import dbMock from '../../../tests/dbMock'
import { v4 as uuidv4 } from 'uuid'
import {
  Block,
  ThemeName,
  ThemeMode,
  Response
} from '.prisma/api-journeys-client'
import { DocumentNode, ExecutionResult } from 'graphql'
import { get } from 'lodash'

describe('VideoModule', () => {
  let app, journeyId

  beforeEach(() => {
    app = testkit.testModule(videoModule, {
      schemaBuilder,
      modules: [journeyModule, blockModule, responseModule, actionModule]
    })
    journeyId = uuidv4()
    dbMock.journey.findUnique.mockResolvedValue({
      id: journeyId,
      title: 'published',
      published: true,
      locale: 'en-US',
      themeMode: ThemeMode.light,
      themeName: ThemeName.base,
      description: null,
      primaryImageBlockId: null,
      slug: 'published-slug'
    })
  })

  async function query(document: DocumentNode): Promise<ExecutionResult> {
    return await testkit.execute(app, {
      document,
      variableValues: {
        id: journeyId
      },
      contextValue: {
        db: dbMock
      }
    })
  }

  describe('VideoBlock', () => {
    it('returns VideoBlock with mediaComponentId and languageId', async () => {
      const parentBlockId = uuidv4()
      const video: Block = {
        id: uuidv4(),
        journeyId,
        blockType: 'VideoBlock',
        parentBlockId,
        parentOrder: 1,
        extraAttrs: {
          videoContent: {
            mediaComponentId: '2_0-FallingPlates',
            languageId: '529'
          },
          title: 'title',
          posterBlockId: 'posterBlockId'
        }
      }
      dbMock.block.findMany.mockResolvedValue([video])
      const { data } = await query(gql`
        query ($id: ID!) {
          journey(id: $id) {
            blocks {
              id
              __typename
              parentBlockId
              ... on VideoBlock {
                videoContent {
                  mediaComponentId
                  languageId
                  src
                }
                title
                posterBlockId
              }
            }
          }
        }
      `)
      expect(data?.journey.blocks).toEqual([
        {
          id: video.id,
          __typename: 'VideoBlock',
          parentBlockId,
          videoContent: {
            mediaComponentId: '2_0-FallingPlates',
            languageId: '529',
            src: 'https://arc.gt/hls/2_0-FallingPlates/529'
          },
          title: 'title',
          posterBlockId: 'posterBlockId'
        }
      ])
    })

    it('returns VideoBlock with src', async () => {
      const parentBlockId = uuidv4()
      const video: Block = {
        id: uuidv4(),
        journeyId,
        blockType: 'VideoBlock',
        parentBlockId,
        parentOrder: 1,
        extraAttrs: {
          videoContent: {
            src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8'
          },
          title: 'title',
          posterBlockId: 'posterBlockId'
        }
      }
      dbMock.block.findMany.mockResolvedValue([video])
      const { data } = await query(gql`
        query ($id: ID!) {
          journey(id: $id) {
            blocks {
              id
              __typename
              parentBlockId
              ... on VideoBlock {
                videoContent {
                  src
                }
                title
                posterBlockId
              }
            }
          }
        }
      `)
      expect(data?.journey.blocks).toEqual([
        {
          id: video.id,
          __typename: 'VideoBlock',
          parentBlockId,
          videoContent: {
            src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8'
          },
          title: 'title',
          posterBlockId: 'posterBlockId'
        }
      ])
    })

    it('returns VideoBlock with a starting time', async () => {
      const parentBlockId = uuidv4()
      const video: Block = {
        id: uuidv4(),
        journeyId,
        blockType: 'VideoBlock',
        parentBlockId,
        parentOrder: 1,
        extraAttrs: {
          startAt: 10,
          posterBlockId: 'posterBlockId'
        }
      }
      dbMock.block.findMany.mockResolvedValue([video])
      const { data } = await query(gql`
        query ($id: ID!) {
          journey(id: $id) {
            blocks {
              id
              __typename
              parentBlockId
              ... on VideoBlock {
                startAt
                posterBlockId
              }
            }
          }
        }
      `)
      expect(data?.journey.blocks).toEqual([
        {
          id: video.id,
          __typename: 'VideoBlock',
          parentBlockId,
          startAt: 10,
          posterBlockId: 'posterBlockId'
        }
      ])
    })
  })

  describe('videoResponseCreate', () => {
    it('creates a video block response', async () => {
      const userId = uuidv4()
      const block1: Block = {
        id: uuidv4(),
        journeyId: uuidv4(),
        blockType: 'VideoBlock',
        parentBlockId: null,
        parentOrder: 0,
        extraAttrs: {
          videoContent: {
            mediaComponentId: '2_0-FallingPlates',
            languageId: '529'
          },
          title: 'title'
        }
      }
      dbMock.block.findUnique.mockResolvedValue(block1)
      const response1: Response = {
        id: uuidv4(),
        type: 'VideoResponse',
        blockId: block1.id,
        userId,
        extraAttrs: {
          state: 'PLAYING',
          position: 30
        }
      }
      dbMock.response.create.mockResolvedValue(response1)
      const { data } = await testkit.execute(app, {
        document: gql`
          mutation ($input: VideoResponseCreateInput!) {
            videoResponseCreate(input: $input) {
              id
              userId
              state
              position
              block {
                id
                videoContent {
                  mediaComponentId
                  languageId
                }
                title
              }
            }
          }
        `,
        variableValues: {
          input: {
            id: response1.id,
            blockId: response1.blockId,
            state: get(response1.extraAttrs, 'state'),
            position: get(response1.extraAttrs, 'position')
          }
        },
        contextValue: {
          db: dbMock,
          userId
        }
      })
      expect(data?.videoResponseCreate).toEqual({
        id: response1.id,
        userId,
        state: 'PLAYING',
        position: 30,
        block: {
          id: block1.id,
          videoContent: {
            mediaComponentId: '2_0-FallingPlates',
            languageId: '529'
          },
          title: 'title'
        }
      })
    })

    it('throws authentication error if no user token', async () => {
      const { errors } = await testkit.execute(app, {
        document: gql`
          mutation ($input: VideoResponseCreateInput!) {
            videoResponseCreate(input: $input) {
              id
            }
          }
        `,
        variableValues: {
          input: {
            blockId: uuidv4(),
            state: 'PLAYING'
          }
        },
        contextValue: {
          db: dbMock
        }
      })
      expect(errors?.[0].extensions?.code).toEqual('UNAUTHENTICATED')
    })
  })
})
