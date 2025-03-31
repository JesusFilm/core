/* eslint-disable i18next/no-literal-string */
import { ReactElement } from 'react'

import { EasterDates } from '../EasterDates/EasterDates'

export function CollectionIntroText(): ReactElement {
  return (
    <div className="block relative flex flex-col gap-4 padded pb-16 responsive-container w-full">
      <div className="w-full dates-block 2xl:pr-0 order-last pb-12 xl:pb-0">
        <EasterDates />
      </div>
      <div className="into-text space-y-6 xl:pr-20">
        <h2 className="text-4xl font-bold mb-0">The real Easter story</h2>
        <p className="text-xl opacity-50">Easter isn't just a celebration</p>
        <p className="text-xl xl:text-2xl">
          The Gospels are{' '}
          <span className="bg-rose-300/20 px-2">shockingly honest</span> about
          the emotions Jesus experienced&mdash;His deep anguish, one of His
          closest friends denying even to know Him, and other
          disciples&mdash;disbelief in His resurrection.
        </p>
        <p className="text-xl xl:text-2xl ">
          If you have doubts or want to rediscover the meaning of Easter explore
          this collection of videos and interactive resources.
        </p>
      </div>
    </div>
  )
}
