import Image from 'next/image'
import { ReactElement, ReactNode } from 'react'

interface BibleQuoteProps {
  /**
   * URL of the background image
   */
  imageUrl: string
  /**
   * Background color for the quote container
   */
  bgColor?: string
  /**
   * Content to be rendered inside the quote
   */
  children: ReactNode
}

export function BibleQuote({
  imageUrl,
  bgColor = '#1A1815',
  children
}: BibleQuoteProps): ReactElement {
  return (
    <div
      className="beveled relative flex h-[400px] w-full flex-col justify-end overflow-hidden rounded-lg shadow-2xl shadow-stone-950/70"
      style={{ backgroundColor: bgColor }}
    >
      <Image
        height={400}
        width={400}
        src={imageUrl}
        alt="Bible quote"
        className="absolute top-0 h-[260px] w-full overflow-hidden [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,transparent_100%)] [mask-size:cover] object-cover"
      />
      <div className="z-1 p-8">{children}</div>
    </div>
  )
}
