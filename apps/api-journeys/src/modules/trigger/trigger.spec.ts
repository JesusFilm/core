import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { triggerModule, journeyModule, blockModule, actionModule } from '..'
import dbMock from '../../../tests/dbMock'
import { v4 as uuidv4 } from 'uuid'
import { Block, ThemeName, ThemeMode } from '.prisma/api-journeys-client'
import { DocumentNode, ExecutionResult } from 'graphql'

describe('TriggerModule', () => {
  let app, journeyId

  beforeEach(() => {
    app = testkit.testModule(triggerModule, {
      schemaBuilder,
      modules: [journeyModule, blockModule, actionModule]
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

  describe('TriggerBlock', () => {
    it('return TriggerBlock', async () => {
      const parentBlockId = uuidv4()
      const trigger: Block = {
        id: uuidv4(),
        journeyId,
        blockType: 'TriggerBlock',
        parentBlockId,
        parentOrder: 0,
        extraAttrs: {
          triggerStart: 5,
          action: {
            gtmEventName: 'gtmEventName',
            journeyId
          }
        }
      }
      dbMock.block.findMany.mockResolvedValue([trigger])
      const { data } = await query(gql`
        query ($id: ID!) {
          journey(id: $id) {
            blocks {
              id
              __typename
              parentBlockId
              ... on TriggerBlock {
                action
                id
                parentBlockId
                triggerStart
                action {
                  __typename
                  gtmEventName
                  ... on NavigateToBlockAction {
                    blockId
                  }
                  ... on NavigateToJourneyAction {
                    journeyId
                  }
                  ... on LinkAction {
                    url
                    target
                  }
                }
              }
            }
          }
        }
      `)
      expect(data?.journey.blocks).toEqual([
        {
          id: trigger.id,
          __typename: 'TriggerBlock',
          parentBlockId,
          triggerStart: 5,
          action: {
            __typename: 'NavigateToJourneyAction',
            gtmEventName: 'gtmEventName',
            journeyId
          }
        }
      ])
    })
  })
})
