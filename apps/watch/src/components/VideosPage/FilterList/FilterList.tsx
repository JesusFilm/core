import SubtitlesIcon from '@mui/icons-material/Subtitles'
import TitleIcon from '@mui/icons-material/Title'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Formik } from 'formik'
import debounce from 'lodash/debounce'
import noop from 'lodash/noop'
import { useTranslation } from 'next-i18next'
import { type ReactElement, useMemo, useState } from 'react'
import { useMenu, useSearchBox } from 'react-instantsearch'

import type { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'
import { SubmitListener } from '@core/shared/ui/SubmitListener'

import type { GetLanguages } from '../../../../__generated__/GetLanguages'
import { useAlgoliaRouter } from '../../../libs/algolia/useAlgoliaRouter'
import { SUBTITLE_LANGUAGE_IDS } from '../../../libs/localeMapping/subtitleLanguageIds'

import { LanguagesFilter } from './LanguagesFilter'

interface FilterListProps {
  languagesData?: GetLanguages
  languagesLoading: boolean
}

export function FilterList({
  languagesData,
  languagesLoading
}: FilterListProps): ReactElement {
  const { t } = useTranslation()

  const { query, languageId, subtitleId } = useAlgoliaRouter()
  const { refine: refineSearch } = useSearchBox()
  const { refine: refineLanguages } = useMenu({
    attribute: 'languageId'
  })
  const { refine: refineSubtitles } = useMenu({
    attribute: 'subtitles'
  })

  const subtitleLanguages = languagesData?.languages.filter((language) =>
    SUBTITLE_LANGUAGE_IDS.includes(language.id)
  )

  const languagesMap = useMemo(
    () => new Map(languagesData?.languages.map((lang) => [lang.id, lang])),
    [languagesData]
  )

  const languageOptionFromIds = (ids?: string[]): LanguageOption => {
    if (ids == null || languagesMap.size === 0) return { id: '' }
    const language = languagesMap.get(ids[0])
    if (language == null) return { id: '' }
    return {
      id: language.id,
      localName: language.name.find(({ primary }) => !primary)?.value,
      nativeName: language.name.find(({ primary }) => primary)?.value
    }
  }

  const [title, setTitle] = useState(query ?? '')

  const initialValues = useMemo(
    () => ({
      language: languageOptionFromIds([languageId ?? '']),
      subtitleLanguage: languageOptionFromIds([subtitleId ?? ''])
    }),
    [languagesMap]
  )

  const handleLanguageChange =
    (setFieldValue) => async (value?: LanguageOption | undefined) => {
      if (value?.id !== undefined && value?.id !== languageId) {
        refineLanguages(value?.id)
        await setFieldValue('language', value)
      }
    }

  const handleSubtitleChange =
    (setFieldValue) => async (value?: LanguageOption | undefined) => {
      if (value?.id !== undefined && value?.id !== subtitleId) {
        refineSubtitles(value?.id)
        await setFieldValue('subtitleLanguage', value)
      }
    }

  function handleTitleChange(value: string): void {
    setTitle(value)
    debounce((value) => {
      refineSearch(value)
    }, 300)(value)
  }

  return (
    <Formik initialValues={initialValues} onSubmit={noop} enableReinitialize>
      {({ values, setFieldValue, handleBlur }) => (
        <Stack data-testid="FilterList" gap={4}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <VolumeUpIcon />
              <Typography variant="h6">{t('Languages')}</Typography>
            </Stack>
            <LanguagesFilter
              onChange={handleLanguageChange(setFieldValue)}
              value={values.language}
              languages={languagesData?.languages}
              loading={languagesLoading}
            />
          </Stack>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <SubtitlesIcon />
              <Typography variant="h6">{t('Subtitles')}</Typography>
            </Stack>
            <LanguagesFilter
              onChange={handleSubtitleChange(setFieldValue)}
              value={values.subtitleLanguage}
              languages={subtitleLanguages}
              loading={languagesLoading}
              helperText={`${subtitleLanguages?.length ?? 53} languages`}
            />
          </Stack>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TitleIcon />
              <Typography variant="h6">{t('Title')}</Typography>
            </Stack>
            <TextField
              value={title}
              name="title"
              type="search"
              onChange={(e) => {
                handleTitleChange(e.target.value)
              }}
              onBlur={handleBlur}
              label="Search Titles"
              variant="outlined"
              helperText="724+ titles"
              fullWidth
            />
          </Stack>
          <SubmitListener />
        </Stack>
      )}
    </Formik>
  )
}
