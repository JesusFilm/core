'use client'

import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import Markdown from 'react-markdown'

interface ResponseProps {
  content: string
}

export function Response({ content }: ResponseProps): ReactElement {
  return (
    <Box
      sx={{
        fontSize: 14,
        lineHeight: 1.6,
        color: 'inherit',
        // Markdown element styling for the chat surface. Keep visual
        // weight low — these snippets sit inline next to plain prose,
        // so default browser styles (chunky <hr>, large heading
        // sizes, blue links) read as out-of-place.
        '& p': {
          margin: 0,
          marginBottom: '8px',
          '&:last-child': { marginBottom: 0 }
        },
        '& hr': {
          border: 'none',
          margin: '14px 0',
          height: 0
        },
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          fontSize: 14,
          fontWeight: 600,
          margin: '12px 0 4px',
          lineHeight: 1.4,
          '&:first-of-type': { marginTop: 0 }
        },
        '& ul, & ol': {
          margin: '4px 0 8px',
          paddingLeft: '20px'
        },
        '& li': {
          marginBottom: '2px',
          '& > p': { marginBottom: '2px' }
        },
        '& strong': { fontWeight: 600 },
        '& em': { fontStyle: 'italic' },
        '& a': {
          color: 'inherit',
          textDecoration: 'underline',
          textDecorationColor: 'rgba(38,38,46,0.35)',
          textUnderlineOffset: '2px'
        },
        '& code': {
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: '0.92em',
          padding: '1px 5px',
          borderRadius: 4,
          background: 'rgba(38,38,46,0.06)'
        },
        '& pre': {
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: '0.92em',
          padding: '10px 12px',
          borderRadius: 8,
          background: 'rgba(38,38,46,0.06)',
          overflowX: 'auto',
          margin: '8px 0',
          '& code': {
            padding: 0,
            background: 'transparent'
          }
        },
        '& blockquote': {
          margin: '8px 0',
          paddingLeft: '12px',
          borderLeft: '3px solid rgba(38,38,46,0.15)',
          color: 'inherit',
          opacity: 0.85
        }
      }}
    >
      <Markdown>{content}</Markdown>
    </Box>
  )
}
