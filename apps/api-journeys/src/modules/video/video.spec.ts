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
    it('returns VideoBlock', async () => {
      const parentBlockId = uuidv4()
      const video: Block = {
        id: uuidv4(),
        journeyId,
        blockType: 'VideoBlock',
        parentBlockId,
        parentOrder: 1,
        extraAttrs: {
          src: 'src',
          title: 'title'
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
                src
                title
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
          src: 'src',
          title: 'title'
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
          src: 'src',
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
          state: 'PLAYING'
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
              block {
                id
                src
                title
              }
            }
          }
        `,
        variableValues: {
          input: {
            id: response1.id,
            blockId: response1.blockId,
            state: get(response1.extraAttrs, 'state')
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
        block: {
          id: block1.id,
          src: 'src',
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
