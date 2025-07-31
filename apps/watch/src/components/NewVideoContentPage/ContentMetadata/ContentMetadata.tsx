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
  const { label: labelText } = getLabelDetails(label)
  const { t } = useTranslation('apps-watch')
  const [showDownload, setShowDownload] = useState(false)

  return (
    <>
      <div data-testid="ContentMetadata" className="z-10 relative pt-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 md:gap-0 md:flex-row justify-between">
            <div>
              <h4 className="text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-red-100/70">
                {labelText}
              </h4>
              <h1 className="text-2xl xl:text-3xl 2xl:text-4xl font-bold mb-0">
                {title}
              </h1>
            </div>
            <button
              onClick={() => setShowDownload(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-gray-900 font-bold uppercase tracking-wider bg-white hover:bg-[#cb333b] hover:text-white transition-colors duration-200 text-sm cursor-pointer max-h-10"
            >
              <Download2 className="w-4 h-4" />
              {t('Download')}
            </button>
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
      <DownloadDialog
        open={showDownload}
        onClose={() => setShowDownload(false)}
      />
    </>
  )
}
