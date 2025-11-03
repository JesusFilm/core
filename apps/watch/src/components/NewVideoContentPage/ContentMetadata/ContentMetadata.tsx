import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import Download2 from '@core/shared/ui/icons/Download2'

import { VideoLabel } from '../../../../__generated__/globalTypes'
import { getLabelDetails } from '../../../libs/utils/getLabelDetails/getLabelDetails'
import { DownloadDialog } from '../../DownloadDialog/DownloadDialog'

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
  const { t } = useTranslation('apps-watch')
  const { label: labelText } = getLabelDetails(t, label)
  const [showDownload, setShowDownload] = useState(false)

  return (
    <>
      <div data-testid="ContentMetadata" className="relative z-10 pt-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col justify-between gap-2 md:flex-row md:gap-0">
            <div>
              <h4 className="text-sm font-semibold tracking-wider text-red-100/70 uppercase xl:text-base 2xl:text-lg">
                {labelText}
              </h4>
              <h1 className="mb-0 text-2xl font-bold xl:text-3xl 2xl:text-4xl">
                {title}
              </h1>
            </div>
            <button
              onClick={() => setShowDownload(true)}
              className="inline-flex max-h-10 cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold tracking-wider text-gray-900 uppercase transition-colors duration-200 hover:bg-[#cb333b] hover:text-white"
            >
              <Download2 className="h-4 w-4" />
              {t('Download')}
            </button>
          </div>
          <p className="mt-2 text-lg leading-relaxed text-stone-200/80 xl:text-xl">
            <span className="font-bold text-white">
              {description.split(' ').slice(0, 3).join(' ')}
            </span>
            {description.slice(
              description.split(' ').slice(0, 3).join(' ').length
            )}
          </p>
        </div>
      </div>
      <DownloadDialog
        open={showDownload}
        onClose={() => setShowDownload(false)}
      />
    </>
  )
}
