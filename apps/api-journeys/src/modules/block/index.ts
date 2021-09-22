import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { Prisma } from '.prisma/api-journeys-client'
import {
  LinkAction,
  NavigateToBlockAction,
  NavigateToJourneyAction,
  IconName,
  Resolvers,
  ResolversTypes
} from '../../__generated__/types'

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
    """
    nextBlockId contains the preferred block to navigate to when a
    NavigateAction occurs or if the user manually tries to advance to the next
    step. If no nextBlockId is set it can be assumed that this step represents
    the end of the current journey.
    """
    nextBlockId: ID
    """
    locked will be set to true if the user should not be able to manually
    advance to the next step.
    """
    locked: Boolean!
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

  """
  NavigateAction is an Action that navigates to the nextBlockId field set on the
  closest ancestor StepBlock.
  """
  type NavigateAction implements Action {
    gtmEventName: String
  }

  type NavigateToBlockAction implements Action {
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

  # MaterialUI Icon Type Names:
  enum IconName {
    PlayArrow
    Translate
    CheckCircle
    RadioButtonUnchecked
    FormatQuote
    LockOpen
    ArrowForward
    ChatBubbleOutline
    LiveTv
    MenuBook
  }

  enum IconColor {
    primary
    secondary
    action
    error
    disabled
    inherit
  }

  enum IconSize {
    sm
    md
    lg
    xl
    inherit
  }

  type Icon {
    name: IconName!
    color: IconColor
    size: IconSize
  }

  enum ButtonVariant {
    text
    contained
  }

  enum ButtonColor {
    primary
    secondary
    error
    inherit
  }

  enum ButtonSize {
    small
    medium
    large
  }

  type ButtonBlock implements Block {
    id: ID!
    parentBlockId: ID
    label: String!
    variant: ButtonVariant
    color: ButtonColor
    size: ButtonSize
    startIcon: Icon
    endIcon: Icon
    action: Action
  }
`

const resolvers: Resolvers = {
  Journey: {
    async blocks(journey, __, { db }) {
      const blocks = await db.block.findMany({
        where: { journeyId: journey.id },
        orderBy: [{ parentOrder: 'asc' }]
      })
      return blocks.map(
        (block) =>
          ({
            ...block,
            ...(block.extraAttrs as Prisma.JsonObject),
            __typename: block.blockType
          } as unknown as ResolversTypes['Block'])
      )
    }
  },
  Action: {
    __resolveType(obj) {
      if ((obj as NavigateToBlockAction).blockId != null) {
        return 'NavigateToBlockAction'
      }
      if ((obj as NavigateToJourneyAction).journeyId != null) {
        return 'NavigateToJourneyAction'
      }
      if ((obj as LinkAction).url != null) {
        return 'LinkAction'
      }
      return 'NavigateAction'
    }
  },
  IconName
}

export default createModule({
  id: 'block',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
