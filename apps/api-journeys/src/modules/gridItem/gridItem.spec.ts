import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { gridItemModule, journeyModule, blockModule } from '..'
import dbMock from '../../../tests/dbMock'
import { v4 as uuidv4 } from 'uuid'
import { Block, ThemeName, ThemeMode } from '.prisma/api-journeys-client'
import { DocumentNode, ExecutionResult } from 'graphql'

describe('GridItemModule', () => {
  let app, journeyId
  const publishedAt = new Date()
  const createdAt = new Date()

  beforeEach(() => {
    app = testkit.testModule(gridItemModule, {
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

  describe('GridItemBlock', () => {
    it('returns GridItemBlock', async () => {
      const parentBlockId = uuidv4()
      const grid: Block = {
        id: uuidv4(),
        journeyId,
        blockType: 'GridItemBlock',
        parentBlockId,
        parentOrder: 2,
        extraAttrs: {
          xl: 6,
          lg: 6,
          sm: 6
        }
      }
      dbMock.block.findMany.mockResolvedValue([grid])
      const { data } = await query(gql`
        query ($id: ID!) {
          journey(id: $id) {
            blocks {
              id
              __typename
              parentBlockId
              ... on GridItemBlock {
                xl
                lg
                sm
              }
            }
          }
        }
      `)
      expect(data?.journey.blocks).toEqual([
        {
          id: grid.id,
          __typename: 'GridItemBlock',
          parentBlockId,
          xl: 6,
          lg: 6,
          sm: 6
        }
      ])
    })
  })
})
