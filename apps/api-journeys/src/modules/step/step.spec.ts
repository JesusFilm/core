import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { v4 as uuidv4 } from 'uuid'
import { DocumentNode, ExecutionResult } from 'graphql'
import { journeyModule, blockModule, stepModule } from '..'
import dbMock from '../../../tests/dbMock'
import { Block, ThemeName, ThemeMode } from '.prisma/api-journeys-client'

describe('CardModule', () => {
  let app, journeyId
  const publishedAt = new Date()
  const createdAt = new Date()

  beforeEach(() => {
    app = testkit.testModule(stepModule, {
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

  describe('StepBlock', () => {
    it('returns StepBlock', async () => {
      const parentBlockId = uuidv4()
      const nextBlockId = uuidv4()
      const step: Block = {
        id: uuidv4(),
        journeyId,
        blockType: 'StepBlock',
        parentBlockId,
        parentOrder: 0,
        extraAttrs: {
          locked: true,
          nextBlockId
        }
      }
      dbMock.block.findMany.mockResolvedValue([step])
      const { data } = await query(gql`
        query ($id: ID!) {
          journey(id: $id) {
            blocks {
              id
              __typename
              parentBlockId
              ... on StepBlock {
                locked
                nextBlockId
              }
            }
          }
        }
      `)
      expect(data?.journey.blocks).toEqual([
        {
          id: step.id,
          __typename: 'StepBlock',
          parentBlockId,
          locked: true,
          nextBlockId
        }
      ])
    })
  })
})
