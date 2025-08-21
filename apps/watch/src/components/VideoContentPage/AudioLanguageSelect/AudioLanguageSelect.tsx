import AddOutlined from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined'
import LanguageOutlined from '@mui/icons-material/LanguageOutlined'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'

import { Select, SelectTrigger, SelectValue } from '../../Select'

import { useVideo } from '../../../libs/videoContext'

const DynamicAudoLanguageSelectContent = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "AudoLanguageSelectContent" */
      './AudoLanguageSelectContent'
    ).then((mod) => mod.AudoLanguageSelectContent)
)

export function AudioLanguageSelect(): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { variant, variantLanguagesCount } = useVideo()
  const [open, setOpen] = useState<boolean | null>(null)

  const nativeName = variant?.language?.name.find(
    ({ primary }) => !primary
  )?.value
  const localName = variant?.language?.name.find(
    ({ primary }) => primary
  )?.value

  return (
    <Select
      value={variant?.id}
      data-testid="AudioLanguageSelect"
      onOpenChange={(open) => {
        setOpen(open)
      }}
    >
      <SelectTrigger
        onMouseEnter={() => setOpen(false)}
        data-testid="AudioLanguageSelectTrigger"
        className={`
          border-none
          bg-transparent
          p-0
          h-auto
          shadow-none
          hover:bg-transparent
          focus:outline-none
          focus:ring-0
          focus:ring-offset-0
          focus:border-0
          cursor-pointer
          [&>svg]:hidden
          focus-visible:outline-none
          focus-visible:ring-0
          focus-visible:ring-offset-0
          focus-visible:border-0
        `}
      >
        <div className="flex items-center gap-1">
          <LanguageOutlined fontSize="small" className="text-white" />
          <SelectValue>
            <span
              className={`
                text-base
                font-semibold
                text-white
                truncate
                overflow-hidden
                whitespace-nowrap
                font-sans
                leading-tight
              `}
            >
              {localName ?? nativeName}
            </span>
          </SelectValue>
          <div className="hidden lg:flex items-center gap-1">
            <AddOutlined fontSize="small" className="text-white" />
            <span
              className={`
                text-base
                font-semibold
                text-white
                whitespace-nowrap
                font-sans
                leading-tight
              `}
            >
              {t('{{ languageCount }} Languages', {
                languageCount: variantLanguagesCount - 1
              })}
            </span>
          </div>
          <KeyboardArrowDownOutlined fontSize="small" className="text-white" />
        </div>
      </SelectTrigger>
      {open != null && <DynamicAudoLanguageSelectContent />}
    </Select>
  )
}
