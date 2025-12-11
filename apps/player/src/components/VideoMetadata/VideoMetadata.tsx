'use client'

import { ReactElement } from 'react'

import { StudyQuestions } from '@/components/StudyQuestions'

interface Description {
  value: string
  primary: boolean
}

interface StudyQuestion {
  value: string
  primary: boolean
}

interface VideoMetadataProps {
  title: string
  description: Description[]
  studyQuestions: StudyQuestion[]
}

const URL_REGEX =
  /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/g

function renderTextWithLinks(text: string): ReactElement[] {
  const parts: ReactElement[] = []
  let lastIndex = 0
  let matchIndex = 0

  const matches = Array.from(text.matchAll(URL_REGEX))

  if (matches.length === 0) {
    return [<span key="text">{text}</span>]
  }

  for (const match of matches) {
    if (match.index == null) {
      continue
    }

    if (lastIndex < match.index) {
      parts.push(
        <span key={`text-${matchIndex}`}>
          {text.slice(lastIndex, match.index)}
        </span>
      )
    }

    const url = match[0]
    const href =
      url.startsWith('http://') || url.startsWith('https://')
        ? url
        : `https://${url}`

    parts.push(
      <a
        key={`link-${matchIndex}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer text-[#cb333b] underline hover:text-[#a4343a]"
      >
        {url}
      </a>
    )

    lastIndex = match.index + url.length
    matchIndex++
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`text-${matchIndex}`}>{text.slice(lastIndex)}</span>)
  }

  return parts
}

export function VideoMetadata({
  title,
  description,
  studyQuestions
}: VideoMetadataProps): ReactElement {
  const descriptionText = description[0]?.value ?? ''

  return (
    <>
      <h1 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h1>
      {descriptionText && (
        <div className="mb-4">
          <div className="text-sm text-gray-700 dark:text-gray-400">
            <p className="whitespace-pre-wrap">
              {renderTextWithLinks(descriptionText)}
            </p>
          </div>
        </div>
      )}
      {studyQuestions.length > 0 && (
        <StudyQuestions questions={studyQuestions} />
      )}
    </>
  )
}
