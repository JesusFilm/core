import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { cardModule, journeyModule, blockModule } from '..'
import dbMock from '../../../tests/dbMock'
import { v4 as uuidv4 } from 'uuid'
import { Block, ThemeName, ThemeMode } from '.prisma/api-journeys-client'
import { DocumentNode, ExecutionResult } from 'graphql'

describe('CardModule', () => {
  let app, journeyId
  const publishedAt = new Date()
  const createdAt = new Date()

  beforeEach(() => {
    app = testkit.testModule(cardModule, {
      schemaBuilder,
      modules: [journeyModule, blockModule]
    })
    journeyId = uuidv4()
    dbMock.journey.findUnique.mockResolvedValue({
      id: journeyId,
      title: 'published',
      locale: 'en-US',
      themeMode: ThemeMode.light,
      themeName: ThemeName.base,
      description: null,
      primaryImageBlockId: null,
      slug: 'published-slug',
      publishedAt,
      createdAt
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

  describe('CardBlock', () => {
    it('returns CardBlock', async () => {
      const parentBlockId = uuidv4()
      const coverBlockId = uuidv4()
      const card: Block = {
        id: uuidv4(),
        journeyId,
        blockType: 'CardBlock',
        parentBlockId,
        parentOrder: 0,
        extraAttrs: {
          backgroundColor: '#FFF',
          coverBlockId,
          themeMode: ThemeMode.light,
          themeName: ThemeName.base,
          fullscreen: true
        }
      }
      dbMock.block.findMany.mockResolvedValue([card])
      const { data } = await query(gql`
        query ($id: ID!) {
          journey(id: $id) {
            blocks {
              id
              __typename
              parentBlockId
              ... on CardBlock {
                backgroundColor
                coverBlockId
                themeMode
                themeName
                fullscreen
              }
            }
          }
        }
      `)
      expect(data?.journey.blocks).toEqual([
        {
          id: card.id,
          __typename: 'CardBlock',
          parentBlockId,
          backgroundColor: '#FFF',
          coverBlockId,
          themeMode: ThemeMode.light,
          themeName: ThemeName.base,
          fullscreen: true
        }
      ])
    })
  })

  it('returns defaults', async () => {
    const parentBlockId = uuidv4()
    const card: Block = {
      id: uuidv4(),
      journeyId,
      blockType: 'CardBlock',
      parentBlockId,
      parentOrder: 0,
      extraAttrs: {}
    }
    dbMock.block.findMany.mockResolvedValue([card])
    const { data } = await query(gql`
      query ($id: ID!) {
        journey(id: $id) {
          blocks {
            id
            __typename
            parentBlockId
            ... on CardBlock {
              backgroundColor
              coverBlockId
              themeMode
              themeName
              fullscreen
            }
          }
        }
      }
    `)
    expect(data?.journey.blocks).toEqual([
      {
        id: card.id,
        __typename: 'CardBlock',
        parentBlockId,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: null,
        themeName: null,
        fullscreen: false
      }
    ])
  })
})
