import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { BlockModule } from './__generated__/types'
import { ActionResolvers } from '../../__generated__/types'
import { Prisma, Block } from '.prisma/api-journeys-client'

const typeDefs = gql`
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

  interface Block {
    id: ID!
    parentBlockId: ID
  }

  """
  IconName is equivalent to the icons found in @mui/icons-material
  """
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

  type CardBlock implements Block {
    id: ID!
    parentBlockId: ID
    """
    backgroundColor should be a HEX color value e.g #FFFFFF for white.
    """
    backgroundColor: String
    """
    coverBlockId is present if a child block should be used as a cover.
    This child block should not be rendered normally, instead it should be used
    as a background. Blocks are often of type ImageBlock or VideoBlock.
    """
    coverBlockId: ID
    """
    themeMode can override journey themeMode. If nothing is set then use
    themeMode from journey
    """
    themeMode: ThemeMode
    """
    themeName can override journey themeName. If nothing is set then use
    themeName from journey
    """
    themeName: ThemeName
  }

  type ImageBlock implements Block {
    id: ID!
    parentBlockId: ID
    src: String!
    width: Int!
    height: Int!
    alt: String!
  }

  type RadioOptionBlock implements Block {
    id: ID!
    parentBlockId: ID
    label: String!
    action: Action
  }

  type RadioQuestionBlock implements Block {
    id: ID!
    parentBlockId: ID
    label: String!
    description: String
  }

  type SignUpBlock implements Block {
    id: ID!
    parentBlockId: ID
    action: Action
    submitIcon: Icon
    submitLabel: String
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

  enum TypographyVariant {
    h1
    h2
    h3
    h4
    h5
    h6
    subtitle1
    subtitle2
    body1
    body2
    caption
    overline
  }

  enum TypographyColor {
    primary
    secondary
    error
  }

  enum TypographyAlign {
    left
    center
    right
  }

  type TypographyBlock implements Block {
    id: ID!
    parentBlockId: ID
    content: String!
    variant: TypographyVariant
    color: TypographyColor
    align: TypographyAlign
  }

  type VideoBlock implements Block {
    id: ID!
    parentBlockId: ID
    src: String!
    title: String!
    description: String
    volume: Int
    autoplay: Boolean
  }

  extend type Journey {
    blocks: [Block!]
  }

  extend type RadioQuestionResponse {
    block: RadioQuestionBlock
  }

  extend type SignUpResponse {
    block: SignUpBlock
  }

  extend type VideoResponse {
    block: VideoBlock
  }
`

type TranformedBlock = Block & {
  __typename: string
}

const transform = (block: Block): TranformedBlock => {
  return {
    ...block,
    ...(block.extraAttrs as Prisma.JsonObject),
    __typename: block.blockType
  }
}

type Resolvers = BlockModule.Resolvers & {
  Action: ActionResolvers
}

const resolvers: Resolvers = {
  Action: {
    __resolveType(action) {
      if ((action as BlockModule.NavigateToBlockAction).blockId != null) {
        return 'NavigateToBlockAction'
      }
      if ((action as BlockModule.NavigateToJourneyAction).journeyId != null) {
        return 'NavigateToJourneyAction'
      }
      if ((action as BlockModule.LinkAction).url != null) {
        return 'LinkAction'
      }
      return 'NavigateAction'
    }
  },
  Journey: {
    async blocks(journey, __, { db }) {
      const blocks = await db.block.findMany({
        where: { journeyId: journey.id },
        orderBy: [{ parentOrder: 'asc' }]
      })
      return blocks.map(transform)
    }
  },
  RadioQuestionResponse: {
    async block(response, __, { db }) {
      const block = await db.block.findUnique({
        where: { id: response.blockId }
      })
      if (block == null) return null
      return transform(block)
    }
  },
  SignUpResponse: {
    async block(response, __, { db }) {
      const block = await db.block.findUnique({
        where: { id: response.blockId }
      })
      if (block == null) return null
      return transform(block)
    }
  },
  VideoResponse: {
    async block(response, __, { db }) {
      const block = await db.block.findUnique({
        where: { id: response.blockId }
      })
      if (block == null) return null
      return transform(block)
    }
  }
}

export default createModule({
  id: 'block',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
