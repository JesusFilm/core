import { Message, TextUIPart } from '@ai-sdk/ui-utils'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import Markdown from 'react-markdown'

interface TextPartProps {
  message: Message
  part: TextUIPart
}

export function TextPart({ message, part }: TextPartProps): ReactElement {
  return message.role === 'user' ? (
    <Typography>{part.text}</Typography>
  ) : (
    <Markdown>{part.text}</Markdown>
  )
}
