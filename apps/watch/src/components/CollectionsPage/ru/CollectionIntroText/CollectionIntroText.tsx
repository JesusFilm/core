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
        <h2 className="text-4xl font-bold mb-0">Настоящая история Пасхи</h2>
        <p className="text-xl opacity-50">Пасха - это не просто праздник</p>
        <p className="text-xl xl:text-2xl">
          Евангелия{' '}
          <span className="bg-rose-300/20 px-2">потрясающе честны</span> в
          описании эмоций, которые испытывал Иисус&mdash;Его глубокая тоска,
          один из Его ближайших друзей, отрицающий даже знакомство с Ним, и
          другие ученики&mdash;неверие в Его воскресение.
        </p>
        <p className="text-xl xl:text-2xl ">
          Если у вас есть сомнения или вы хотите заново открыть для себя смысл
          Пасхи, изучите эту коллекцию видео и интерактивных материалов.
        </p>
      </div>
    </div>
  )
}
