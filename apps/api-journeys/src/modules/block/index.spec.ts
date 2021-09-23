import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import module from '.'
import dbMock from '../../../tests/dbMock'
import Journey from '../journey'
import { v4 as uuidv4 } from 'uuid'
import { Block } from '.prisma/api-journeys-client'

it('returns blocks', async () => {
  const app = testkit.testModule(module, {
    schemaBuilder,
    modules: [Journey]
  })
  const journeyId = uuidv4()
  const otherJourneyId = uuidv4()
  const nextBlockId = uuidv4()
  dbMock.journey.findUnique.mockResolvedValue({
    id: journeyId,
    title: 'published',
    published: true
  })
  const step1: Block = {
    id: uuidv4(),
    journeyId,
    blockType: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    extraAttrs: {
      locked: true,
      nextBlockId
    }
  }
  const video1: Block = {
    id: uuidv4(),
    journeyId,
    blockType: 'VideoBlock',
    parentBlockId: step1.id,
    parentOrder: 1,
    extraAttrs: {
      src: 'src',
      title: 'title'
    }
  }
  const radioQuestion1: Block = {
    id: uuidv4(),
    journeyId,
    blockType: 'RadioQuestionBlock',
    parentBlockId: step1.id,
    parentOrder: 2,
    extraAttrs: {
      label: 'label',
      description: 'description',
      variant: 'DARK'
    }
  }
  const radioOption1: Block = {
    id: uuidv4(),
    journeyId,
    blockType: 'RadioOptionBlock',
    parentBlockId: radioQuestion1.id,
    parentOrder: 3,
    extraAttrs: {
      label: 'label',
      description: 'description',
      action: {
        gtmEventName: 'gtmEventName',
        blockId: step1.id
      }
    }
  }
  const radioOption2: Block = {
    id: uuidv4(),
    journeyId,
    blockType: 'RadioOptionBlock',
    parentBlockId: radioQuestion1.id,
    parentOrder: 4,
    extraAttrs: {
      label: 'label',
      description: 'description',
      action: {
        gtmEventName: 'gtmEventName',
        journeyId: otherJourneyId
      }
    }
  }
  const radioOption3: Block = {
    id: uuidv4(),
    journeyId,
    blockType: 'RadioOptionBlock',
    parentBlockId: radioQuestion1.id,
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
    parentBlockId: radioQuestion1.id,
    parentOrder: 6,
    extraAttrs: {
      label: 'label',
      description: 'description',
      action: {
        gtmEventName: 'gtmEventName'
      }
    }
  }
  const step2: Block = {
    id: nextBlockId,
    journeyId,
    blockType: 'StepBlock',
    parentBlockId: null,
    parentOrder: 7,
    extraAttrs: {
      locked: false
    }
  }
  const blocks = [
    step1,
    video1,
    radioQuestion1,
    radioOption1,
    radioOption2,
    radioOption3,
    radioOption4,
    step2
  ]
  dbMock.block.findMany.mockResolvedValue(blocks)
  const { data } = await testkit.execute(app, {
    document: gql`
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
            ... on VideoBlock {
              src
              title
            }
            ... on RadioQuestionBlock {
              label
              description
              variant
            }
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
                }
              }
            }
          }
        }
      }
    `,
    variableValues: {
      id: journeyId
    },
    contextValue: {
      db: dbMock
    }
  })
  expect(data?.journey.blocks).toEqual([
    {
      id: step1.id,
      __typename: 'StepBlock',
      parentBlockId: null,
      locked: true,
      nextBlockId
    },
    {
      id: video1.id,
      __typename: 'VideoBlock',
      parentBlockId: step1.id,
      src: 'src',
      title: 'title'
    },
    {
      id: radioQuestion1.id,
      __typename: 'RadioQuestionBlock',
      parentBlockId: step1.id,
      label: 'label',
      description: 'description',
      variant: 'DARK'
    },
    {
      id: radioOption1.id,
      __typename: 'RadioOptionBlock',
      parentBlockId: radioQuestion1.id,
      label: 'label',
      action: {
        __typename: 'NavigateToBlockAction',
        gtmEventName: 'gtmEventName',
        blockId: step1.id
      }
    },
    {
      id: radioOption2.id,
      __typename: 'RadioOptionBlock',
      parentBlockId: radioQuestion1.id,
      label: 'label',
      action: {
        __typename: 'NavigateToJourneyAction',
        gtmEventName: 'gtmEventName',
        journeyId: otherJourneyId
      }
    },
    {
      id: radioOption3.id,
      __typename: 'RadioOptionBlock',
      parentBlockId: radioQuestion1.id,
      label: 'label',
      action: {
        __typename: 'LinkAction',
        gtmEventName: 'gtmEventName',
        url: 'https://jesusfilm.org'
      }
    },
    {
      id: radioOption4.id,
      __typename: 'RadioOptionBlock',
      parentBlockId: radioQuestion1.id,
      label: 'label',
      action: {
        __typename: 'NavigateAction',
        gtmEventName: 'gtmEventName'
      }
    },
    {
      id: step2.id,
      __typename: 'StepBlock',
      parentBlockId: null,
      locked: false,
      nextBlockId: null
    }
  ])
})
