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
    <div className="block relative flex flex-col md:flex-row gap-4 padded pt-8 md:py-8 responsive-container w-full">
      <div className="w-full flex-1 dates-block 2xl:pr-0 order-last xl:pb-0">
        <EasterDates
          title={easterDatesTitle}
          westernEasterLabel={westernEasterLabel}
          orthodoxEasterLabel={orthodoxEasterLabel}
          passoverLabel={passoverLabel}
          locale={locale}
        />
      </div>
      <div className="into-text space-y-6 xl:pr-20 flex-1 pb-8 md:pb-0">
        <h2 className="text-4xl font-bold mb-0">{title}</h2>
        <p className="text-xl opacity-50">{subtitle}</p>
        <p className="text-xl xl:text-2xl">
          {firstParagraph.beforeHighlight}
          <span className="bg-rose-300/20 px-2">
            {firstParagraph.highlightedText}
          </span>
          {firstParagraph.afterHighlight}
        </p>
        <p className="text-xl xl:text-2xl ">{secondParagraph}</p>
        <p className="text-xl xl:text-2xl ">{thirdParagraph}</p>
      </div>
    </div>
  )
}
