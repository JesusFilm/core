import { ReactElement } from 'react'

interface CollectionVideoContentDescriptionProps {
  subtitle: string
  title: string
  description: string
}

export const CollectionVideoContentDescription = ({
  subtitle,
  title,
  description
}: CollectionVideoContentDescriptionProps): ReactElement => {
  return (
    <div className="padded 2xl:pr-2xl xl:w-3/5">
      <div className="title-block pt-2 2xl:pt-4">
        <p className="text-sm font-semibold tracking-wider text-red-100/70 uppercase xl:mb-1 xl:text-base 2xl:text-lg">
          {subtitle}
        </p>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="mb-0 text-2xl font-bold xl:text-3xl 2xl:text-4xl">
            {title}
          </h2>
        </div>
      </div>

      <div className="description-block">
        <p className="mt-2 text-lg leading-relaxed text-stone-200/80 xl:text-xl">
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
