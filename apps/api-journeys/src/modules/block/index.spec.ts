import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import module from '.'
import dbMock from '../../../tests/dbMock'
import journey from '../journey'
import { v4 as uuidv4 } from 'uuid'
import { Block, ThemeName, ThemeMode } from '.prisma/api-journeys-client'
import { DocumentNode, ExecutionResult } from 'graphql'

describe('BlockModule', () => {
  let app, journeyId

  beforeEach(() => {
    app = testkit.testModule(module, {
      schemaBuilder,
      modules: [journey]
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

  it('returns ButtonBlock', async () => {
    const parentBlockId = uuidv4()
    const button: Block = {
      id: uuidv4(),
      journeyId,
      blockType: 'ButtonBlock',
      parentBlockId,
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
    dbMock.block.findMany.mockResolvedValue([button])
    const { data } = await query(gql`
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
        id: button.id,
        __typename: 'ButtonBlock',
        parentBlockId,
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

  it('returns CardBlock', async () => {
    const parentBlockId = uuidv4()
    const coverBlockId = uuidv4()
    const card: Block = {
      id: uuidv4(),
      journeyId,
      blockType: 'CardBlock',
      parentBlockId,
      parentOrder: 0,
      extraAttrs: {
        backgroundColor: '#FFF',
        coverBlockId,
        themeMode: ThemeMode.light,
        themeName: ThemeName.base
      }
    }
    dbMock.block.findMany.mockResolvedValue([card])
    const { data } = await query(gql`
      query ($id: ID!) {
        journey(id: $id) {
          blocks {
            id
            __typename
            parentBlockId
            ... on CardBlock {
              backgroundColor
              coverBlockId
              themeMode
              themeName
            }
          }
        }
      }
    `)
    expect(data?.journey.blocks).toEqual([
      {
        id: card.id,
        __typename: 'CardBlock',
        parentBlockId,
        backgroundColor: '#FFF',
        coverBlockId,
        themeMode: ThemeMode.light,
        themeName: ThemeName.base
      }
    ])
  })

  it('returns ImageBlock', async () => {
    const parentBlockId = uuidv4()
    const image: Block = {
      id: uuidv4(),
      journeyId,
      blockType: 'ImageBlock',
      parentBlockId,
      parentOrder: 2,
      extraAttrs: {
        src: 'https://source.unsplash.com/random/1920x1080',
        alt: 'random image from unsplash',
        width: 1920,
        height: 1080
      }
    }
    dbMock.block.findMany.mockResolvedValue([image])
    const { data } = await query(gql`
      query ($id: ID!) {
        journey(id: $id) {
          blocks {
            id
            __typename
            parentBlockId
            ... on ImageBlock {
              src
              alt
              width
              height
            }
          }
        }
      }
    `)
    expect(data?.journey.blocks).toEqual([
      {
        id: image.id,
        __typename: 'ImageBlock',
        parentBlockId,
        src: 'https://source.unsplash.com/random/1920x1080',
        alt: 'random image from unsplash',
        width: 1920,
        height: 1080
      }
    ])
  })

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

  it('returns SignUpBlock', async () => {
    const parentBlockId = uuidv4()
    const signUp: Block = {
      id: uuidv4(),
      journeyId,
      blockType: 'SignUpBlock',
      parentBlockId,
      parentOrder: 2,
      extraAttrs: {
        action: {
          gtmEventName: 'gtmEventName',
          journeyId
        },
        submitIcon: {
          name: 'LockOpen',
          color: 'secondary',
          size: 'lg'
        },
        submitLabel: 'Unlock Now!'
      }
    }
    dbMock.block.findMany.mockResolvedValue([signUp])
    const { data } = await query(gql`
      query ($id: ID!) {
        journey(id: $id) {
          blocks {
            id
            __typename
            parentBlockId
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
            submitIcon {
              name
              color
              size
            }
            submitLabel
          }
        }
      }
    `)
    expect(data?.journey.blocks).toEqual([
      {
        id: signUp.id,
        __typename: 'SignUpBlock',
        parentBlockId,
        action: {
          __typename: 'NavigateToJourneyAction',
          gtmEventName: 'gtmEventName',
          journeyId
        },
        submitIcon: {
          name: 'LockOpen',
          color: 'secondary',
          size: 'lg'
        },
        submitLabel: 'Unlock Now!'
      }
    ])
  })

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

  it('returns TypographyBlock', async () => {
    const parentBlockId = uuidv4()
    const typography: Block = {
      id: uuidv4(),
      journeyId,
      blockType: 'TypographyBlock',
      parentBlockId,
      parentOrder: 7,
      extraAttrs: {
        content: 'text',
        variant: 'h2',
        color: 'primary',
        align: 'left'
      }
    }
    dbMock.block.findMany.mockResolvedValue([typography])
    const { data } = await query(gql`
      query ($id: ID!) {
        journey(id: $id) {
          blocks {
            id
            __typename
            parentBlockId
            ... on TypographyBlock {
              content
              variant
              color
              align
            }
          }
        }
      }
    `)
    expect(data?.journey.blocks).toEqual([
      {
        id: typography.id,
        __typename: 'TypographyBlock',
        parentBlockId,
        content: 'text',
        variant: 'h2',
        color: 'primary',
        align: 'left'
      }
    ])
  })

  it('returns VideoBlock', async () => {
    const parentBlockId = uuidv4()
    const video: Block = {
      id: uuidv4(),
      journeyId,
      blockType: 'VideoBlock',
      parentBlockId,
      parentOrder: 1,
      extraAttrs: {
        src: 'src',
        title: 'title'
      }
    }
    dbMock.block.findMany.mockResolvedValue([video])
    const { data } = await query(gql`
      query ($id: ID!) {
        journey(id: $id) {
          blocks {
            id
            __typename
            parentBlockId
            ... on VideoBlock {
              src
              title
            }
          }
        }
      }
    `)
    expect(data?.journey.blocks).toEqual([
      {
        id: video.id,
        __typename: 'VideoBlock',
        parentBlockId,
        src: 'src',
        title: 'title'
      }
    ])
  })
})
