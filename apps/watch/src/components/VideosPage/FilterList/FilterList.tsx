import SubtitlesIcon from '@mui/icons-material/Subtitles'
import TitleIcon from '@mui/icons-material/Title'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'
import { SubmitListener } from '@core/shared/ui/SubmitListener'

import { GetLanguages } from '../../../../__generated__/GetLanguages'
import { VideoPageFilter } from '../utils/getQueryParameters'

import { useRefinementList, useSearchBox } from 'react-instantsearch'
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
  onChange: (filter: VideoPageFilter) => void
  languagesData?: GetLanguages
  languagesLoading: boolean
}

export function FilterList({
  filter,
  onChange,
  languagesData,
  languagesLoading
}: FilterListProps): ReactElement {
  const { t } = useTranslation()

  const { refine } = useSearchBox()
  const { items: languageItems, refine: refineLanguages } = useRefinementList({
    attribute: 'languageId',
    limit: 5000
  })
  const { items: subtitleItems, refine: refineSubtitles } = useRefinementList({
    attribute: 'subtitles',
    limit: 5000
  })

  function filteredLanguages() {
    const languagesMap = new Map(
      languagesData?.languages.map((language) => [language.id, language])
    )
    return languageItems
      .map((item) => languagesMap.get(item.value))
      .filter((language) => language !== undefined)
  }

  function filteredSubtitles() {
    const selectedSubtitles = languagesData?.languages.filter((language) =>
      subtitleLanguageIds.includes(language.id)
    )
    const subtitlesMap = new Map(
      selectedSubtitles?.map((language) => [language.id, language])
    )
    return subtitleItems
      .map((item) => subtitlesMap.get(item.value))
      .filter((subtitle) => subtitle !== undefined)
  }

  const languages = filteredLanguages()
  const subtitles = filteredSubtitles()

  function languageOptionFromIds(ids?: string[]): LanguageOption {
    if (ids == null || ids.length === 0) return { id: '' }

    const language = languagesData?.languages.find(
      (language) => language.id === ids[0]
    )

    if (language != null) {
      return {
        id: language.id,
        localName: language.name.find(({ primary }) => !primary)?.value,
        nativeName: language.name.find(({ primary }) => primary)?.value
      }
    }

    return { id: '' }
  }

  const initialValues = {
    language: languageOptionFromIds(filter.availableVariantLanguageIds),
    subtitleLanguage: languageOptionFromIds(filter.subtitleLanguageIds),
    title: filter.title ?? ''
  }

  function handleSubmit(values: typeof initialValues): void {
    onChange({
      availableVariantLanguageIds:
        values.language != null && values.language.id !== ''
          ? [values.language.id]
          : undefined,
      subtitleLanguageIds:
        values.subtitleLanguage != null && values.subtitleLanguage.id !== ''
          ? [values.subtitleLanguage.id]
          : undefined,
      title:
        values.title != null && values.title !== '' ? values.title : undefined
    })

    if (values.title != null) refine(values.title)
    if (values.language != null) refineLanguages(values.language.id)
    if (values.subtitleLanguage != null)
      refineSubtitles(values.subtitleLanguage.id)
  }

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
