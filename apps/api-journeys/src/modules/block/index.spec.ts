import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import module from '.'
import db from '../../lib/db'
import Journey from '../journey'
import { IconName } from './icon-enums'
import { v4 as uuidv4 } from 'uuid'

it('returns blocks', async () => {
  const app = testkit.testModule(module, {
    schemaBuilder,
    modules: [Journey]
  })
  const journey = await db.journey.create({
    data: {
      title: 'published',
      published: true
    }
  })
  const otherJourney = await db.journey.create({
    data: {
      title: 'not "that" journey',
      published: true
    }
  })
  const nextBlockId = uuidv4()
  const block1 = await db.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: true,
        nextBlockId
      }
    }
  })
  const block2 = await db.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioQuestionBlock',
      parentBlockId: block1.id,
      extraAttrs: {
        label: 'label',
        description: 'description'
      }
    }
  })
  const block3 = await db.block.create({
    data: {
      journeyId: journey.id,
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
  })
  const block4 = await db.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: block2.id,
      extraAttrs: {
        label: 'label',
        description: 'description',
        action: {
          gtmEventName: 'gtmEventName',
          journeyId: otherJourney.id
        }
      }
    }
  })
  const block5 = await db.block.create({
    data: {
      journeyId: journey.id,
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
  })
  const block6 = await db.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: block2.id,
      extraAttrs: {
        label: 'label',
        description: 'description',
        action: {
          gtmEventName: 'gtmEventName'
        }
      }
    }
  })
  const block7 = await db.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'VideoBlock',
      parentBlockId: block1.id,
      extraAttrs: {
        src: 'src',
        title: 'title',
        provider: 'YOUTUBE'
      }
    }
  })
  const testButtonBlock = await db.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'ButtonBlock',
      parentBlockId: block1.id,
      extraAttrs: {
        label: 'label',
        variant: 'contained',
        color: 'primary',
        size: 'large',
        startIcon: {
          name: IconName.ArrowForward,
          color: 'secondary',
          fontSize: '36px'
        },
        endIcon: {
          name: IconName.LockOpen,
          color: 'action',
          fontSize: '48px'
        },
        action: {
          gtmEventName: 'gtmEventName',
          url: 'https://jesusfilm.org',
          target: 'target'
        }
      }
    }
  })
  const block9 = await db.block.create({
    data: {
      id: nextBlockId,
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false
      }
    }
  })
  await db.block.create({
    data: {
      journeyId: otherJourney.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false
      }
    }
  })
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
            ... on ButtonBlock {
              label
              variant
              color
              size
              startIcon {
                name
                color
                fontSize
              }
              endIcon {
                name
                color
                fontSize
              }
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
                  target
                }
              }
            }
          }
        }
      }
    `,
    variableValues: {
      id: journey.id
    },
    contextValue: {
      db
    }
  })
  expect(data?.journey.blocks).toEqual([
    {
      id: block1.id,
      __typename: 'StepBlock',
      parentBlockId: null,
      locked: true,
      nextBlockId
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
        __typename: 'NavigateToBlockAction',
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
        journeyId: otherJourney.id
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
      __typename: 'RadioOptionBlock',
      parentBlockId: block2.id,
      label: 'label',
      action: {
        __typename: 'NavigateAction',
        gtmEventName: 'gtmEventName'
      }
    },
    {
      id: block7.id,
      __typename: 'VideoBlock',
      parentBlockId: block1.id,
      src: 'src',
      title: 'title',
      provider: 'YOUTUBE'
    },
    {
      id: testButtonBlock.id,
      __typename: 'ButtonBlock',
      parentBlockId: block1.id,
      label: 'label',
      variant: 'contained',
      color: 'primary',
      size: 'large',
      startIcon: {
        name: 'ArrowForward',
        color: 'secondary',
        fontSize: '36px'
      },
      endIcon: {
        name: 'LockOpen',
        color: 'action',
        fontSize: '48px'
      },
      action: {
        __typename: 'LinkAction',
        gtmEventName: 'gtmEventName',
        url: 'https://jesusfilm.org',
        target: 'target'
      }
    },
    {
      id: block9.id,
      __typename: 'StepBlock',
      parentBlockId: null,
      locked: false,
      nextBlockId: null
    }
  ])
})
