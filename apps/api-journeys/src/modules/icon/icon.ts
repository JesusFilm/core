import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'

const typeDefs = gql`
  """
  IconName is equivalent to the icons found in @mui/icons-material
  """
  enum IconName {
    playArrow
    translate
    checkCircle
    radioButtonUnchecked
    formatQuote
    lockOpen
    arrowForward
    chatBubbleOutline
    liveTv
    menuBook
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
`

export const iconModule = createModule({
  id: 'icon',
  dirname: __dirname,
  typeDefs: [typeDefs]
})
