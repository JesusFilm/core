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
  const { label: labelText } = getLabelDetails(label)

  return (
    <>
      <div data-testid="ContentMetadata" className="z-10 relative pt-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 md:gap-0 md:flex-row justify-between">
            <div>
              <h4 className="text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-red-100/70">
                {labelText}
              </h4>
              <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-0">
                {title}
              </h1>
            </div>
          </div>
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
    </>
  )
}
