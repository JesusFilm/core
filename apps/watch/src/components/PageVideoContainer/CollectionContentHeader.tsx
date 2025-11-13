import { Share2 } from 'lucide-react'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { ExtendedButton } from '@core/shared/uimodern'

import { AudioLanguageSelect } from './AudioLanguageSelect'

interface CollectionContentHeaderProps {
  label: string
  childCountLabel: string
  onShare: () => void
}

export function CollectionContentHeader({
  label,
  childCountLabel,
  onShare
}: CollectionContentHeaderProps): ReactElement {
  const { t } = useTranslation('apps-watch')

  return (
    <div
      data-testid="CollectionContentHeader"
      className="flex z-2 py-6 responsive-container relative"
    >
      <div className="w-full">
        <div className="flex flex-col gap-6">
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex flex-row items-center space-x-4">
              <span className="uppercase text-sm tracking-[0.2em] text-primary font-semibold">
                {label}
              </span>
              <p
                className="uppercase text-sm tracking-wider text-[#bbbcbc] hidden xl:block font-bold"
                aria-hidden="true"
              >
                •
              </p>
              <div className="uppercase text-sm tracking-wider text-[#bbbcbc] hidden xl:block">
                {childCountLabel}
              </div>
            </div>
            <div className="uppercase text-xs tracking-wider text-[#bbbcbc] block xl:hidden">
              {childCountLabel}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="w-full sm:w-auto">
              <AudioLanguageSelect />
            </div>
            <ExtendedButton
              variant="outline"
              onClick={onShare}
              className="w-full sm:w-auto"
            >
              <Share2 className="h-4 w-4" />
              {t('Share')}
            </ExtendedButton>
          </div>
        </div>
      </div>
    </div>
  )
}
