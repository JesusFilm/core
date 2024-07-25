import SubtitlesIcon from '@mui/icons-material/Subtitles'
import TitleIcon from '@mui/icons-material/Title'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useMemo } from 'react'
import {
  useClearRefinements,
  useRefinementList,
  useSearchBox
} from 'react-instantsearch'

import { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'
import { SubmitListener } from '@core/shared/ui/SubmitListener'
import { GetLanguages } from '../../../../__generated__/GetLanguages'
import { VideoPageFilter } from '../utils/getQueryParameters'
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
  filter: VideoPageFilter
  languagesData?: GetLanguages
  languagesLoading: boolean
}

export function FilterList({
  filter,
  languagesData,
  languagesLoading
}: FilterListProps): ReactElement {
  const { t } = useTranslation()
  const router = useRouter()
  const { refine } = useClearRefinements({
    includedAttributes: ['languageId', 'subtitles']
  })
  const { refine: refineSearch } = useSearchBox()
  const { items: languageItems, refine: refineLanguages } = useRefinementList({
    attribute: 'languageId',
    limit: 5000
  })
  const { items: subtitleItems, refine: refineSubtitles } = useRefinementList({
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
    if (!ids?.length || !languagesMap) return { id: '' }
    const language = languagesMap.get(ids[0])
    if (!language) return { id: '' }
    return {
      id: language.id,
      localName: language.name.find(({ primary }) => !primary)?.value,
      nativeName: language.name.find(({ primary }) => primary)?.value
    }
  }

  const initialValues = {
    language: languageOptionFromIds(filter.availableVariantLanguageIds),
    subtitleLanguage: languageOptionFromIds(filter.subtitleLanguageIds),
    title: filter.title ?? ''
  }

  function handleRefine({
    title,
    languageId,
    subtitleLanguageId
  }: {
    title: string
    languageId: string
    subtitleLanguageId: string
  }): void {
    if (title) refineSearch(title)
    if (languageId) {
      refine()
      refineLanguages(languageId)
    }
    if (subtitleLanguageId) {
      refine()
      refineSubtitles(subtitleLanguageId)
    }
  }

  function handleSubmit(values: typeof initialValues): void {
    const params = new URLSearchParams(router.query as Record<string, string>)
    const setQueryParam = (name: string, value?: string | null) =>
      value ? params.set(name, value) : params.delete(name)

    setQueryParam('languages', values.language.id)
    setQueryParam('subtitles', values.subtitleLanguage.id)
    setQueryParam('title', values.title)

    void router.push(`/watch/videos?${params.toString()}`, undefined, {
      shallow: true
    })
    handleRefine({
      title: values.title,
      languageId: values.language.id,
      subtitleLanguageId: values.subtitleLanguage.id
    })
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    handleRefine({
      title: initialValues.title,
      languageId: initialValues.language.id,
      subtitleLanguageId: initialValues.subtitleLanguage.id
    })
  }, [])

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
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
              onChange={async (language) =>
                await setFieldValue('language', language)
              }
              value={values.language}
              languages={languages}
              loading={languagesLoading}
              helperText={`${languages.length} languages`}
            />
          </Stack>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <SubtitlesIcon />
              <Typography>{t('Subtitles')}</Typography>
            </Stack>
            <LanguagesFilter
              onChange={async (subtitleLanguage) =>
                await setFieldValue('subtitleLanguage', subtitleLanguage)
              }
              value={values.subtitleLanguage}
              languages={subtitles}
              loading={languagesLoading}
              helperText={`${subtitles.length} languages`}
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
