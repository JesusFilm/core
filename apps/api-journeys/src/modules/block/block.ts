import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { BlockModule } from './__generated__/types'
import { transformBlock } from '.'

const typeDefs = gql`
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

  extend type Journey {
    blocks: [Block!]
  }
`

const resolvers: BlockModule.Resolvers = {
  Journey: {
    async blocks(journey, __, { db }) {
      const blocks = await db.block.findMany({
        where: { journeyId: journey.id },
        orderBy: [{ parentOrder: 'asc' }]
      })
      return blocks.map(transformBlock)
    }
  }
}

export const blockModule = createModule({
  id: 'block',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
