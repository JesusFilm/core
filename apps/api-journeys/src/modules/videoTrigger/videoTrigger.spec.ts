import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { v4 as uuidv4 } from 'uuid'
import { DocumentNode, ExecutionResult } from 'graphql'
import {
  videoTriggerModule,
  journeyModule,
  blockModule,
  actionModule
} from '..'
import dbMock from '../../../tests/dbMock'
import { Block, ThemeName, ThemeMode } from '.prisma/api-journeys-client'

describe('VideoTriggerModule', () => {
  let app, journeyId
  const publishedAt = new Date()
  const createdAt = new Date()

  beforeEach(() => {
    app = testkit.testModule(videoTriggerModule, {
      schemaBuilder,
      modules: [journeyModule, blockModule, actionModule]
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

  describe('VideoTriggerBlock', () => {
    it('return VideoTriggerBlock', async () => {
      const parentBlockId = uuidv4()
      const trigger: Block = {
        id: uuidv4(),
        journeyId,
        blockType: 'VideoTriggerBlock',
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
              ... on VideoTriggerBlock {
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
          __typename: 'VideoTriggerBlock',
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
