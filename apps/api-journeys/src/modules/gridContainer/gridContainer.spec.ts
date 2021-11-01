import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { gridContainerModule, journeyModule, blockModule } from '..'
import dbMock from '../../../tests/dbMock'
import { v4 as uuidv4 } from 'uuid'
import { Block, ThemeName, ThemeMode } from '.prisma/api-journeys-client'
import { DocumentNode, ExecutionResult } from 'graphql'

describe('GridContainerModule', () => {
  let app, journeyId

  beforeEach(() => {
    app = testkit.testModule(gridContainerModule, {
      schemaBuilder,
      modules: [journeyModule, blockModule]
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
      primaryImageBlockId: null
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

  describe('GridContainerBlock', () => {
    it('returns GridContainerBlock', async () => {
      const parentBlockId = uuidv4()
      const grid: Block = {
        id: uuidv4(),
        journeyId,
        blockType: 'GridContainerBlock',
        parentBlockId,
        parentOrder: 2,
        extraAttrs: {
          spacing: 3,
          direction: 'row',
          justifyContent: 'flexStart',
          alignItems: 'center'
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
              ... on GridContainerBlock {
                spacing
                direction
                justifyContent
                alignItems
              }
            }
          }
        }
      `)
      expect(data?.journey.blocks).toEqual([
        {
          id: grid.id,
          __typename: 'GridContainerBlock',
          parentBlockId,
          alignItems: 'center',
          direction: 'row',
          justifyContent: 'flexStart',
          spacing: 3
        }
      ])
    })
  })
})
