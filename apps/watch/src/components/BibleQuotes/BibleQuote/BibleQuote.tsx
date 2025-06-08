import { ReactElement, ReactNode } from 'react'

interface BibleQuoteProps {
  imageUrl: string
  bgColor: string
  children: ReactNode
}

export function BibleQuote({
  imageUrl,
  bgColor,
  children
}: BibleQuoteProps): ReactElement {
  return (
    <div
      className={`relative rounded-lg p-6 ${bgColor}`}
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}
