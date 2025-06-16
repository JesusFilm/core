import { ReactElement } from 'react'

import { VideoLabel } from '../../../../__generated__/globalTypes'
import { getLabelDetails } from '../../../libs/utils/getLabelDetails/getLabelDetails'

interface ContentMetadataProps {
  title: string
  description: string
  label: VideoLabel
}

export function ContentMetadata({
  title,
  description,
  label
}: ContentMetadataProps): ReactElement {
  const { label: labelText, color } = getLabelDetails(label)

  return (
    <div data-testid="ContentMetadata" className="z-10 relative">
      <div className="flex flex-col gap-3">
        <span
          className="text-sm font-bold leading-tight tracking-[0.14em] uppercase"
          style={{ color }}
        >
          {labelText}
        </span>
        <h2 className="text-2xl xl:text-3xl 2xl:text-4xl font-bold mb-0">
          {title}
        </h2>
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
