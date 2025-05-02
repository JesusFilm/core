import { ReactElement } from 'react'

import { VideoChildFields } from '../../../../../../__generated__/VideoChildFields'

interface ChapterMetadataProps {
  video: VideoChildFields
}

export function ChapterMetadata({ video }: ChapterMetadataProps): ReactElement {
  const title = video?.title[0]?.value ?? ''
  const description = video?.description[0]?.value ?? ''

  return (
    <div data-testid="ChapterMetadata" className="xl:w-3/5 padded 2xl:pr-2xl">
      <div className="title-block pt-2 2xl:pt-4">
        <h2 className="text-2xl xl:text-3xl 2xl:text-4xl font-bold mb-0">
          {title}
        </h2>
      </div>
      <div className="description-block">
        <p className="text-lg xl:text-xl mt-2 leading-relaxed text-stone-200/80">
          <span style={{ fontWeight: 'bold', color: 'white' }}>
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
