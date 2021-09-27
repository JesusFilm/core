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
    published: true,
    locale: 'en-US',
    themeName: 'light'
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
  const typography1: Block = {
    id: uuidv4(),
    journeyId,
    blockType: 'TypographyBlock',
    parentBlockId: step1.id,
    parentOrder: 7,
    extraAttrs: {
      content: 'text',
      variant: 'h2',
      color: 'primary',
      align: 'left'
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
  const signup1: Block = {
    id: uuidv4(),
    journeyId,
    blockType: 'SignupBlock',
    parentBlockId: step2.id,
    parentOrder: 2,
    extraAttrs: {
      action: {
        gtmEventName: 'gtmEventName',
        journeyId: otherJourneyId
      }
    }
  }
  const button1: Block = {
    id: uuidv4(),
    journeyId,
    blockType: 'ButtonBlock',
    parentBlockId: step2.id,
    parentOrder: 1,
    extraAttrs: {
      label: 'label',
      variant: 'contained',
      color: 'primary',
      size: 'large',
      startIcon: {
        name: 'ArrowForward',
        color: 'secondary',
        size: 'lg'
      },
      endIcon: {
        name: 'LockOpen',
        color: 'action',
        size: 'xl'
      },
      action: {
        gtmEventName: 'gtmEventName',
        url: 'https://jesusfilm.org',
        target: 'target'
      }
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
    typography1,
    step2,
    signup1,
    button1
  ]
  dbMock.block.findMany.mockResolvedValue(blocks)
  const { data } = await testkit.execute(app, {
    document: gql`
      fragment ActionFields on Action {
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
      query ($id: ID!) {
        journey(id: $id) {
          blocks {
            id
            __typename
            parentBlockId
            ... on ButtonBlock {
              label
              variant
              color
              size
              startIcon {
                name
                color
                size
              }
              endIcon {
                name
                color
                size
              }
              action {
                ...ActionFields
              }
            }
            ... on RadioOptionBlock {
              label
              action {
                ...ActionFields
              }
            }
            ... on RadioQuestionBlock {
              label
              description
              variant
            }
            ... on SignupBlock {
              action {
                ...ActionFields
              }
            }
            ... on StepBlock {
              locked
              nextBlockId
            }
            ... on TypographyBlock {
              content
              variant
              color
              align
            }
            ... on VideoBlock {
              src
              title
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
        url: 'https://jesusfilm.org',
        target: null
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
      id: typography1.id,
      __typename: 'TypographyBlock',
      parentBlockId: step1.id,
      content: 'text',
      variant: 'h2',
      color: 'primary',
      align: 'left'
    },
    {
      id: step2.id,
      __typename: 'StepBlock',
      parentBlockId: null,
      locked: false,
      nextBlockId: null
    },
    {
      id: signup1.id,
      __typename: 'SignupBlock',
      parentBlockId: step2.id,
      action: {
        __typename: 'NavigateToJourneyAction',
        gtmEventName: 'gtmEventName',
        journeyId: otherJourneyId
      }
    },
    {
      id: button1.id,
      __typename: 'ButtonBlock',
      parentBlockId: step2.id,
      label: 'label',
      variant: 'contained',
      color: 'primary',
      size: 'large',
      startIcon: {
        name: 'ArrowForward',
        color: 'secondary',
        size: 'lg'
      },
      endIcon: {
        name: 'LockOpen',
        color: 'action',
        size: 'xl'
      },
      action: {
        __typename: 'LinkAction',
        gtmEventName: 'gtmEventName',
        url: 'https://jesusfilm.org',
        target: 'target'
      }
    }
  ])
})
