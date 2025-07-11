import { Message, TextUIPart } from '@ai-sdk/ui-utils'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import Markdown from 'react-markdown'

interface TextPartProps {
  message: Message
  part: TextUIPart
}

export function TextPart({ message, part }: TextPartProps): ReactElement {
  return message.role === 'user' ? (
    <Collapse
      appear={true}
      in={true}
      sx={{
        alignSelf: 'flex-end',
        maxWidth: '80%'
      }}
    >
      <Box
        className="text-part"
        sx={{
          backgroundColor: 'action.selected',
          py: 2,
          px: 3,
          borderRadius: 2,
          my: 4
        }}
      >
        <Typography component="span">{part.text}</Typography>
      </Box>
    </Collapse>
  ) : (
    <Box
      sx={{
        alignSelf: 'flex-start',
        maxWidth: '80%',
        '& > *:first-child': { mt: 0 },
        '& > *:last-child': { mb: 0 }
      }}
    >
      <Markdown>{part.text}</Markdown>
    </Box>
  )
}
