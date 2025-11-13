import { Fragment, ReactElement, ReactNode } from 'react'

import { cn } from '../../libs/cn/cn'

function hasProtocol(word: string): boolean {
  const protocolPattern = /^(http|https):\/\/(.*)/gm
  return word.match(protocolPattern) != null
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
  if (isUrl(word)) {
    const href = hasProtocol(word) ? word : `https://${word}`
    const label = word
      .replace('https://', '')
      .replace('http://', '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-primary underline decoration-primary/60 hover:decoration-primary"
      >
        {label}
      </a>
    )
  }

  if (isEmail(word)) {
    return (
      <a
        href={`mailto:${word}`}
        className="text-primary underline decoration-primary/60 hover:decoration-primary"
      >
        {word}
      </a>
    )
  }

  return word
}

interface TextFormatterProps {
  children: ReactNode
  className?: string
}

export function TextFormatter({
  children,
  className
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
        <p
          key={i}
          className={cn(
            'mb-4 last:mb-0 text-base leading-relaxed text-white/80',
            className
          )}
        >
          {lines.map((words, j) => (
            <span key={j} className="block">
              {words.map((word, k) => (
                <Fragment key={k}>{addMarkup(word)} </Fragment>
              ))}
            </span>
          ))}
        </p>
      ))}
    </>
  )
}
