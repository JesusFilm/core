import { ReactElement } from 'react'

import { VideoLabel } from '../../../__generated__/globalTypes'
import { getLabelDetails } from '../../libs/utils/getLabelDetails/getLabelDetails'

interface VideoDescriptionProps {
  title: string
  description: string
  label: VideoLabel
}

export const VideoDescription = ({
  title,
  description,
  label
}: VideoDescriptionProps): ReactElement => {
  const { label: labelText } = getLabelDetails(label)

  return (
    <div className="xl:w-3/5 padded 2xl:pr-2xl">
      <div className="title-block pt-2 2xl:pt-4">
        <p className="text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-red-100/70 xl:mb-1">
          {labelText}
        </p>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl xl:text-3xl 2xl:text-4xl font-bold mb-0">
            {title}
          </h2>
        </div>
      </div>

      <div className="description-block">
        <p className="text-lg xl:text-xl mt-2 leading-relaxed text-stone-200/80">
          <span className="font-bold text-white">
            {description.split(' ').slice(0, 3).join(' ')}
          </span>
          {description.slice(
            description.split(' ').slice(0, 3).join(' ').length
          )}
        </p>
      </div>
    </div>
  )
}
