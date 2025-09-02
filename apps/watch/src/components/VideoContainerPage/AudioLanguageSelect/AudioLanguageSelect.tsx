import AddOutlined from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined'
import LanguageOutlined from '@mui/icons-material/LanguageOutlined'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo, useState } from 'react'

import { useLanguages } from '../../../libs/useLanguages'
import { useWatch } from '../../../libs/watchContext'
import { Select, SelectTrigger, SelectValue } from '../../Select'

const DynamicAudioLanguageSelectContent = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "AudioLanguageSelectContent" */
      './AudioLanguageSelectContent'
    ).then((mod) => mod.AudioLanguageSelectContent)
)

export function AudioLanguageSelect(): ReactElement {
  const { t } = useTranslation('apps-watch')

  const {
    state: { audioLanguageId, videoAudioLanguageIds }
  } = useWatch()
  const [open, setOpen] = useState<boolean | null>(null)
  const { languages } = useLanguages()
  const language = useMemo(
    () => languages.find(({ id }) => id === audioLanguageId),
    [languages, audioLanguageId]
  )

  return (
    <Select
      value={audioLanguageId}
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
              {language?.displayName}
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
                languageCount: videoAudioLanguageIds?.length ?? 0
              })}
            </span>
          </div>
          <KeyboardArrowDownOutlined fontSize="small" className="text-white" />
        </div>
      </SelectTrigger>
      {open != null && <DynamicAudioLanguageSelectContent />}
    </Select>
  )
}
