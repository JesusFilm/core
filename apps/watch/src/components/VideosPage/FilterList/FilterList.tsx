import SubtitlesIcon from '@mui/icons-material/Subtitles'
import TitleIcon from '@mui/icons-material/Title'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Formik } from 'formik'
import noop from 'lodash/noop'
import { useRouter } from 'next/compat/router'
import { useTranslation } from 'next-i18next'
import { type ChangeEvent, type ReactElement, useEffect, useMemo } from 'react'
import { useMenu, useSearchBox } from 'react-instantsearch'

import type { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'
import { SubmitListener } from '@core/shared/ui/SubmitListener'

import type { GetLanguages } from '../../../../__generated__/GetLanguages'

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

interface FilterParams {
  query: string | null
  languageId: string | null
  subtitleId: string | null
}

function extractQueryParams(url: string): FilterParams {
  const params = new URLSearchParams(url.split('?')[1])
  const query = params.get('query')
  const languageId = params.get('menu[languageId]')
  const subtitleId = params.get('menu[subtitles]')
  return { query, languageId, subtitleId }
}

interface FilterListProps {
  languagesData?: GetLanguages
  languagesLoading: boolean
}

export function FilterList({
  languagesData,
  languagesLoading
}: FilterListProps): ReactElement {
  const { t } = useTranslation()

  const router = useRouter()
  const decodedUrl = decodeURIComponent(router?.asPath ?? '')
  const { query, languageId, subtitleId } = extractQueryParams(decodedUrl)

  const { refine: refineSearch } = useSearchBox()
  const { refine: refineLanguages } = useMenu({
    attribute: 'languageId'
  })
  const { refine: refineSubtitles } = useMenu({
    attribute: 'subtitles'
  })

  useEffect(() => {
    if (languageId == null) {
      refineLanguages('529')
    }
  }, [languageId, refineLanguages])

  const subtitleLanguages = languagesData?.languages.filter((language) =>
    subtitleLanguageIds.includes(language.id)
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
      if (value?.id !== undefined) {
        if (value?.id !== languageId) {
          refineLanguages(value?.id)
          await setFieldValue('language', value)
        } else if (languageId === '529') {
          await setFieldValue('language', value)
        }
      }
    }

  const handleSubtitleChange =
    (setFieldValue) => async (value?: LanguageOption | undefined) => {
      if (value?.id !== undefined && value?.id !== subtitleId) {
        refineSubtitles(value?.id)
        await setFieldValue('subtitleLanguage', value)
      }
    }

  const handleTitleChange =
    (setFieldValue) => (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      refineSearch(value)
      setFieldValue(name, value)
    }

  return (
    <Formik initialValues={initialValues} onSubmit={noop} enableReinitialize>
      {({ values, setFieldValue, handleBlur }) => (
        <Stack data-testid="FilterList" gap={4}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <VolumeUpIcon />
              <Typography>{t('Languages')}</Typography>
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
              <Typography>{t('Subtitles')}</Typography>
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
              <Typography>{t('Title')}</Typography>
            </Stack>
            <TextField
              value={values.title}
              name="title"
              onChange={handleTitleChange(setFieldValue)}
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
