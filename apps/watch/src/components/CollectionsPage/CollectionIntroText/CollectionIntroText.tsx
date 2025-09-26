/* eslint-disable i18next/no-literal-string */
import { ReactElement } from 'react'

import { EasterDates, EasterDatesProps } from './EasterDates'

type EasterDatesPropsWithoutTitle = Omit<EasterDatesProps, 'title'>

interface CollectionIntroTextProps extends EasterDatesPropsWithoutTitle {
  /** Title of the collection */
  title: string
  /** Subtitle shown under the title */
  subtitle: string
  /** First paragraph with highlighted text */
  firstParagraph: {
    beforeHighlight: string
    highlightedText: string
    afterHighlight: string
  }
  /** Second paragraph */
  secondParagraph: string
  /** Easter dates title */
  easterDatesTitle: string
  /** Third paragraph */
  thirdParagraph: string
}

export function CollectionIntroText({
  title,
  subtitle,
  firstParagraph,
  secondParagraph,
  thirdParagraph,
  // EasterDates props
  easterDatesTitle,
  westernEasterLabel,
  orthodoxEasterLabel,
  passoverLabel,
  locale
}: CollectionIntroTextProps): ReactElement {
  return (
    <div className="padded responsive-container relative block flex w-full flex-col gap-4 pt-8 md:flex-row md:py-8">
      <div className="dates-block order-last w-full flex-1 xl:pb-0 2xl:pr-0">
        <EasterDates
          title={easterDatesTitle}
          westernEasterLabel={westernEasterLabel}
          orthodoxEasterLabel={orthodoxEasterLabel}
          passoverLabel={passoverLabel}
          locale={locale}
        />
      </div>
      <div className="into-text flex-1 space-y-6 pb-8 md:pb-0 xl:pr-20">
        <h2 className="mb-0 text-4xl font-bold">{title}</h2>
        <p className="text-xl opacity-50">{subtitle}</p>
        <p className="text-xl xl:text-2xl">
          {firstParagraph.beforeHighlight}
          <span className="bg-rose-300/20 px-2">
            {firstParagraph.highlightedText}
          </span>
          {firstParagraph.afterHighlight}
        </p>
        <p className="text-xl xl:text-2xl">{secondParagraph}</p>
        <p className="text-xl xl:text-2xl">{thirdParagraph}</p>
      </div>
    </div>
  )
}
