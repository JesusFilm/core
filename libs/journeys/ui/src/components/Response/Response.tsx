'use client'

import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import Markdown from 'react-markdown'

interface ResponseProps {
  content: string
}

export function Response({ content }: ResponseProps): ReactElement {
  return (
    <Box sx={{ fontSize: 14, lineHeight: 1.6, color: 'inherit' }}>
      <Markdown>{content}</Markdown>
    </Box>
  )
}
