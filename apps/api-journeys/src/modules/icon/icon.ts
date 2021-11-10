import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'

const typeDefs = gql`
  """
  IconName is equivalent to the icons found in @mui/icons-material
  """
  enum IconName {
    PlayArrowRounded
    TranslateRounded
    CheckCircleRounded
    RadioButtonUncheckedRounded
    FormatQuoteRounded
    LockOpenRounded
    ArrowForwardRounded
    ChatBubbleOutlineRounded
    LiveTvRounded
    MenuBookRounded
    ChevronRightRounded
    BeenhereRounded
    SendRounded
    SubscriptionsRounded
    ContactSupportRounded
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
