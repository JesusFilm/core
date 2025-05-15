import { Message, TextUIPart } from '@ai-sdk/ui-utils'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
import { AnimatedMarkdown } from 'flowtoken'
import { ReactElement } from 'react'

import 'flowtoken/dist/styles.css'

interface TextPartProps {
  message: Message
  part: TextUIPart
}

export function TextPart({ message, part }: TextPartProps): ReactElement {
  return message.role === 'user' ? (
    <Collapse
      appear={true}
      in={true}
      sx={{ alignSelf: 'flex-end', maxWidth: '80%' }}
    >
      <Box
        className="text-part"
        sx={{
          backgroundColor: 'action.selected',
          py: 2,
          px: 3,
          borderRadius: 2,
          my: 2
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
        '& > p': { m: 0 },
        '& span': { display: 'inline !important' }
      }}
    >
      <AnimatedMarkdown content={part.text} />
    </Box>
  )
}
