import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import LinkExternal from '@core/shared/ui/icons/LinkExternal'

import { VideoLabel } from '../../../../__generated__/globalTypes'
import { getLabelDetails } from '../../libs/utils/getLabelDetails/getLabelDetails'

interface CollectionMetadataProps {
  title: string
  description: string
  snippet?: string
  label: VideoLabel
  childCount: number
  onShare: () => void
}

export function CollectionMetadata({
  title,
  description,
  snippet,
  label,
  childCount,
  onShare
}: CollectionMetadataProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { label: labelText, childCountLabel } = getLabelDetails(
    t,
    label,
    childCount
  )

  return (
    <div className="relative z-10 space-y-4" data-testid="CollectionMetadata">
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold tracking-wider text-red-100/70 uppercase">
            {labelText}
            {childCountLabel != null
              ? ` • ${childCountLabel.toLowerCase()}`
              : null}
          </p>
          <h2 className="text-2xl xl:text-4xl font-bold">{title}</h2>
        </div>
        {snippet != null && snippet !== '' && (
          <p className="text-xs uppercase tracking-widest text-red-100/80">
            {snippet}
          </p>
        )}
        <p className="text-lg xl:text-xl leading-relaxed text-stone-200/80">
          {description}
        </p>
      </div>
      <button
        onClick={onShare}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-gray-900 font-bold uppercase tracking-wider bg-white hover:bg-[#cb333b] hover:text-white transition-colors duration-200 text-sm cursor-pointer"
      >
        <LinkExternal className="w-4 h-4" />
        {t('Share')}
      </button>
    </div>
  )
}
