import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { gridModule, journeyModule, blockModule } from '..'
import dbMock from '../../../tests/dbMock'
import { v4 as uuidv4 } from 'uuid'
import { Block, ThemeName, ThemeMode } from '.prisma/api-journeys-client'
import { DocumentNode, ExecutionResult } from 'graphql'

describe('GridModule', () => {
  let app, journeyId

  beforeEach(() => {
    app = testkit.testModule(gridModule, {
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
      themeName: ThemeName.base
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

  describe('GridBlock', () => {
    it('returns GridBlock', async () => {
      const parentBlockId = uuidv4()
      const grid: Block = {
        id: uuidv4(),
        journeyId,
        blockType: 'GridBlock',
        parentBlockId,
        parentOrder: 2,
        extraAttrs: {
          container: {
            spacing: '_3'
          }
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
              ... on GridBlock {
                container: {
                  spacing: '_3'
                }
              }
            }
          }
        }
      `)
      expect(data?.journey.blocks).toEqual([
        {
          id: grid.id,
          __typename: 'GridBlock',
          parentBlockId
        }
      ])
    })
  })
})
