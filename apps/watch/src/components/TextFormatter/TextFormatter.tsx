import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { ComponentProps, Fragment, ReactElement, ReactNode } from 'react'

function hasHttp(word: string): boolean {
  const httpPattern = /^https?:\/\/(.*)/gm
  return word.match(httpPattern) != null
}

function isUrl(word: string): boolean {
  const urlPattern =
    /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm
  return word.match(urlPattern) != null
}

function isEmail(word: string): boolean {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/gm
  return word.match(emailPattern) != null
}

function addMarkup(word: string): ReactElement | string {
  return isUrl(word) ? (
    <Link href={hasHttp(word) ? word : `https://${word}`} target="_blank">
      {word
        .replace('https://', '')
        .replace('http://', '')
        .replace(/^www./, '')
        .replace(/\/$/, '')}
    </Link>
  ) : isEmail(word) ? (
    <Link href={`mailto:${word}`} target="_blank">
      {word}
    </Link>
  ) : (
    word
  )
}

interface TextFormatterProps {
  children: ReactNode
  slotProps?: {
    typography?: ComponentProps<typeof Typography>
  }
}

export function TextFormatter({
  children,
  slotProps
}: TextFormatterProps): ReactElement {
  if (typeof children !== 'string') {
    return <>{children}</>
  }

  const paragraphs = children
    .replace(/&#13;/g, '\n')
    .split('\n\n')
    .map((paragraph) => paragraph.split('\n').map((line) => line.split(' ')))

  return (
    <>
      {paragraphs.map((lines, i) => (
        <Typography key={i} {...slotProps?.typography}>
          {lines.map((words, j) => (
            <Fragment key={j}>
              {words.map((word, k) => (
                <Fragment key={k}>{addMarkup(word)} </Fragment>
              ))}
              <br />
            </Fragment>
          ))}
        </Typography>
      ))}
    </>
  )
}
