import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { ActionResolvers, BlockResolvers } from '../../__generated__/types'
import { BlockModule } from './__generated__/types'

import { get } from 'lodash'

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

  type RadioOptionBlock implements Block {
    id: ID!
    parentBlockId: ID
    label: String!
    action: Action
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

  type SignupBlock implements Block {
    id: ID!
    parentBlockId: ID
    action: Action
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
    block: RadioQuestionBlock!
  }

  extend type SignupResponse {
    block: SignupBlock!
  }

  extend type VideoResponse {
    block: VideoBlock!
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
`

type Resolvers = BlockModule.Resolvers & {
  Action: ActionResolvers
  Block: BlockResolvers
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
  Block: {
    __resolveType: ({ blockType }) => blockType
  },
  Journey: {
    async blocks(journey, __, { db }) {
      return await db.block.findMany({
        where: { journeyId: journey.id },
        orderBy: [{ parentOrder: 'asc' }]
      })
    }
  },
  ButtonBlock: {
    action: ({ extraAttrs }) => get(extraAttrs, 'action'),
    label: ({ extraAttrs }) => get(extraAttrs, 'label'),
    variant: ({ extraAttrs }) => get(extraAttrs, 'variant'),
    color: ({ extraAttrs }) => get(extraAttrs, 'color'),
    size: ({ extraAttrs }) => get(extraAttrs, 'size'),
    startIcon: ({ extraAttrs }) => get(extraAttrs, 'startIcon'),
    endIcon: ({ extraAttrs }) => get(extraAttrs, 'endIcon')
  },
  SignupBlock: {
    action: ({ extraAttrs }) => get(extraAttrs, 'action')
  },
  StepBlock: {
    locked: ({ extraAttrs }) => get(extraAttrs, 'locked'),
    nextBlockId: ({ extraAttrs }) => get(extraAttrs, 'nextBlockId')
  },
  TypographyBlock: {
    content: ({ extraAttrs }) => get(extraAttrs, 'content'),
    variant: ({ extraAttrs }) => get(extraAttrs, 'variant'),
    color: ({ extraAttrs }) => get(extraAttrs, 'color'),
    align: ({ extraAttrs }) => get(extraAttrs, 'align')
  },
  RadioOptionBlock: {
    label: ({ extraAttrs }) => get(extraAttrs, 'label'),
    action: ({ extraAttrs }) => get(extraAttrs, 'action')
  },
  RadioQuestionBlock: {
    label: ({ extraAttrs }) => get(extraAttrs, 'label'),
    description: ({ extraAttrs }) => get(extraAttrs, 'description'),
    variant: ({ extraAttrs }) => get(extraAttrs, 'variant')
  },
  VideoBlock: {
    src: ({ extraAttrs }) => get(extraAttrs, 'src'),
    title: ({ extraAttrs }) => get(extraAttrs, 'title')
  }
}

export default createModule({
  id: 'block',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
