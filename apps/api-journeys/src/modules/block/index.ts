import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { Prisma } from '.prisma/api-journeys-client'
import { Block, NavigateAction, NavigateToJourneyAction, IconName, IconSize, Resolvers } from '../../__generated__/types'

const typeDefs = gql`
  extend type Journey {
    blocks: [Block!]
  }

  interface Block {
    id: ID!
    parentBlockId: ID
  }

  type StepBlock implements Block {
    id: ID!
    parentBlockId: ID
  }

  enum VideoProviderEnum {
    YOUTUBE
    VIMEO
    ARCLIGHT
  }

  type VideoBlock implements Block {
    id: ID!
    parentBlockId: ID
    src: String!
    title: String!
    description: String
    provider: VideoProviderEnum!
  }

  enum RadioQuestionVariant {
    LIGHT
    DARK
  }

  type RadioQuestionBlock implements Block {
    id: ID!
    parentBlockId: ID
    label: String!
    description: String
    variant: RadioQuestionVariant
  }
  
  interface Action {
    gtmEventName: String
  }

  type NavigateAction implements Action {
    gtmEventName: String
    blockId: String!
  }

  type NavigateToJourneyAction implements Action {
    gtmEventName: String
    journeyId: String!
  }

  type LinkAction implements Action {
    gtmEventName: String
    url: String!
    target: String
  }

  type RadioOptionBlock implements Block {
    id: ID!
    parentBlockId: ID
    label: String!
    action: Action
  }

  enum IconName {
    PLAY_ARROW
    TRANSLATE
    CHECK_CIRCLE
    RADIO_BUTTON_UNCHECKED
    FORMAT_QUOTE
    LOCK_OPEN
    ARROW_FORWARD
    CHAT_BUBBLE_ONLINE
    LIVE_TV
    MENU_BOOK
  }

  enum IconColor {
    NORMAL
    DISABLED
  }

  enum IconSize {
    SMALL
    MEDIUM_SMALL
    MEDIUM_LARGE
    LARGE
  }

  type Icon {
    name: IconName!
    color: IconColor
    size: IconSize
  }

  enum ButtonColor {
    PRIMARY
    SECONDARY
  }

  enum ButtonAlignment {
    LEFT
    CENTER
    RIGHT
  }

  enum ButtonSize {
    LARGE
    MEDIUM
    SMALL
  }

  enum ButtonBlockVariant {
    CONTAINED
    OUTLINED
    TEXT
  }

  type ButtonBlock implements Block {
    id: ID!
    parentBlockId: ID
    label: String!
    variant: ButtonBlockVariant
    color: ButtonColor
    size: ButtonSize
    startIcon: Icon
    endIcon: Icon
    action: Action
  }
`

const resolvers: Resolvers = {
  Journey: {
    async blocks (journey, __, { db }) {
      const blocks = await db.block.findMany({
        where: { journeyId: journey.id },
        orderBy: [{ parentOrder: 'asc' }]
      })
      return blocks.map((block) => ({
        ...block,
        ...(block.extraAttrs as Prisma.JsonObject),
        __typename: block.blockType
      })) as Block[]
    }
  },
  Action: {
    __resolveType (obj) {
      if ((obj as NavigateAction).blockId != null) {
        return 'NavigateAction'
      }
      if ((obj as NavigateToJourneyAction).journeyId != null) {
        return 'NavigateToJourneyAction'
      }
      return 'LinkAction'
    }
  },
  IconName,
  IconSize
}

export default createModule({
  id: 'block',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
