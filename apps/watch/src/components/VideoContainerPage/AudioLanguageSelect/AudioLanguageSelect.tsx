import AddOutlined from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined'
import LanguageOutlined from '@mui/icons-material/LanguageOutlined'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo, useState } from 'react'

import { useLanguages } from '../../../libs/useLanguages'
import { useVideo } from '../../../libs/videoContext'
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
    state: { videoAudioLanguageIds }
  } = useWatch()
  const [open, setOpen] = useState<boolean | null>(null)
  const { languages } = useLanguages()
  const { variant } = useVideo()
  const language = useMemo(
    () => languages.find(({ id }) => id === variant?.language?.id),
    [languages, variant]
  )

  return (
    <Select
      value={language?.id}
      data-testid="AudioLanguageSelect"
      onOpenChange={(open) => {
        setOpen(open)
      }}
    >
      <SelectTrigger
        onMouseEnter={() => setOpen(false)}
        data-testid="AudioLanguageSelectTrigger"
        className={`h-auto cursor-pointer border-none bg-transparent p-0 shadow-none hover:bg-transparent focus:border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none [&>svg]:hidden`}
      >
        <div className="flex items-center gap-1">
          <LanguageOutlined fontSize="small" className="text-white" />
          <SelectValue>
            <span
              className={`truncate overflow-hidden font-sans text-base leading-tight font-semibold whitespace-nowrap text-white`}
            >
              {language?.displayName}
            </span>
          </SelectValue>
          <div className="hidden items-center gap-1 lg:flex">
            <AddOutlined fontSize="small" className="text-white" />
            <span
              className={`font-sans text-base leading-tight font-semibold whitespace-nowrap text-white`}
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
