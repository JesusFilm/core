import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import module from '.'
import prismaMock from '../../lib/mockDb'
import Journey from '../journey'
import { v4 as uuidv4 } from 'uuid'

it('returns blocks', async () => {
  const app = testkit.testModule(module, {
    schemaBuilder,
    modules: [Journey]
  })
  const journeyId = uuidv4()
  const otherJourneyId = uuidv4()
  prismaMock.journey.findUnique.mockResolvedValue({ id: journeyId })

  const block1 = { id: uuidv4(), journeyId: journeyId, blockType: 'StepBlock' }
  const block2 = {
    id: uuidv4(),
    journeyId: journeyId,
    blockType: 'RadioQuestionBlock',
    parentBlockId: block1.id,
    extraAttrs: {
      label: 'label',
      description: 'description'
    }
  }
  const block3 = {
    id: uuidv4(),
    journeyId: journeyId,
    blockType: 'RadioOptionBlock',
    parentBlockId: block2.id,
    extraAttrs: {
      label: 'label',
      description: 'description',
      action: {
        gtmEventName: 'gtmEventName',
        blockId: block1.id
      }
    }
  }
  const block4 = {
    id: uuidv4(),
    journeyId: journeyId,
    blockType: 'RadioOptionBlock',
    parentBlockId: block2.id,
    extraAttrs: {
      label: 'label',
      description: 'description',
      action: {
        gtmEventName: 'gtmEventName',
        journeyId: otherJourneyId
      }
    }
  }
  const block5 = {
    id: uuidv4(),
    journeyId: journeyId,
    blockType: 'RadioOptionBlock',
    parentBlockId: block2.id,
    extraAttrs: {
      label: 'label',
      description: 'description',
      action: {
        gtmEventName: 'gtmEventName',
        url: 'https://jesusfilm.org'
      }
    }
  }
  const block6 = {
    id: uuidv4(),
    journeyId: journeyId,
    blockType: 'VideoBlock',
    parentBlockId: block1.id,
    extraAttrs: {
      src: 'src',
      title: 'title',
      provider: 'YOUTUBE'
    }
  }
  const blocks = [block1, block2, block3, block4, block5, block6]
  prismaMock.block.findMany.mockResolvedValue(blocks)

  const { data } = await testkit.execute(app, {
    document: gql`
      query ($id: ID!) {
        journey(id: $id) {
          blocks {
            id
            __typename
            parentBlockId
            ... on VideoBlock {
              src
              title
              provider
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
                ... on NavigateAction {
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
      db: prismaMock
    }
  })
  expect(data?.journey.blocks).toEqual([
    {
      id: block1.id,
      __typename: 'StepBlock',
      parentBlockId: null
    },
    {
      id: block2.id,
      __typename: 'RadioQuestionBlock',
      parentBlockId: block1.id,
      label: 'label',
      description: 'description',
      variant: null
    },
    {
      id: block3.id,
      __typename: 'RadioOptionBlock',
      parentBlockId: block2.id,
      label: 'label',
      action: {
        __typename: 'NavigateAction',
        gtmEventName: 'gtmEventName',
        blockId: block1.id
      }
    },
    {
      id: block4.id,
      __typename: 'RadioOptionBlock',
      parentBlockId: block2.id,
      label: 'label',
      action: {
        __typename: 'NavigateToJourneyAction',
        gtmEventName: 'gtmEventName',
        journeyId: otherJourneyId
      }
    },
    {
      id: block5.id,
      __typename: 'RadioOptionBlock',
      parentBlockId: block2.id,
      label: 'label',
      action: {
        __typename: 'LinkAction',
        gtmEventName: 'gtmEventName',
        url: 'https://jesusfilm.org'
      }
    },
    {
      id: block6.id,
      __typename: 'VideoBlock',
      parentBlockId: block1.id,
      src: 'src',
      title: 'title',
      provider: 'YOUTUBE'
    }
  ])
})
