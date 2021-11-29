import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import {
  radioQuestionModule,
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

describe('RadioQuestionModule', () => {
  let app, journeyId
  const publishedAt = new Date()
  const createdAt = new Date()

  beforeEach(() => {
    app = testkit.testModule(radioQuestionModule, {
      schemaBuilder,
      modules: [journeyModule, blockModule, responseModule, actionModule]
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

  describe('RadioOptionBlock', () => {
    it('returns RadioOptionBlock', async () => {
      const radioQuestionId = uuidv4()
      const blockId = uuidv4()
      const radioOption1: Block = {
        id: uuidv4(),
        journeyId,
        blockType: 'RadioOptionBlock',
        parentBlockId: radioQuestionId,
        parentOrder: 3,
        extraAttrs: {
          label: 'label',
          description: 'description',
          action: {
            gtmEventName: 'gtmEventName',
            blockId
          }
        }
      }
      const radioOption2: Block = {
        id: uuidv4(),
        journeyId,
        blockType: 'RadioOptionBlock',
        parentBlockId: radioQuestionId,
        parentOrder: 4,
        extraAttrs: {
          label: 'label',
          description: 'description',
          action: {
            gtmEventName: 'gtmEventName',
            journeyId
          }
        }
      }
      const radioOption3: Block = {
        id: uuidv4(),
        journeyId,
        blockType: 'RadioOptionBlock',
        parentBlockId: radioQuestionId,
        parentOrder: 5,
        extraAttrs: {
          label: 'label',
          description: 'description',
          action: {
            gtmEventName: 'gtmEventName',
            url: 'https://jesusfilm.org'
          }
        }
      }
      const radioOption4: Block = {
        id: uuidv4(),
        journeyId,
        blockType: 'RadioOptionBlock',
        parentBlockId: radioQuestionId,
        parentOrder: 6,
        extraAttrs: {
          label: 'label',
          description: 'description',
          action: {
            gtmEventName: 'gtmEventName'
          }
        }
      }
      dbMock.block.findMany.mockResolvedValue([
        radioOption1,
        radioOption2,
        radioOption3,
        radioOption4
      ])
      const { data } = await query(gql`
        query ($id: ID!) {
          journey(id: $id) {
            blocks {
              id
              __typename
              parentBlockId
              ... on RadioOptionBlock {
                label
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
          id: radioOption1.id,
          __typename: 'RadioOptionBlock',
          parentBlockId: radioQuestionId,
          label: 'label',
          action: {
            __typename: 'NavigateToBlockAction',
            gtmEventName: 'gtmEventName',
            blockId
          }
        },
        {
          id: radioOption2.id,
          __typename: 'RadioOptionBlock',
          parentBlockId: radioQuestionId,
          label: 'label',
          action: {
            __typename: 'NavigateToJourneyAction',
            gtmEventName: 'gtmEventName',
            journeyId
          }
        },
        {
          id: radioOption3.id,
          __typename: 'RadioOptionBlock',
          parentBlockId: radioQuestionId,
          label: 'label',
          action: {
            __typename: 'LinkAction',
            gtmEventName: 'gtmEventName',
            url: 'https://jesusfilm.org',
            target: null
          }
        },
        {
          id: radioOption4.id,
          __typename: 'RadioOptionBlock',
          parentBlockId: radioQuestionId,
          label: 'label',
          action: {
            __typename: 'NavigateAction',
            gtmEventName: 'gtmEventName'
          }
        }
      ])
    })
  })

  describe('RadioQuestionBlock', () => {
    it('returns RadioQuestionBlock', async () => {
      const parentBlockId = uuidv4()
      const radioQuestion: Block = {
        id: uuidv4(),
        journeyId,
        blockType: 'RadioQuestionBlock',
        parentBlockId,
        parentOrder: 2,
        extraAttrs: {
          label: 'label',
          description: 'description'
        }
      }
      dbMock.block.findMany.mockResolvedValue([radioQuestion])
      const { data } = await query(gql`
        query ($id: ID!) {
          journey(id: $id) {
            blocks {
              id
              __typename
              parentBlockId
              ... on RadioQuestionBlock {
                label
                description
              }
            }
          }
        }
      `)
      expect(data?.journey.blocks).toEqual([
        {
          id: radioQuestion.id,
          __typename: 'RadioQuestionBlock',
          parentBlockId,
          label: 'label',
          description: 'description'
        }
      ])
    })
  })

  describe('radioQuestionResponseCreate', () => {
    it('creates a radio question block response', async () => {
      const userId = uuidv4()
      const block1: Block = {
        id: uuidv4(),
        journeyId: uuidv4(),
        blockType: 'RadioQuestionBlock',
        parentBlockId: null,
        parentOrder: 0,
        extraAttrs: {
          label: 'label',
          description: 'description'
        }
      }
      dbMock.block.findUnique.mockResolvedValue(block1)
      const response1: Response = {
        id: uuidv4(),
        type: 'RadioQuestionResponse',
        blockId: block1.id,
        userId,
        extraAttrs: {
          radioOptionBlockId: uuidv4()
        }
      }
      dbMock.response.create.mockResolvedValue(response1)
      const { data } = await testkit.execute(app, {
        document: gql`
          mutation ($input: RadioQuestionResponseCreateInput!) {
            radioQuestionResponseCreate(input: $input) {
              id
              userId
              radioOptionBlockId
              block {
                id
                label
                description
              }
            }
          }
        `,
        variableValues: {
          input: {
            id: response1.id,
            blockId: response1.blockId,
            radioOptionBlockId: get(response1.extraAttrs, 'radioOptionBlockId')
          }
        },
        contextValue: {
          db: dbMock,
          userId
        }
      })
      expect(data?.radioQuestionResponseCreate).toEqual({
        id: response1.id,
        userId,
        radioOptionBlockId: get(response1.extraAttrs, 'radioOptionBlockId'),
        block: {
          id: block1.id,
          label: 'label',
          description: 'description'
        }
      })
    })

    it('throws authentication error if no user token', async () => {
      const { errors } = await testkit.execute(app, {
        document: gql`
          mutation ($input: RadioQuestionResponseCreateInput!) {
            radioQuestionResponseCreate(input: $input) {
              id
            }
          }
        `,
        variableValues: {
          input: {
            blockId: uuidv4(),
            radioOptionBlockId: uuidv4()
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
