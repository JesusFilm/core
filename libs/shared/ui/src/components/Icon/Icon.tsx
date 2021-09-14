import { ReactElement } from 'react'
import { CheckCircle, PlayArrow, Translate, RadioButtonUnchecked, FormatQuote, LockOpen, ArrowForward, ChatBubbleOutline, LiveTv, MenuBook } from '@mui/icons-material'

export interface IconProps {
  ariaHidden?: boolean
  icon: string | undefined
}

export function Icon (props: IconProps): ReactElement | null {
  switch (props.icon) {
    case 'checkCircle':
      return <CheckCircle />
    case 'playArrow':
      return <PlayArrow />
    case 'translate':
      return <Translate />
    case 'radioButtonUnchecked':
      return <RadioButtonUnchecked />
    case 'formatQuote':
      return <FormatQuote />
    case 'lockOpen':
      return <LockOpen />
    case 'arrowForward':
      return <ArrowForward />
    case 'chatBubbleOutline':
      return <ChatBubbleOutline />
    case 'liveTv':
      return <LiveTv />
    case 'menuBook':
      return <MenuBook />
    default:
      return null
  }
}
