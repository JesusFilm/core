import SubtitlesIcon from '@mui/icons-material/Subtitles'
import TitleIcon from '@mui/icons-material/Title'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { type ReactElement, useMemo } from 'react'
import { useMenu, useSearchBox } from 'react-instantsearch'

import type { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'
import { SubmitListener } from '@core/shared/ui/SubmitListener'

import type { GetLanguages } from '../../../../__generated__/GetLanguages'
import { useAlgoliaRouter } from '../../../libs/algolia/useAlgoliaRouter'

import { LanguagesFilter } from './LanguagesFilter'

const subtitleLanguageIds = [
  '411',
  '448',
  '483',
  '494',
  '496',
  '529',
  '531',
  '584',
  '1106',
  '1109',
  '1112',
  '1269',
  '1341',
  '1942',
  '1964',
  '3804',
  '3887',
  '3934',
  '3964',
  '3974',
  '4415',
  '4432',
  '4601',
  '4820',
  '4823',
  '5541',
  '5545',
  '5546',
  '5563',
  '6464',
  '6788',
  '7083',
  '7698',
  '16639',
  '20601',
  '20770',
  '21028',
  '21046',
  '21064',
  '21753',
  '21754',
  '22500',
  '22658',
  '23178',
  '53299',
  '53424',
  '139081',
  '139089',
  '140126',
  '184497',
  '184498',
  '184506',
  '184528'
]

interface FilterListProps {
  languagesData?: GetLanguages
  languagesLoading: boolean
}

function getHelperText(languages): string {
  return languages.length < 1000
    ? `${languages.length} languages`
    : '1000+ languages'
}

export function FilterList({
  languagesData,
  languagesLoading
}: FilterListProps): ReactElement {
  const { t } = useTranslation()

  const { query, languageId, subtitleId } = useAlgoliaRouter()
  const { refine: refineSearch } = useSearchBox()
  const { items: languageItems, refine: refineLanguages } = useMenu({
    attribute: 'languageId',
    limit: 5000
  })
  const { items: subtitleItems, refine: refineSubtitles } = useMenu({
    attribute: 'subtitles',
    limit: 5000
  })

  const languagesMap = useMemo(
    () => new Map(languagesData?.languages.map((lang) => [lang.id, lang])),
    [languagesData]
  )

  const languages = useMemo(
    () =>
      languageItems
        .map((item) => languagesMap.get(item.value))
        .filter((lang): lang is NonNullable<typeof lang> => lang !== undefined),
    [languageItems, languagesMap]
  )

  const subtitles = useMemo(
    () =>
      subtitleItems
        .map((item) => languagesMap.get(item.value))
        .filter(
          (lang): lang is NonNullable<typeof lang> =>
            lang !== undefined && subtitleLanguageIds.includes(lang.id)
        ),
    [subtitleItems, languagesMap]
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

  const initialValues = useMemo(
    () => ({
      title: query ?? '',
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

  const handleTitleChange = (values: typeof initialValues): void => {
    refineSearch(values.title)
  }

  return (
    <Formik
      initialValues={initialValues}
      handleSubmit={handleTitleChange}
      onSubmit={handleTitleChange}
      enableReinitialize
    >
      {({ values, setFieldValue, handleChange, handleBlur }) => (
        <Stack data-testid="FilterList" gap={4}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <VolumeUpIcon />
              <Typography>{t('Languages')}</Typography>
            </Stack>
            <LanguagesFilter
              onChange={handleLanguageChange(setFieldValue)}
              value={values.language}
              languages={languages}
              loading={languagesLoading}
              helperText={getHelperText(languages)}
            />
          </Stack>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <SubtitlesIcon />
              <Typography>{t('Subtitles')}</Typography>
            </Stack>
            <LanguagesFilter
              onChange={handleSubtitleChange(setFieldValue)}
              value={values.subtitleLanguage}
              languages={subtitles}
              loading={languagesLoading}
              helperText={getHelperText(subtitles)}
            />
          </Stack>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TitleIcon />
              <Typography>{t('Title')}</Typography>
            </Stack>
            <TextField
              value={values.title}
              name="title"
              type="search"
              onChange={handleChange}
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
