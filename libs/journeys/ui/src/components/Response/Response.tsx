'use client'

import { ReactElement } from 'react'
import Markdown from 'react-markdown'

interface ResponseProps {
  content: string
}

export function Response({ content }: ResponseProps): ReactElement {
  return (
    <div style={{ fontSize: 14, lineHeight: 1.6 }}>
      <Markdown>{content}</Markdown>
    </div>
  )
}
